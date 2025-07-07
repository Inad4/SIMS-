namespace SIMS_BACKEND.Models
{
    public class School
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string City { get; set; } = null!;
        public string Address { get; set; } = null!;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? CreatedAt { get; set; }

        public ICollection<User> Users { get; set; } = null!;
        public ICollection<Equipment> Equipment { get; set; } = null!;

    }
}
