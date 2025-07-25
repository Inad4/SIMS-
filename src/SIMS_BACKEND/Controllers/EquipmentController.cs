using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedModels;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class EquipmentController : ControllerBase
{
    private readonly SharedDbContext _context;
    private readonly UserManager<User> _userManager;

    public EquipmentController(
        SharedDbContext context,
        UserManager<User> userManager)
    {
        _context = context;
        _userManager = userManager;
    }



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
    public async Task<ActionResult<Equipment>> AddEquipment(Equipment equipment)
    {
        if (!Enum.IsDefined(typeof(EquipmentStatus), equipment.Status))
        {
            return BadRequest("Invalid status value.");
        }
        equipment.CreatedAt = DateTime.UtcNow;
        equipment.SchoolId = int.Parse(User.FindFirst("SchoolId").Value);

        _context.Equipment.Add(equipment);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetEquipmentById), new { id = equipment.Id }, equipment);
    }

    [HttpPut("{id}")]
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

    private bool EquipmentExists(int id)
    {
        return _context.Equipment.Any(e => e.Id == id);
    }
}
