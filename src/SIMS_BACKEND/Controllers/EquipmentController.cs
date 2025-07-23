using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedModels;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EquipmentController : ControllerBase
{
    private readonly SharedDbContext _context;
    private readonly UserManager<User> _userManager;
    private readonly IReportsService _reportsService;

    public EquipmentController(
        SharedDbContext context,
        UserManager<User> userManager,
        IReportsService reportsService)
    {
        _context = context;
        _userManager = userManager;
        _reportsService = reportsService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Equipment>>> GetEquipment(
        [FromQuery] string? searchTerm,
        [FromQuery] string? typeFilter,
        [FromQuery] int? roomFilter,
        [FromQuery] string? serialnumberFilter,
        [FromQuery] string? conditionFilter)
    {
        var query = _context.Equipment
            .Where(e => e.Condition == EquipmentCondition.AVAILABLE);

        if (!string.IsNullOrEmpty(searchTerm))
        {
            query = query.Where(e => e.Name.Contains(searchTerm) ||
                              e.SerialNumber.Contains(searchTerm));
        }

        if (!string.IsNullOrEmpty(typeFilter))
        {
            query = query.Where(e => e.Type == typeFilter);
        }

        if (!string.IsNullOrEmpty(serialnumberFilter))
        {
            query = query.Where(e => e.SerialNumber == serialnumberFilter);
        }

        if (!string.IsNullOrEmpty(statusFilter))
        {
            if (Enum.TryParse<EquipmentStatus>(statusFilter, out var parsedStatus))
            {
                query = query.Where(e => e.Status == parsedStatus);
            }
            else
            {
                return BadRequest("Invalid status filter value.");
            }
        }

        if (!string.IsNullOrEmpty(serialnumberFilter))
        {
            query = query.Where(e => e.SerialNumber == serialnumberFilter);
        }

        if (!string.IsNullOrEmpty(conditionFilter))
        {
            if (Enum.TryParse<EquipmentCondition>(conditionFilter, out var parsedCondition))
            {
                query = query.Where(e => e.Condition == parsedCondition);
            }
            else
            {
                return BadRequest("Invalid condition filter value.");
            }
        }

        if (roomFilter.HasValue)
        {
            query = query.Where(e => e.Room == roomFilter.Value);
        }

        return await query.ToListAsync();
    }

    // Get single equipment item
    [HttpGet("{id}")]
    public async Task<ActionResult<Equipment>> GetEquipmentById(int id)
    {
        var schoolId = int.Parse(User.FindFirst("SchoolId").Value);
        var equipment = await _context.Equipment
            .Include(e => e.Requests)
            .ThenInclude(r => r.User)
            .FirstOrDefaultAsync(e => e.Id == id && e.SchoolId == schoolId);

        if (equipment == null)
        {
            return NotFound();
        }

        return equipment;
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<Equipment>> AddEquipment(Equipment equipment)
    {
        equipment.Condition = EquipmentCondition.AVAILABLE;
        _context.Equipment.Add(equipment);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetEquipment), new { id = equipment.Id }, equipment);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateEquipment(int id, Equipment equipment)
    {
        if (id != equipment.Id)
        {
            return BadRequest();
        }

        var schoolId = int.Parse(User.FindFirst("SchoolId").Value);
        var existingEquipment = await _context.Equipment
            .FirstOrDefaultAsync(e => e.Id == id && e.SchoolId == schoolId);

        if (existingEquipment == null)
        {
            return NotFound();
        }

        existingEquipment.Name = equipment.Name;
        existingEquipment.Type = equipment.Type;
        existingEquipment.SerialNumber = equipment.SerialNumber;
        existingEquipment.Room = equipment.Room;
        existingEquipment.Status = equipment.Status;
        existingEquipment.PathToPhoto = equipment.PathToPhoto;
        existingEquipment.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!EquipmentExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeleteEquipment(int id)
    {
        var schoolId = int.Parse(User.FindFirst("SchoolId").Value);
        var equipment = await _context.Equipment
            .FirstOrDefaultAsync(e => e.Id == id && e.SchoolId == schoolId);

        if (equipment == null)
        {
            return NotFound();
        }

        _context.Equipment.Remove(equipment);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("export/csv")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> ExportEquipmentToCsv(
        [FromQuery] string? searchTerm,
        [FromQuery] string? typeFilter,
        [FromQuery] int? roomFilter,
        [FromQuery] string? serialnumberFilter,
        [FromQuery] string? conditionFilter)
    {
        var query = ApplyFilters(_context.Equipment,
            searchTerm, typeFilter, roomFilter, serialnumberFilter, conditionFilter);

        var equipment = await query.ToListAsync();
        var csvBytes = await _reportsService.GenerateEquipmentCsvReport(equipment);

        return File(csvBytes, "text/csv", $"equipment_report_{DateTime.UtcNow:yyyyMMdd}.csv");
    }

    [HttpGet("export/pdf")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> ExportEquipmentToPdf(
        [FromQuery] string? searchTerm,
        [FromQuery] string? typeFilter,
        [FromQuery] int? roomFilter,
        [FromQuery] string? serialnumberFilter,
        [FromQuery] string? conditionFilter)
    {
        var query = ApplyFilters(_context.Equipment,
            searchTerm, typeFilter, roomFilter, serialnumberFilter, conditionFilter);

        var equipment = await query.ToListAsync();
        var pdfBytes = await _reportsService.GenerateEquipmentPdfReport(equipment);

        return File(pdfBytes, "application/pdf", $"equipment_report_{DateTime.UtcNow:yyyyMMdd}.pdf");
    }

    private IQueryable<Equipment> ApplyFilters(
        IQueryable<Equipment> query,
        string? searchTerm,
        string? typeFilter,
        int? roomFilter,
        string? serialnumberFilter,
        string? conditionFilter)
    {
        if (!string.IsNullOrEmpty(searchTerm))
        {
            query = query.Where(e => e.Name.Contains(searchTerm) ||
                              e.SerialNumber.Contains(searchTerm));
        }

        if (!string.IsNullOrEmpty(typeFilter))
        {
            query = query.Where(e => e.Type == typeFilter);
        }

        if (!string.IsNullOrEmpty(serialnumberFilter))
        {
            query = query.Where(e => e.SerialNumber == serialnumberFilter);
        }

        if (!string.IsNullOrEmpty(conditionFilter))
        {
            if (Enum.TryParse<EquipmentCondition>(conditionFilter, out var parsedCondition))
            {
                query = query.Where(e => e.Condition == parsedCondition);
            }
        }

        if (roomFilter.HasValue)
        {
            query = query.Where(e => e.Room == roomFilter.Value);
        }

        return query;
    }

    private bool EquipmentExists(int id)
    {
        return _context.Equipment.Any(e => e.Id == id);
    }
}