using SharedModels;
namespace SIMS_BACKEND.Dto
{
    public class CreateEquipmentDto
    {
        public string Name { get; set; } = string.Empty;
        public int Room { get; set; }
        public string PathToPhoto { get; set; } = string.Empty;
        public EquipmentStatus Status { get; set; } = EquipmentStatus.AVAILABLE;
        public string Type { get; set; } = string.Empty;
        public string SerialNumber { get; set; } = string.Empty;
        public int SchoolId { get; set; }
    }
}
