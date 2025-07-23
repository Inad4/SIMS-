using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedModels;
using System.Security.Claims;
using System.Text;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly SharedDbContext _context;
    private readonly IWebHostEnvironment _env;

    public ReportsController(SharedDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }
    [HttpGet("history")]
    public async Task<ActionResult> GetHistoryReport()
    {
        try
        {
            var schoolId = int.Parse(User.FindFirst("SchoolId").Value);
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isAdmin = User.IsInRole("SchoolAdmin");

            IQueryable<Request> baseQuery = _context.Requests
                .Include(r => r.User)
                .Include(r => r.Equipment)
                .Where(r => r.Equipment.Any(e => e.SchoolId == schoolId));

           
            if (!isAdmin)
            {
                baseQuery = baseQuery.Where(r => r.UserId == userId);
            }

          
            var orderedQuery = baseQuery.OrderByDescending(r => r.CreatedAt);

            var report = await orderedQuery
                .Select(r => new
                {
                    r.Id,
                    UserName = r.User.UserName,
                    Equipment = r.Equipment.Select(e => new
                    {
                        e.Id,
                        e.Name,
                        e.Type
                    }),
                    r.Status,
                    r.CreatedAt,
                    LastUpdated = r.UpdatedAt ?? r.CreatedAt
                })
                .ToListAsync();

            return Ok(report);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                Message = "Failed to retrieve history report",
                Error = ex.Message
            });
        }
    }

    [HttpGet("equipment/csv")]  
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> ExportEquipmentCsv()
    {
        try
        {
            
            var schoolId = int.Parse(User.FindFirst("SchoolId").Value);

            var equipment = await _context.Equipment
                .Where(e => e.SchoolId == schoolId) 
                .ToListAsync();

            var csv = new StringBuilder();
            csv.AppendLine("ID,Name,Type,SerialNumber,Room,Condition");

            foreach (var item in equipment)
            {
                csv.AppendLine($"{item.Id},{item.Name},{item.Type},{item.SerialNumber},{item.Room},{item.Status}");
            }

            return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", $"equipment_export_{DateTime.Now:yyyyMMdd}.csv");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                Message = "Failed to generate CSV",
                Error = ex.Message
            });
        }
    }

    [HttpGet("equipment/pdf")]  
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> ExportEquipmentPdf(int Id)
    {
        var equipment = await _context.Equipment
            .Where(e => e.Id == Id)
            .ToListAsync();

        var school = await _context.Schools.FindAsync(Id);

        var htmlContent = $@"
        <html>
        <head>
            <title>Equipment Report - {school?.Name}</title>
            <style>
                table {{ width: 100%; border-collapse: collapse; }}
                th, td {{ border: 1px solid #000; padding: 8px; text-align: left; }}
                th {{ background-color: #f2f2f2; }}
            </style>
        </head>
        <body>
            <h1>{school?.Name} Equipment Report</h1>
            <p>Generated on: {DateTime.Now.ToString("dd-MM-yyyy")}</p>
            <table>
                <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Serial Number</th>
                    <th>Room</th>
                    <th>Status</th>
                </tr>";

        foreach (var item in equipment)
        {
            htmlContent += $@"
                <tr>
                    <td>{item.Name}</td>
                    <td>{item.Type}</td>
                    <td>{item.SerialNumber}</td>
                    <td>{item.Room}</td>
                    <td>{item.Status}</td>
                </tr>";
        }

        htmlContent += @"
            </table>
        </body>
        </html>";

        var pdfPath = Path.Combine(_env.ContentRootPath, "temp_report.pdf");
        System.IO.File.WriteAllText(pdfPath, htmlContent);

        var fileBytes = await System.IO.File.ReadAllBytesAsync(pdfPath);
        System.IO.File.Delete(pdfPath);

        return File(fileBytes, "application/pdf", $"{Id}_equipment.pdf");
    }

    [HttpGet("users/requests/csv")]  
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> ExportUserRequestsCsv(int schoolId, string userId)
    {
        var currentUserId = User.Identity.Name;
        var isAdmin = User.IsInRole("SchoolAdmin");


        if (!isAdmin && currentUserId != userId)
        {
            return Forbid();
        }

        var query = _context.Requests
            .Include(r => r.User)
            .Include(r => r.Equipment)
            .Where(r => r.User.Id == userId && r.Equipment.Any(e => e.SchoolId == schoolId));

        if (isAdmin)
        {

            query = _context.Requests
                .Include(r => r.User)
                .Include(r => r.Equipment)
                .Where(r => r.Equipment.Any(e => e.SchoolId == schoolId));
        }

        var requests = await query.ToListAsync();

        var csv = new StringBuilder();
        csv.AppendLine("ID,User,Equipment,Status,Date");

        foreach (var req in requests)
        {
            var equipmentNames = string.Join("|", req.Equipment.Select(e => e.Name));
            csv.AppendLine($"{req.Id},{req.User.UserName},{equipmentNames},{req.Status},{req.CreatedAt}");
        }

        var fileName = isAdmin
            ? $"school_{schoolId}_user_{userId}_requests.csv"
            : $"school_{schoolId}_my_requests.csv";

        return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", fileName);
    }

    [HttpGet("users/requests/pdf")]  
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> ExportUserRequestsPdf(int schoolId, string userId)
    {
        var currentUserId = User.Identity.Name;
        var isAdmin = User.IsInRole("SchoolAdmin");

        if (!isAdmin && currentUserId != userId)
        {
            return Forbid();
        }

        var query = _context.Requests
            .Include(r => r.User)
            .Include(r => r.Equipment)
            .Where(r => r.User.Id == userId && r.Equipment.Any(e => e.SchoolId == schoolId));

        if (isAdmin)
        {
            query = _context.Requests
                .Include(r => r.User)
                .Include(r => r.Equipment)
                .Where(r => r.Equipment.Any(e => e.SchoolId == schoolId));
        }

        var requests = await query.ToListAsync();
        var user = await _context.Users.FindAsync(userId);
        var school = await _context.Schools.FindAsync(schoolId);

        var htmlContent = $@"
        <html>
        <head>
            <title>Request Report - {school?.Name}</title>
            <style>
                table {{ width: 100%; border-collapse: collapse; }}
                th, td {{ border: 1px solid #000; padding: 8px; text-align: left; }}
                th {{ background-color: #f2f2f2; }}
            </style>
        </head>
        <body>
            <h1>{school?.Name} Request Report</h1>
            <h2>{(isAdmin ? $"User: {user?.UserName}" : "My Requests")}</h2>
            <p>Generated on: {DateTime.Now.ToString("dd-MM-yyyy")}</p>
            <table>
                <tr>
                    <th>Request ID</th>
                    <th>Equipment</th>
                    <th>Status</th>
                    <th>Date</th>
                </tr>";

        foreach (var req in requests)
        {
            var equipmentNames = string.Join(", ", req.Equipment.Select(e => e.Name));
            htmlContent += $@"
                <tr>
                    <td>{req.Id}</td>
                    <td>{equipmentNames}</td>
                    <td>{req.Status}</td>
                    <td>{req.CreatedAt}</td>
                </tr>";
        }

        htmlContent += @"
            </table>
        </body>
        </html>";

        var pdfPath = Path.Combine(_env.ContentRootPath, "temp_report.pdf");
        System.IO.File.WriteAllText(pdfPath, htmlContent);

        var fileBytes = await System.IO.File.ReadAllBytesAsync(pdfPath);
        System.IO.File.Delete(pdfPath);

        var fileName = isAdmin
            ? $"school_{schoolId}_user_{userId}_requests.pdf"
            : $"school_{schoolId}_my_requests.pdf";

        return File(fileBytes, "application/pdf", fileName);
    }
}