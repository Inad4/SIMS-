namespace SIMS_BACKEND.Dto
{
    public class CreateRequestDto
    {
            public List<int> EquipmentIds { get; set; } = new List<int>();
            public string Message { get; set; } = string.Empty;
            public DateTime StartDate { get; set; }
            public DateTime EndDate { get; set; }
    }
}
