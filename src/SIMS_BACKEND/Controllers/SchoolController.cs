using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedModels;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SchoolController : ControllerBase
{
    private readonly SharedDbContext _context;

    public SchoolController(SharedDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Policy = "AdminOnly")] 
    public async Task<ActionResult<IEnumerable<School>>> GetSchool()
    {
        return await _context.Schools.ToListAsync();
    }

    [HttpGet("my")]
    [Authorize(Policy = "SchoolAdmin")] 
    public async Task<ActionResult<School>> GetMySchool()
    {
        var schoolId = int.Parse(User.FindFirst("SchoolId").Value);
        var school = await _context.Schools.FindAsync(schoolId);

        if (school == null)
        {
            return NotFound();
        }

        return school;
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "AdminOnly")] 
    public async Task<ActionResult<School>> GetSchool(int id)
    {
        var school = await _context.Schools.FindAsync(id);

        if (school == null)
        {
            return NotFound();
        }

        return school;
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")] 
    public async Task<ActionResult<School>> CreateSchool(School school)
    {
        school.CreatedAt = DateTime.UtcNow;
        _context.Schools.Add(school);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSchool), new { id = school.Id }, school);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSchool(int id, School school)
    {
        if (id != school.Id)
        {
            return BadRequest();
        }


        var isGlobalAdmin = User.IsInRole("Admin");
        var isSchoolAdmin = User.IsInRole("SchoolAdmin");
        var schoolId = int.Parse(User.FindFirst("SchoolId").Value);

        if (!isGlobalAdmin && (isSchoolAdmin && schoolId != id))
        {
            return Forbid();
        }

        var existingSchool = await _context.Schools.FindAsync(id);
        if (existingSchool == null)
        {
            return NotFound();
        }

        existingSchool.Name = school.Name;
        existingSchool.City = school.City;
        existingSchool.Address = school.Address;
        existingSchool.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!SchoolExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")] 
    public async Task<IActionResult> DeleteSchool(int id)
    {
        var school = await _context.Schools.FindAsync(id);
        if (school == null)
        {
            return NotFound();
        }

        _context.Schools.Remove(school);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool SchoolExists(int id)
    {
        return _context.Schools.Any(e => e.Id == id);
    }
}
