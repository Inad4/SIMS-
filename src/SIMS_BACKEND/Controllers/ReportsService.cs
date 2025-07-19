using CsvHelper;
using iTextSharp.text;
using iTextSharp.text.pdf;
using SharedModels;
using System.Globalization;
using SIMS_BACKEND;

public interface IReportsService
{
    Task<byte[]> GenerateEquipmentCsvReport(List<Equipment> equipment);
    Task<byte[]> GenerateEquipmentPdfReport(List<Equipment> equipment);
}

public class ReportsService : IReportsService
{
    public async Task<byte[]> GenerateEquipmentCsvReport(List<Equipment> equipment)
    {
        using var memoryStream = new MemoryStream();
        using (var writer = new StreamWriter(memoryStream, leaveOpen: true))
        using (var csv = new CsvWriter(writer, CultureInfo.InvariantCulture))
        {
            await csv.WriteRecordsAsync(equipment);
        }
        return memoryStream.ToArray();
    }

    public async Task<byte[]> GenerateEquipmentPdfReport(List<Equipment> equipment)
    {
        using var memoryStream = new MemoryStream();
        var document = new Document(PageSize.A4.Rotate(), 10, 10, 10, 10);
        var writer = PdfWriter.GetInstance(document, memoryStream);

        document.Open();

        // Add title
        var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 18);
        document.Add(new Paragraph("Equipment Inventory Report", titleFont));
        document.Add(Chunk.Newline);

        // Create table
        var table = new PdfPTable(7) { WidthPercentage = 100 };
        table.SetWidths(new float[] { 1, 3, 2, 2, 2, 2, 3 });

        // Add headers
        var headerFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10);
        table.AddCell(new Phrase("ID", headerFont));
        table.AddCell(new Phrase("Name", headerFont));
        table.AddCell(new Phrase("Type", headerFont));
        table.AddCell(new Phrase("Serial", headerFont));
        table.AddCell(new Phrase("Condition", headerFont));
        table.AddCell(new Phrase("Room", headerFont));

        // Add data rows
        var normalFont = FontFactory.GetFont(FontFactory.HELVETICA, 9);
        foreach (var item in equipment)
        {
            table.AddCell(new Phrase(item.Id.ToString(), normalFont));
            table.AddCell(new Phrase(item.Name, normalFont));
            table.AddCell(new Phrase(item.Type, normalFont));
            table.AddCell(new Phrase(item.SerialNumber ?? "N/A", normalFont));
            table.AddCell(new Phrase(item.Condition.ToString(), normalFont));
            table.AddCell(new Phrase(item.Room.ToString(), normalFont)); 
        }

        document.Add(table);
        document.Close();

        return memoryStream.ToArray();
    }
}
