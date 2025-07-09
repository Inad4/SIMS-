using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SIMS_BACKEND.Models;
using SIMS_BACKEND.Data;
using Microsoft.EntityFrameworkCore;

namespace SIMS_BACKEND.Controllers
{
    [Route("api")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ApiContext _context;

        public UserController(ApiContext context)
        {
            _context = context;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users.ToListAsync();

            if (users == null || !users.Any())
            {
                return NotFound("No users found.");
            }

            return Ok(users);
        }

        [HttpGet("user/{Id}")]
        public async Task<IActionResult> GetUser(string Id)
        {
            var user = await _context.Users.FindAsync(Id);

            if (user == null)
            {
                return NotFound("User with such Id not found");
            }

            return Ok(user);
        }


        // TO DO : DECLARE INTERFACE WHICH STATES WHAT DATA NEEDS TO BE PASSED
        /*
        [HttpPost("user")]
        public async Task<IActionResult> CreateUser(User user)
        {
            if (user == null)
            {
                return BadRequest("User cannot be null");
            }

            bool userAlreadyExists = (await _context.FindAsync<User>(user.Id)) != null;

            if (userAlreadyExists)
            {
                return BadRequest("User with such Id already exists");
            }

            _context.Users.Add(user);

            return Ok(user);
        }
        */
    }
}
