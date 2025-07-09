
public enum EquipmentCondition
{
    WORKING,
    BROKEN,
    IN_REPAIR
}

namespace SIMS_BACKEND.Models
{
    public class Equipment
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public int Room { get; set; }
        public string PathToPhoto { get; set; } = null!;
        public EquipmentCondition Condition { get; set; }

        public DateTime? UpdatedAt { get; set; }
        public DateTime? CreatedAt { get; set; }

    }
}
