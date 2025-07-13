namespace SharedModels;

public enum EquipmentCondition
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
    public EquipmentCondition Condition { get; set; }
    public string Type { get; set; } = null!;
    public string SerialNumber { get; set; } = null!;

    public DateTime? UpdatedAt { get; set; }
    public DateTime? CreatedAt { get; set; }

}
