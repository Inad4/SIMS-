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

    public EquipmentController(SharedDbContext context, UserManager<User> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Equipment>>> GetEquipment(
        [FromQuery] string? searchTerm,
        [FromQuery] string? typeFilter,
        [FromQuery] int? roomFilter)
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

        if (roomFilter.HasValue)
        {
            query = query.Where(e => e.Room == roomFilter.Value);
        }
        query = query.Where(e => e.Room == roomFilter);

        return await query.ToListAsync();
    }

    [HttpGet("all")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<IEnumerable<Equipment>>> GetAllEquipment()
    {
        return await _context.Equipment.ToListAsync();
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

        var existingEquipment = await _context.Equipment.FindAsync(id);
        if (existingEquipment == null)
        {
            return NotFound();
        }

        existingEquipment.Name = equipment.Name;
        existingEquipment.Type = equipment.Type;
        existingEquipment.SerialNumber = equipment.SerialNumber;
        existingEquipment.Room = equipment.Room;
        existingEquipment.Condition = equipment.Condition;

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
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeleteEquipment(int id)
    {
        var equipment = await _context.Equipment.FindAsync(id);
        if (equipment == null)
        {
            return NotFound();
        }

        _context.Equipment.Remove(equipment);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool EquipmentExists(int id)
    {
        return _context.Equipment.Any(e => e.Id == id);
    }
}
