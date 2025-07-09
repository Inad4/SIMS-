using Microsoft.EntityFrameworkCore;
using SIMS_BACKEND.Models;

public interface IAuditableEntity
{
    DateTime? CreatedAt { get; set; }
    DateTime? UpdatedAt { get; set; }
}

namespace SIMS_BACKEND.Data
{
    public class ApiContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<School> Schools { get; set; }
        public DbSet<Equipment> Equipment { get; set; }
        public DbSet<Request> Requests { get; set; }

        public ApiContext(DbContextOptions<ApiContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<School>().HasData(
                new School { Id = 1, Name = "Test School", City = "Test City", Address = "Test Address" }
                );
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = "1",
                    FirstName = "John",
                    LastName = "Doe",
                    Email = "john.doe@example.com",
                    NormalizedEmail = "JOHN.DOE@EXAMPLE.COM",
                    UserName = "john.doe",
                    NormalizedUserName = "JOHN.DOE",
                    EmailConfirmed = true,
                    PasswordHash = "hakalaka",
                    SecurityStamp = "",
                    ConcurrencyStamp = "",
                    SchoolId = 1
                }
                );
        }

        public override int SaveChanges()
        {
            ApplyAuditInformation();
            return base.SaveChanges();
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            ApplyAuditInformation();
            return await base.SaveChangesAsync(cancellationToken);
        }

        private void ApplyAuditInformation()
        {
            var entries = ChangeTracker.Entries()
                .Where(e => e.Entity is IAuditableEntity && (e.State == EntityState.Added || e.State == EntityState.Modified));

            foreach (var entry in entries)
            {
                var entity = (IAuditableEntity)entry.Entity;
                var now = DateTime.UtcNow;

                if (entity.UpdatedAt == null)
                {
                    entity.UpdatedAt = now;
                }
                

                if (entry.State == EntityState.Added && entity.CreatedAt == null)
                {
                    entity.CreatedAt = now;
                }
            }
        }
    }
}
