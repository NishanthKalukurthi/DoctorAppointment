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
    public class AppointmentsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<AppointmentsController> _logger;

        public AppointmentsController(AppDbContext context, ILogger<AppointmentsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost]
        public async Task<ActionResult<AppointmentResponse>> CreateAppointment(CreateAppointmentRequest request)
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

                var doctor = await _context.Doctors
                    .Include(d => d.User)
                    .FirstOrDefaultAsync(d => d.Id == request.DoctorId && d.IsVerified);
                if (doctor == null)
                {
                    return NotFound(new { message = "Doctor not found or not verified" });
                }

                // Check if the appointment time is in the future
                var appointmentDateTime = request.AppointmentDate.Date.Add(request.StartTime);
                if (appointmentDateTime <= DateTime.Now)
                {
                    return BadRequest(new { message = "Appointment must be scheduled for a future date and time" });
                }

                // Check for conflicts
                // Only prevent booking if there's a Confirmed, InProgress, Completed, or NoShow appointment
                // Allow booking over Scheduled appointments (they can be rescheduled)
                var conflictingAppointment = await _context.Appointments
                    .Where(a => a.DoctorId == request.DoctorId &&
                               a.AppointmentDate.Date == request.AppointmentDate.Date &&
                               (a.Status == AppointmentStatus.Confirmed || 
                                a.Status == AppointmentStatus.InProgress || 
                                a.Status == AppointmentStatus.Completed ||
                                a.Status == AppointmentStatus.NoShow) &&
                               a.StartTime == request.StartTime &&
                               a.EndTime == request.EndTime)
                    .FirstOrDefaultAsync();

                if (conflictingAppointment != null)
                {
                    return BadRequest(new { message = "The selected time slot is not available" });
                }

                var appointment = new Appointment
                {
                    DoctorId = request.DoctorId,
                    PatientId = patient.Id,
                    AppointmentDate = request.AppointmentDate,
                    StartTime = request.StartTime,
                    EndTime = request.EndTime,
                    Status = AppointmentStatus.Scheduled,
                    Reason = request.Reason,
                    Fee = doctor.ConsultationFee,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Appointments.Add(appointment);
                await _context.SaveChangesAsync();

                var response = new AppointmentResponse
                {
                    Id = appointment.Id,
                    DoctorId = appointment.DoctorId,
                    DoctorName = doctor.User.FirstName + " " + doctor.User.LastName,
                    DoctorSpecialization = doctor.Specialization,
                    PatientId = appointment.PatientId,
                    PatientName = patient.User.FirstName + " " + patient.User.LastName,
                    AppointmentDate = appointment.AppointmentDate,
                    StartTime = appointment.StartTime,
                    EndTime = appointment.EndTime,
                    Status = appointment.Status,
                    Reason = appointment.Reason,
                    Notes = appointment.Notes,
                    Fee = appointment.Fee,
                    CreatedAt = appointment.CreatedAt
                };

                return CreatedAtAction(nameof(GetAppointment), new { id = appointment.Id }, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating appointment");
                return StatusCode(500, new { message = "An error occurred while creating the appointment" });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AppointmentResponse>> GetAppointment(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized();
                }

                var appointment = await _context.Appointments
                    .Include(a => a.Doctor)
                    .ThenInclude(d => d.User)
                    .Include(a => a.Patient)
                    .ThenInclude(p => p.User)
                    .FirstOrDefaultAsync(a => a.Id == id);

                if (appointment == null)
                {
                    return NotFound(new { message = "Appointment not found" });
                }

                // Check if user has access to this appointment
                var userRole = GetCurrentUserRole();
                var hasAccess = false;

                if (userRole == "Patient")
                {
                    var patient = await _context.Patients
                        .Include(p => p.User)
                        .FirstOrDefaultAsync(p => p.UserId == userId);
                    hasAccess = patient != null && appointment.PatientId == patient.Id;
                }
                else if (userRole == "Doctor")
                {
                    var doctor = await _context.Doctors
                        .Include(d => d.User)
                        .FirstOrDefaultAsync(d => d.UserId == userId);
                    hasAccess = doctor != null && appointment.DoctorId == doctor.Id;
                }
                else if (userRole == "Admin")
                {
                    hasAccess = true;
                }

                if (!hasAccess)
                {
                    return Forbid();
                }

                var response = new AppointmentResponse
                {
                    Id = appointment.Id,
                    DoctorId = appointment.DoctorId,
                    DoctorName = appointment.Doctor.User.FirstName + " " + appointment.Doctor.User.LastName,
                    DoctorSpecialization = appointment.Doctor.Specialization,
                    PatientId = appointment.PatientId,
                    PatientName = appointment.Patient.User.FirstName + " " + appointment.Patient.User.LastName,
                    AppointmentDate = appointment.AppointmentDate,
                    StartTime = appointment.StartTime,
                    EndTime = appointment.EndTime,
                    Status = appointment.Status,
                    Reason = appointment.Reason,
                    Notes = appointment.Notes,
                    Fee = appointment.Fee,
                    CreatedAt = appointment.CreatedAt,
                    CancelledAt = appointment.CancelledAt,
                    CancellationReason = appointment.CancellationReason
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving appointment {AppointmentId}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the appointment" });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<AppointmentResponse>> UpdateAppointment(int id, UpdateAppointmentRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized();
                }

                var appointment = await _context.Appointments
                    .Include(a => a.Doctor)
                    .ThenInclude(d => d.User)
                    .Include(a => a.Patient)
                    .ThenInclude(p => p.User)
                    .FirstOrDefaultAsync(a => a.Id == id);

                if (appointment == null)
                {
                    return NotFound(new { message = "Appointment not found" });
                }

                // Check if user has permission to update this appointment
                var userRole = GetCurrentUserRole();
                var canUpdate = false;

                if (userRole == "Doctor")
                {
                    var doctor = await _context.Doctors
                        .Include(d => d.User)
                        .FirstOrDefaultAsync(d => d.UserId == userId);
                    canUpdate = doctor != null && appointment.DoctorId == doctor.Id;
                }
                else if (userRole == "Admin")
                {
                    canUpdate = true;
                }

                if (!canUpdate)
                {
                    return Forbid();
                }

                if (request.AppointmentDate.HasValue) appointment.AppointmentDate = request.AppointmentDate.Value;
                if (request.StartTime.HasValue) appointment.StartTime = request.StartTime.Value;
                if (request.EndTime.HasValue) appointment.EndTime = request.EndTime.Value;
                if (request.Reason != null) appointment.Reason = request.Reason;
                if (request.Notes != null) appointment.Notes = request.Notes;
                
                // Handle status updates with proper validation
                if (request.Status.HasValue)
                {
                    var newStatus = request.Status.Value;
                    var currentStatus = appointment.Status;
                    
                    // Validate status transition
                    if (IsValidStatusTransition(currentStatus, newStatus, userRole ?? ""))
                    {
                        appointment.Status = newStatus;
                        
                        // Set cancellation details if status is cancelled
                        if (newStatus == AppointmentStatus.Cancelled)
                        {
                            appointment.CancelledAt = DateTime.UtcNow;
                            appointment.CancellationReason = request.CancellationReason ?? "Cancelled by " + userRole;
                        }
                    }
                    else
                    {
                        return BadRequest(new { message = $"Invalid status transition from {currentStatus} to {newStatus}" });
                    }
                }

                appointment.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var response = new AppointmentResponse
                {
                    Id = appointment.Id,
                    DoctorId = appointment.DoctorId,
                    DoctorName = appointment.Doctor.User.FirstName + " " + appointment.Doctor.User.LastName,
                    DoctorSpecialization = appointment.Doctor.Specialization,
                    PatientId = appointment.PatientId,
                    PatientName = appointment.Patient.User.FirstName + " " + appointment.Patient.User.LastName,
                    AppointmentDate = appointment.AppointmentDate,
                    StartTime = appointment.StartTime,
                    EndTime = appointment.EndTime,
                    Status = appointment.Status,
                    Reason = appointment.Reason,
                    Notes = appointment.Notes,
                    Fee = appointment.Fee,
                    CreatedAt = appointment.CreatedAt,
                    CancelledAt = appointment.CancelledAt,
                    CancellationReason = appointment.CancellationReason
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating appointment {AppointmentId}", id);
                return StatusCode(500, new { message = "An error occurred while updating the appointment" });
            }
        }

        [HttpPost("{id}/cancel")]
        public async Task<ActionResult> CancelAppointment(int id, CancelAppointmentRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized();
                }

                var appointment = await _context.Appointments
                    .FirstOrDefaultAsync(a => a.Id == id);

                if (appointment == null)
                {
                    return NotFound(new { message = "Appointment not found" });
                }

                // Check if user has permission to cancel this appointment
                var userRole = GetCurrentUserRole();
                var canCancel = false;

                if (userRole == "Patient")
                {
                    var patient = await _context.Patients
                        .Include(p => p.User)
                        .FirstOrDefaultAsync(p => p.UserId == userId);
                    canCancel = patient != null && appointment.PatientId == patient.Id;
                }
                else if (userRole == "Doctor")
                {
                    var doctor = await _context.Doctors
                        .Include(d => d.User)
                        .FirstOrDefaultAsync(d => d.UserId == userId);
                    canCancel = doctor != null && appointment.DoctorId == doctor.Id;
                }
                else if (userRole == "Admin")
                {
                    canCancel = true;
                }

                if (!canCancel)
                {
                    return Forbid();
                }

                if (appointment.Status == AppointmentStatus.Cancelled)
                {
                    return BadRequest(new { message = "Appointment is already cancelled" });
                }

                appointment.Status = AppointmentStatus.Cancelled;
                appointment.CancelledAt = DateTime.UtcNow;
                appointment.CancellationReason = request.CancellationReason;
                appointment.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Appointment cancelled successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling appointment {AppointmentId}", id);
                return StatusCode(500, new { message = "An error occurred while cancelling the appointment" });
            }
        }

        [HttpPatch("{id}/status")]
        public async Task<ActionResult<AppointmentResponse>> UpdateAppointmentStatus(int id, [FromBody] UpdateAppointmentStatusRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized();
                }

                var appointment = await _context.Appointments
                    .Include(a => a.Doctor)
                    .ThenInclude(d => d.User)
                    .Include(a => a.Patient)
                    .ThenInclude(p => p.User)
                    .FirstOrDefaultAsync(a => a.Id == id);

                if (appointment == null)
                {
                    return NotFound(new { message = "Appointment not found" });
                }

                // Check if user has permission to update this appointment
                var userRole = GetCurrentUserRole();
                var canUpdate = false;

                if (userRole == "Doctor")
                {
                    var doctor = await _context.Doctors
                        .Include(d => d.User)
                        .FirstOrDefaultAsync(d => d.UserId == userId);
                    canUpdate = doctor != null && appointment.DoctorId == doctor.Id;
                }
                else if (userRole == "Patient")
                {
                    var patient = await _context.Patients
                        .Include(p => p.User)
                        .FirstOrDefaultAsync(p => p.UserId == userId);
                    canUpdate = patient != null && appointment.PatientId == patient.Id;
                }
                else if (userRole == "Admin")
                {
                    canUpdate = true;
                }

                if (!canUpdate)
                {
                    return Forbid();
                }

                var currentStatus = appointment.Status;
                var newStatus = request.Status;

                _logger.LogInformation("Status update attempt: From {CurrentStatus} to {NewStatus} by {UserRole}", 
                    currentStatus, newStatus, userRole);

                // Validate status transition
                if (IsValidStatusTransition(currentStatus, newStatus, userRole ?? ""))
                {
                    appointment.Status = newStatus;
                    appointment.UpdatedAt = DateTime.UtcNow;

                    // Set cancellation details if status is cancelled
                    if (newStatus == AppointmentStatus.Cancelled)
                    {
                        appointment.CancelledAt = DateTime.UtcNow;
                        appointment.CancellationReason = request.CancellationReason ?? "Cancelled by " + userRole;
                    }

                    await _context.SaveChangesAsync();

                    var response = new AppointmentResponse
                    {
                        Id = appointment.Id,
                        DoctorId = appointment.DoctorId,
                        DoctorName = appointment.Doctor.User.FirstName + " " + appointment.Doctor.User.LastName,
                        DoctorSpecialization = appointment.Doctor.Specialization,
                        PatientId = appointment.PatientId,
                        PatientName = appointment.Patient.User.FirstName + " " + appointment.Patient.User.LastName,
                        AppointmentDate = appointment.AppointmentDate,
                        StartTime = appointment.StartTime,
                        EndTime = appointment.EndTime,
                        Status = appointment.Status,
                        Reason = appointment.Reason,
                        Notes = appointment.Notes,
                        Fee = appointment.Fee,
                        CreatedAt = appointment.CreatedAt,
                        UpdatedAt = appointment.UpdatedAt,
                        CancelledAt = appointment.CancelledAt,
                        CancellationReason = appointment.CancellationReason
                    };

                    return Ok(response);
                }
                else
                {
                    return BadRequest(new { message = $"Invalid status transition from {currentStatus} to {newStatus}" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating appointment status");
                return StatusCode(500, new { message = "An error occurred while updating appointment status" });
            }
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : null;
        }

        private string? GetCurrentUserRole()
        {
            return User.FindFirst(ClaimTypes.Role)?.Value;
        }

        private bool IsValidStatusTransition(AppointmentStatus currentStatus, AppointmentStatus newStatus, string userRole)
        {
            // Define valid status transitions based on user role
            var validTransitions = new Dictionary<AppointmentStatus, List<AppointmentStatus>>
            {
                [AppointmentStatus.Scheduled] = new List<AppointmentStatus> 
                { 
                    AppointmentStatus.Confirmed, 
                    AppointmentStatus.Cancelled 
                },
                [AppointmentStatus.Confirmed] = new List<AppointmentStatus> 
                { 
                    AppointmentStatus.InProgress, 
                    AppointmentStatus.Cancelled,
                    AppointmentStatus.NoShow
                },
                [AppointmentStatus.InProgress] = new List<AppointmentStatus> 
                { 
                    AppointmentStatus.Completed, 
                    AppointmentStatus.Cancelled
                },
                [AppointmentStatus.Completed] = new List<AppointmentStatus>(), // No transitions from completed
                [AppointmentStatus.Cancelled] = new List<AppointmentStatus>(), // No transitions from cancelled
                [AppointmentStatus.NoShow] = new List<AppointmentStatus>() // No transitions from no show
            };

            _logger.LogInformation("Validating transition: {CurrentStatus} -> {NewStatus} by {UserRole}", 
                currentStatus, newStatus, userRole);

            // Admin can make any transition
            if (userRole == "Admin")
            {
                _logger.LogInformation("Admin transition allowed");
                return true;
            }

            // Check if the transition is valid
            var isValid = validTransitions.ContainsKey(currentStatus) && 
                         validTransitions[currentStatus].Contains(newStatus);
            
            _logger.LogInformation("Transition validation result: {IsValid}", isValid);
            
            return isValid;
        }
    }
}
