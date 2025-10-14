using DoctorAppointmentAPI.DTOs;
using DoctorAppointmentAPI.Services;
using DoctorAppointmentAPI.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace DoctorAppointmentAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;
        private readonly AppDbContext _context;

        public AuthController(IAuthService authService, ILogger<AuthController> logger, AppDbContext context)
        {
            _authService = authService;
            _logger = logger;
            _context = context;
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
        {
            try
            {
                var result = await _authService.LoginAsync(request);
                if (result == null)
                {
                    return Unauthorized(new { message = "Invalid email or password" });
                }

                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt");
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login");
                return StatusCode(500, new { message = "An error occurred during login" });
            }
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
        {
            try
            {
                var result = await _authService.RegisterAsync(request);
                if (result == null)
                {
                    return BadRequest(new { message = "Email already exists" });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration");
                return StatusCode(500, new { message = "An error occurred during registration" });
            }
        }

        [HttpPost("register/doctor")]
        public async Task<ActionResult<AuthResponse>> RegisterDoctor(DoctorRegistrationRequest request)
        {
            try
            {
                var result = await _authService.RegisterDoctorAsync(request);
                if (result == null)
                {
                    return BadRequest(new { message = "Email already exists" });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during doctor registration");
                return StatusCode(500, new { message = "An error occurred during doctor registration" });
            }
        }

        [HttpPost("register/patient")]
        public async Task<ActionResult<AuthResponse>> RegisterPatient(PatientRegistrationRequest request)
        {
            try
            {
                var result = await _authService.RegisterPatientAsync(request);
                if (result == null)
                {
                    return BadRequest(new { message = "Email already exists" });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during patient registration");
                return StatusCode(500, new { message = "An error occurred during patient registration" });
            }
        }

        [HttpGet("check-users")]
        public async Task<ActionResult> CheckUsers()
        {
            try
            {
                var userCount = await _context.Users.CountAsync();
                var users = await _context.Users.Select(u => new { u.Email, u.Role, u.IsActive }).ToListAsync();
                return Ok(new { userCount, users });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<UserInfo>> GetCurrentUser()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                var userId = int.Parse(userIdClaim.Value);
                var user = await _context.Users
                    .Where(u => u.Id == userId && u.IsActive)
                    .Select(u => new UserInfo
                    {
                        Id = u.Id,
                        Email = u.Email,
                        FirstName = u.FirstName,
                        LastName = u.LastName,
                        PhoneNumber = u.PhoneNumber,
                        Role = u.Role.ToString(),
                        IsActive = u.IsActive
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving current user");
                return StatusCode(500, new { message = "An error occurred while retrieving user information" });
            }
        }
    }
}
