using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedModels;
using System.Text;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class ReportsController : ControllerBase
{
    private readonly SharedDbContext _context;

    public ReportsController(SharedDbContext context)
    {
        _context = context;
    }

  

    // GET: api/reports/history
    [HttpGet("history")]
    public async Task<ActionResult> GetHistoryReport()
    {
        var report = await _context.Requests
            .Include(r => r.User)
            .Include(r => r.Equipment)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Ok(report);
    }

    // GET: api/reports/export
    [HttpGet("export")]
    public async Task<ActionResult> ExportReport()
    {
        var equipmentList = await _context.Equipment.ToListAsync();

        var csv = new StringBuilder();
        csv.AppendLine("Id,Name,Type,SerialNumber,Status,Condition,Location");

        foreach (var item in equipmentList)
        {
            csv.AppendLine($"{item.Id},{item.Name},{item.Type},{item.SerialNumber},{item.Condition},{item.Room}");
        }

        return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", "equipment_report.csv");
    }
}