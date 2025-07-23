using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedModels;
using System.Security.Claims;
using SIMS_BACKEND.Dto;

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


        var unavailableItems = equipment.Where(e => e.Status != EquipmentStatus.AVAILABLE).ToList();
        if (unavailableItems.Any())
        {
            return BadRequest($"Equipment items are not available: {string.Join(", ", unavailableItems.Select(e => e.Name))}");
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

        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetRequest), new { id = request.Id }, request);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Request>> GetRequest(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var request = await _context.Requests
            .Include(r => r.Equipment)
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (request == null)
        {
            return NotFound();
        }

  
        if (!isAdmin && request.UserId != userId)
        {
            return Forbid();
        }

        return request;
    }

    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<IEnumerable<Request>>> GetRequests()
    {
        return await _context.Requests
            .Include(r => r.Equipment)
            .Include(r => r.User)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    [HttpGet("my")]
    [Authorize(Policy = "UserOnly")]
    public async Task<ActionResult<IEnumerable<Request>>> GetMyRequests()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return await _context.Requests
            .Include(r => r.Equipment)
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    [HttpGet("manager/requests")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<IEnumerable<Request>>> GetManagerRequests()
    {
        return await _context.Requests
            .Include(r => r.Equipment)
            .Include(r => r.User)
            .Where(r => r.Status == RequestStatus.PENDING)
            .OrderByDescending(r => r.CreatedAt)
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
            .OrderByDescending(r => r.CreatedAt)
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

        if (request.Status != RequestStatus.PENDING)
        {
            return BadRequest("Request is not in pending status");
        }

        request.Status = RequestStatus.APPROVED;
        request.ApprovedAt = DateTime.UtcNow;

        foreach (var equipment in request.Equipment)
        {
            equipment.Status = EquipmentStatus.CHECKED_OUT;
            equipment.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{id}/reject")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> RejectRequest(int id, [FromBody] RejectRequestDto rejectDto)
    {
        var request = await _context.Requests
            .Include(r => r.Equipment)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (request == null)
        {
            return NotFound();
        }

        if (request.Status != RequestStatus.PENDING)
        {
            return BadRequest("Request is not in pending status");
        }

        request.Status = RequestStatus.REJECTED;
        request.RejectedAt = DateTime.UtcNow;
        request.Message = $"REJECTED: {rejectDto.RejectionReason ?? "No reason provided"}. Original request: {request.Message}";


        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{id}/return")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> ReturnRequest(int id, [FromBody] ReturnRequestDto returnDto)
    {
        var request = await _context.Requests
            .Include(r => r.Equipment)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (request == null)
        {
            return NotFound();
        }

        if (request.Status != RequestStatus.APPROVED)
        {
            return BadRequest("Can only return approved requests");
        }

        request.Status = RequestStatus.RETURNED;
        request.ReturnedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }
}

