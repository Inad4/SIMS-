using System;
using Microsoft.AspNetCore.Identity;

namespace SIMS_BACKEND.Models
{
    public class User : IdentityUser
    {
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? CreatedAt { get; set; }

        public int SchoolId { get; set; }
        public School School { get; set; } = null!;

    }
}
