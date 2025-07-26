using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedModels;
using System.Net;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RequestsController : ControllerBase
{
    private readonly SharedDbContext _context;
    private readonly UserManager<User> _userManager;

    public RequestsController(SharedDbContext context, UserManager<User> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    [HttpPost]
    [Authorize(Policy = "UserOnly")]
    public async Task<ActionResult<Request>> CreateRequest([FromBody] CreateRequestDto requestDto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
        {
            return Unauthorized();
        }

        var equipment = await _context.Equipment
            .Where(e => requestDto.EquipmentIds.Contains(e.Id))
            .ToListAsync();

        if (equipment.Count != requestDto.EquipmentIds.Count)
        {
            return BadRequest("Some equipment items were not found");
        }

        var request = new Request
        {
            Message = requestDto.Message,
            Status = RequestStatus.PENDING,
            UserId = userId,
            Equipment = equipment,
            CreatedAt = DateTime.UtcNow
        };

        _context.Requests.Add(request);

        foreach (var item in equipment)
        {
            item.Condition = EquipmentCondition.CHECKED_OUT;
        }

        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(Request), new { id = request.Id }, request);
    }

    [HttpGet("my")]
    [Authorize(Policy = "UserOnly")]
    public async Task<ActionResult<IEnumerable<Request>>> GetMyRequests()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return await _context.Requests
            .Include(r => r.Equipment)
            .Where(r => r.UserId == userId)
            .ToListAsync();
    }

    [HttpGet("pending")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<IEnumerable<Request>>> GetPendingRequests()
    {
        return await _context.Requests
            .Include(r => r.Equipment)
            .Include(r => r.User)
            .Where(r => r.Status == RequestStatus.PENDING)
            .ToListAsync();
    }

    [HttpPut("{id}/approve")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> ApproveRequest(int id)
    {
        var request = await _context.Requests
            .Include(r => r.Equipment)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (request == null)
        {
            return NotFound();
        }

        request.Status = RequestStatus.APPROVED;
        await _context.SaveChangesAsync();

        return NoContent();
    }
    
    [HttpPut("{id}/reject")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> RejectRequest(int id, [FromBody] string? rejectionReason)
    {
        var request = await _context.Requests
            .Include(r => r.Equipment)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (request == null)
        {
            return NotFound();
        }

        request.Status = RequestStatus.REJECTED;
        request.Message = $"REJECTED: {rejectionReason ?? "No reason provided"}. Original request: {request.Message}";

     
        foreach (var equipment in request.Equipment)
        {
            equipment.Condition = EquipmentCondition.AVAILABLE;
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }


    [HttpPut("{id}/return")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> ReturnRequest(int id, [FromBody] EquipmentCondition condition)
    {
        var request = await _context.Requests
            .Include(r => r.Equipment)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (request == null)
        {
            return NotFound();
        }

        request.Status = RequestStatus.RETURNED;
        request.ReturnedAt = DateTime.UtcNow;

        foreach (var equipment in request.Equipment)
        {
            equipment.Condition = condition == EquipmentCondition.UNDER_REPAIR
                ? EquipmentCondition.AVAILABLE
                : EquipmentCondition.RETIRED;
            equipment.Condition = condition;
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class CreateRequestDto
{
    public List<int> EquipmentIds { get; set; } = new List<int>();
    public string Message { get; set; } = string.Empty;
}

