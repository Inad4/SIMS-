namespace SharedModels;

public enum EquipmentStatus
{
    AVAILABLE,
    UNDER_REPAIR,
    CHECKED_OUT,
    RETIRED,
}

public class Equipment
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public int Room { get; set; }
    public string PathToPhoto { get; set; } = null!;
    public EquipmentStatus Status { get; set; }
    public string Type { get; set; } = null!;
    public string SerialNumber { get; set; } = null!;
    public int SchoolId { get; set; }
    public School School { get; set; } = null!;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? CreatedAt { get; set; }
    public ICollection<Request> Requests { get; set; } = new List<Request>();

}
