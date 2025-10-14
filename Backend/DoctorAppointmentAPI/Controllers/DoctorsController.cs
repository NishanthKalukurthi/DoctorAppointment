using DoctorAppointmentAPI.Data;
using DoctorAppointmentAPI.DTOs;
using DoctorAppointmentAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DoctorAppointmentAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DoctorsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<DoctorsController> _logger;

        public DoctorsController(AppDbContext context, ILogger<DoctorsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<DoctorResponse>>> GetDoctors([FromQuery] DoctorSearchRequest? searchRequest)
        {
            try
            {
                var query = _context.Doctors
                    .Include(d => d.User)
                    .Where(d => d.IsVerified);

                if (searchRequest != null)
                {
                    if (!string.IsNullOrEmpty(searchRequest.Name))
                    {
                        query = query.Where(d => 
                            (d.User.FirstName + " " + d.User.LastName).Contains(searchRequest.Name));
                    }

                    if (!string.IsNullOrEmpty(searchRequest.Specialization))
                    {
                        query = query.Where(d => d.Specialization.Contains(searchRequest.Specialization));
                    }

                    if (!string.IsNullOrEmpty(searchRequest.City))
                    {
                        query = query.Where(d => d.City.Contains(searchRequest.City));
                    }

                    if (!string.IsNullOrEmpty(searchRequest.State))
                    {
                        query = query.Where(d => d.State.Contains(searchRequest.State));
                    }

                    if (searchRequest.MaxFee.HasValue)
                    {
                        query = query.Where(d => d.ConsultationFee <= searchRequest.MaxFee.Value);
                    }
                }

                var doctors = await query
                    .Select(d => new DoctorResponse
                    {
                        Id = d.Id,
                        FirstName = d.User.FirstName,
                        LastName = d.User.LastName,
                        Email = d.User.Email,
                        PhoneNumber = d.User.PhoneNumber,
                        Specialization = d.Specialization,
                        LicenseNumber = d.LicenseNumber,
                        Bio = d.Bio,
                        ProfileImageUrl = d.ProfileImageUrl,
                        Address = d.Address,
                        City = d.City,
                        State = d.State,
                        ZipCode = d.ZipCode,
                        ConsultationFee = d.ConsultationFee,
                        ExperienceYears = d.ExperienceYears,
                        IsVerified = d.IsVerified,
                        CreatedAt = d.CreatedAt
                    })
                    .ToListAsync();

                return Ok(doctors);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving doctors");
                return StatusCode(500, new { message = "An error occurred while retrieving doctors" });
            }
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<DoctorResponse>> GetDoctor(int id)
        {
            try
            {
                var doctor = await _context.Doctors
                    .Include(d => d.User)
                    .Where(d => d.Id == id && d.IsVerified)
                    .Select(d => new DoctorResponse
                    {
                        Id = d.Id,
                        FirstName = d.User.FirstName,
                        LastName = d.User.LastName,
                        Email = d.User.Email,
                        PhoneNumber = d.User.PhoneNumber,
                        Specialization = d.Specialization,
                        LicenseNumber = d.LicenseNumber,
                        Bio = d.Bio,
                        ProfileImageUrl = d.ProfileImageUrl,
                        Address = d.Address,
                        City = d.City,
                        State = d.State,
                        ZipCode = d.ZipCode,
                        ConsultationFee = d.ConsultationFee,
                        ExperienceYears = d.ExperienceYears,
                        IsVerified = d.IsVerified,
                        CreatedAt = d.CreatedAt
                    })
                    .FirstOrDefaultAsync();

                if (doctor == null)
                {
                    return NotFound(new { message = "Doctor not found" });
                }

                return Ok(doctor);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving doctor {DoctorId}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the doctor" });
            }
        }

        [HttpGet("profile")]
        public async Task<ActionResult<DoctorResponse>> GetProfile()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized();
                }

                var doctor = await _context.Doctors
                    .Include(d => d.User)
                    .Where(d => d.UserId == userId)
                    .Select(d => new DoctorResponse
                    {
                        Id = d.Id,
                        FirstName = d.User.FirstName,
                        LastName = d.User.LastName,
                        Email = d.User.Email,
                        PhoneNumber = d.User.PhoneNumber,
                        Specialization = d.Specialization,
                        LicenseNumber = d.LicenseNumber,
                        Bio = d.Bio,
                        ProfileImageUrl = d.ProfileImageUrl,
                        Address = d.Address,
                        City = d.City,
                        State = d.State,
                        ZipCode = d.ZipCode,
                        ConsultationFee = d.ConsultationFee,
                        ExperienceYears = d.ExperienceYears,
                        IsVerified = d.IsVerified,
                        CreatedAt = d.CreatedAt
                    })
                    .FirstOrDefaultAsync();

                if (doctor == null)
                {
                    return NotFound(new { message = "Doctor profile not found" });
                }

                return Ok(doctor);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving doctor profile");
                return StatusCode(500, new { message = "An error occurred while retrieving the profile" });
            }
        }

        [HttpPut("profile")]
        public async Task<ActionResult<DoctorResponse>> UpdateProfile(DoctorUpdateRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized();
                }

                var doctor = await _context.Doctors
                    .Include(d => d.User)
                    .FirstOrDefaultAsync(d => d.UserId == userId);

                if (doctor == null)
                {
                    return NotFound(new { message = "Doctor profile not found" });
                }

                // Update user information
                if (request.FirstName != null) doctor.User.FirstName = request.FirstName;
                if (request.LastName != null) doctor.User.LastName = request.LastName;
                if (request.PhoneNumber != null) doctor.User.PhoneNumber = request.PhoneNumber;
                
                // Update doctor-specific information
                if (request.Bio != null) doctor.Bio = request.Bio;
                if (request.Address != null) doctor.Address = request.Address;
                if (request.City != null) doctor.City = request.City;
                if (request.State != null) doctor.State = request.State;
                if (request.ZipCode != null) doctor.ZipCode = request.ZipCode;
                if (request.ConsultationFee.HasValue) doctor.ConsultationFee = request.ConsultationFee.Value;
                if (request.ExperienceYears.HasValue) doctor.ExperienceYears = request.ExperienceYears.Value;

                doctor.UpdatedAt = DateTime.UtcNow;
                doctor.User.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var response = new DoctorResponse
                {
                    Id = doctor.Id,
                    FirstName = doctor.User.FirstName,
                    LastName = doctor.User.LastName,
                    Email = doctor.User.Email,
                    PhoneNumber = doctor.User.PhoneNumber,
                    Specialization = doctor.Specialization,
                    LicenseNumber = doctor.LicenseNumber,
                    Bio = doctor.Bio,
                    ProfileImageUrl = doctor.ProfileImageUrl,
                    Address = doctor.Address,
                    City = doctor.City,
                    State = doctor.State,
                    ZipCode = doctor.ZipCode,
                    ConsultationFee = doctor.ConsultationFee,
                    ExperienceYears = doctor.ExperienceYears,
                    IsVerified = doctor.IsVerified,
                    CreatedAt = doctor.CreatedAt
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating doctor profile");
                return StatusCode(500, new { message = "An error occurred while updating the profile" });
            }
        }

        [HttpGet("{id}/appointments")]
        public async Task<ActionResult<IEnumerable<AppointmentResponse>>> GetAppointments(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized();
                }

                // Check if the doctor is accessing their own appointments
                var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.Id == id && d.UserId == userId);
                if (doctor == null)
                {
                    return Forbid();
                }

                var appointments = await _context.Appointments
                    .Include(a => a.Doctor)
                    .ThenInclude(d => d.User)
                    .Include(a => a.Patient)
                    .ThenInclude(p => p.User)
                    .Where(a => a.DoctorId == id)
                    .OrderBy(a => a.AppointmentDate)
                    .ThenBy(a => a.StartTime)
                    .Select(a => new AppointmentResponse
                    {
                        Id = a.Id,
                        DoctorId = a.DoctorId,
                        DoctorName = a.Doctor.User.FirstName + " " + a.Doctor.User.LastName,
                        DoctorSpecialization = a.Doctor.Specialization,
                        PatientId = a.PatientId,
                        PatientName = a.Patient.User.FirstName + " " + a.Patient.User.LastName,
                        AppointmentDate = a.AppointmentDate,
                        StartTime = a.StartTime,
                        EndTime = a.EndTime,
                        Status = a.Status,
                        Reason = a.Reason,
                        Notes = a.Notes,
                        Fee = a.Fee,
                        CreatedAt = a.CreatedAt,
                        CancelledAt = a.CancelledAt,
                        CancellationReason = a.CancellationReason
                    })
                    .ToListAsync();

                return Ok(appointments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving appointments for doctor {DoctorId}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving appointments" });
            }
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : null;
        }
    }
}
