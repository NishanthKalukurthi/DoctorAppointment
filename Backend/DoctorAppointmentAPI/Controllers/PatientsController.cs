using DoctorAppointmentAPI.Data;
using DoctorAppointmentAPI.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DoctorAppointmentAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PatientsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<PatientsController> _logger;

        public PatientsController(AppDbContext context, ILogger<PatientsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("profile")]
        public async Task<ActionResult<PatientResponse>> GetProfile()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized();
                }

                var patient = await _context.Patients
                    .Include(p => p.User)
                    .Where(p => p.UserId == userId)
                    .Select(p => new PatientResponse
                    {
                        Id = p.Id,
                        FirstName = p.User.FirstName,
                        LastName = p.User.LastName,
                        Email = p.User.Email,
                        PhoneNumber = p.User.PhoneNumber,
                        DateOfBirth = p.DateOfBirth,
                        Gender = p.Gender,
                        BloodType = p.BloodType,
                        MedicalHistory = p.MedicalHistory,
                        Allergies = p.Allergies,
                        EmergencyContactName = p.EmergencyContactName,
                        EmergencyContactPhone = p.EmergencyContactPhone,
                        InsuranceProvider = p.InsuranceProvider,
                        InsuranceNumber = p.InsuranceNumber,
                        CreatedAt = p.CreatedAt
                    })
                    .FirstOrDefaultAsync();

                if (patient == null)
                {
                    return NotFound(new { message = "Patient profile not found" });
                }

                return Ok(patient);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving patient profile");
                return StatusCode(500, new { message = "An error occurred while retrieving the profile" });
            }
        }

        [HttpPut("profile")]
        public async Task<ActionResult<PatientResponse>> UpdateProfile(PatientUpdateRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized();
                }

                var patient = await _context.Patients
                    .Include(p => p.User)
                    .FirstOrDefaultAsync(p => p.UserId == userId);

                if (patient == null)
                {
                    return NotFound(new { message = "Patient profile not found" });
                }

                // Update user information
                if (request.FirstName != null) patient.User.FirstName = request.FirstName;
                if (request.LastName != null) patient.User.LastName = request.LastName;
                if (request.PhoneNumber != null) patient.User.PhoneNumber = request.PhoneNumber;
                
                // Update patient-specific information
                if (request.DateOfBirth.HasValue) patient.DateOfBirth = request.DateOfBirth.Value;
                if (request.Gender != null) patient.Gender = request.Gender;
                if (request.BloodType != null) patient.BloodType = request.BloodType;
                if (request.MedicalHistory != null) patient.MedicalHistory = request.MedicalHistory;
                if (request.Allergies != null) patient.Allergies = request.Allergies;
                if (request.EmergencyContactName != null) patient.EmergencyContactName = request.EmergencyContactName;
                if (request.EmergencyContactPhone != null) patient.EmergencyContactPhone = request.EmergencyContactPhone;
                if (request.InsuranceProvider != null) patient.InsuranceProvider = request.InsuranceProvider;
                if (request.InsuranceNumber != null) patient.InsuranceNumber = request.InsuranceNumber;

                patient.UpdatedAt = DateTime.UtcNow;
                patient.User.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var response = new PatientResponse
                {
                    Id = patient.Id,
                    FirstName = patient.User.FirstName,
                    LastName = patient.User.LastName,
                    Email = patient.User.Email,
                    PhoneNumber = patient.User.PhoneNumber,
                    DateOfBirth = patient.DateOfBirth,
                    Gender = patient.Gender,
                    BloodType = patient.BloodType,
                    MedicalHistory = patient.MedicalHistory,
                    Allergies = patient.Allergies,
                    EmergencyContactName = patient.EmergencyContactName,
                    EmergencyContactPhone = patient.EmergencyContactPhone,
                    InsuranceProvider = patient.InsuranceProvider,
                    InsuranceNumber = patient.InsuranceNumber,
                    CreatedAt = patient.CreatedAt
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating patient profile");
                return StatusCode(500, new { message = "An error occurred while updating the profile" });
            }
        }

        [HttpGet("appointments")]
        public async Task<ActionResult<IEnumerable<AppointmentResponse>>> GetAppointments()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized();
                }

                var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userId);
                if (patient == null)
                {
                    return NotFound(new { message = "Patient profile not found" });
                }

                var appointments = await _context.Appointments
                    .Include(a => a.Doctor)
                    .ThenInclude(d => d.User)
                    .Include(a => a.Patient)
                    .ThenInclude(p => p.User)
                    .Where(a => a.PatientId == patient.Id)
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
                _logger.LogError(ex, "Error retrieving patient appointments");
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
