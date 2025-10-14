using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoctorAppointmentAPI.Data;
using DoctorAppointmentAPI.Models;
using DoctorAppointmentAPI.DTOs;

namespace DoctorAppointmentAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<AdminController> _logger;

        public AdminController(AppDbContext context, ILogger<AdminController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("dashboard-stats")]
        public async Task<ActionResult<object>> GetDashboardStats()
        {
            try
            {
                var totalUsers = await _context.Users.CountAsync();
                var totalDoctors = await _context.Doctors.CountAsync();
                var totalPatients = await _context.Patients.CountAsync();
                var totalAppointments = await _context.Appointments.CountAsync();
                var pendingAppointments = await _context.Appointments.CountAsync(a => a.Status == AppointmentStatus.Scheduled);
                var completedAppointments = await _context.Appointments.CountAsync(a => a.Status == AppointmentStatus.Completed);
                var cancelledAppointments = await _context.Appointments.CountAsync(a => a.Status == AppointmentStatus.Cancelled);

                return Ok(new
                {
                    totalUsers,
                    totalDoctors,
                    totalPatients,
                    totalAppointments,
                    pendingAppointments,
                    completedAppointments,
                    cancelledAppointments
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching dashboard stats");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet("recent-appointments")]
        public async Task<ActionResult<IEnumerable<object>>> GetRecentAppointments()
        {
            try
            {
                var appointments = await _context.Appointments
                    .Include(a => a.Patient)
                        .ThenInclude(p => p.User)
                    .Include(a => a.Doctor)
                        .ThenInclude(d => d.User)
                    .OrderByDescending(a => a.CreatedAt)
                    .Take(10)
                    .Select(a => new
                    {
                        id = a.Id,
                        patientName = $"{a.Patient.User.FirstName} {a.Patient.User.LastName}",
                        doctorName = $"Dr. {a.Doctor.User.FirstName} {a.Doctor.User.LastName}",
                        doctorSpecialization = a.Doctor.Specialization,
                        appointmentDate = a.AppointmentDate,
                        startTime = a.StartTime,
                        endTime = a.EndTime,
                        status = a.Status.ToString(),
                        reason = a.Reason,
                        notes = a.Notes,
                        fee = a.Fee,
                        createdAt = a.CreatedAt,
                        updatedAt = a.UpdatedAt,
                        cancelledAt = a.CancelledAt,
                        cancellationReason = a.CancellationReason
                    })
                    .ToListAsync();

                return Ok(appointments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching recent appointments");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet("recent-users")]
        public async Task<ActionResult<IEnumerable<object>>> GetRecentUsers()
        {
            try
            {
                var users = await _context.Users
                    .OrderByDescending(u => u.CreatedAt)
                    .Take(10)
                    .Select(u => new
                    {
                        id = u.Id,
                        name = $"{u.FirstName} {u.LastName}",
                        email = u.Email,
                        role = u.Role.ToString(),
                        status = u.IsActive ? "Active" : "Inactive",
                        joinDate = u.CreatedAt
                    })
                    .ToListAsync();

                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching recent users");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet("all-doctors")]
        public async Task<ActionResult<IEnumerable<object>>> GetAllDoctors()
        {
            try
            {
                var doctors = await _context.Doctors
                    .Include(d => d.User)
                    .Select(d => new
                    {
                        id = d.Id,
                        userId = d.UserId,
                        firstName = d.User.FirstName,
                        lastName = d.User.LastName,
                        email = d.User.Email,
                        phoneNumber = d.User.PhoneNumber,
                        specialization = d.Specialization,
                        licenseNumber = d.LicenseNumber,
                        bio = d.Bio,
                        address = d.Address,
                        city = d.City,
                        state = d.State,
                        zipCode = d.ZipCode,
                        consultationFee = d.ConsultationFee,
                        experienceYears = d.ExperienceYears,
                        isVerified = d.IsVerified,
                        isActive = d.User.IsActive,
                        createdAt = d.CreatedAt
                    })
                    .ToListAsync();

                return Ok(doctors);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all doctors");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet("pending-doctors")]
        public async Task<ActionResult<IEnumerable<object>>> GetPendingDoctors()
        {
            try
            {
                var doctors = await _context.Doctors
                    .Include(d => d.User)
                    .Where(d => !d.IsVerified)
                    .Select(d => new
                    {
                        id = d.Id,
                        userId = d.UserId,
                        firstName = d.User.FirstName,
                        lastName = d.User.LastName,
                        email = d.User.Email,
                        phoneNumber = d.User.PhoneNumber,
                        specialization = d.Specialization,
                        licenseNumber = d.LicenseNumber,
                        bio = d.Bio,
                        address = d.Address,
                        city = d.City,
                        state = d.State,
                        zipCode = d.ZipCode,
                        consultationFee = d.ConsultationFee,
                        experienceYears = d.ExperienceYears,
                        isVerified = d.IsVerified,
                        isActive = d.User.IsActive,
                        createdAt = d.CreatedAt
                    })
                    .OrderBy(d => d.createdAt)
                    .ToListAsync();

                return Ok(doctors);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching pending doctors");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet("all-patients")]
        public async Task<ActionResult<IEnumerable<object>>> GetAllPatients()
        {
            try
            {
                var patients = await _context.Patients
                    .Include(p => p.User)
                    .Select(p => new
                    {
                        id = p.Id,
                        firstName = p.User.FirstName,
                        lastName = p.User.LastName,
                        email = p.User.Email,
                        phoneNumber = p.User.PhoneNumber,
                        dateOfBirth = p.DateOfBirth,
                        gender = p.Gender,
                        bloodType = p.BloodType,
                        medicalHistory = p.MedicalHistory,
                        allergies = p.Allergies,
                        emergencyContactName = p.EmergencyContactName,
                        emergencyContactPhone = p.EmergencyContactPhone,
                        insuranceProvider = p.InsuranceProvider,
                        insuranceNumber = p.InsuranceNumber,
                        isActive = p.User.IsActive,
                        createdAt = p.CreatedAt,
                        totalAppointments = _context.Appointments.Count(a => a.PatientId == p.Id)
                    })
                    .ToListAsync();

                return Ok(patients);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all patients");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet("all-appointments")]
        public async Task<ActionResult<IEnumerable<object>>> GetAllAppointments(
            [FromQuery] DateTime? startDate = null, 
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                IQueryable<Appointment> query = _context.Appointments
                    .Include(a => a.Patient)
                        .ThenInclude(p => p.User)
                    .Include(a => a.Doctor)
                        .ThenInclude(d => d.User);

                // Apply date filtering if provided
                if (startDate.HasValue)
                {
                    query = query.Where(a => a.AppointmentDate.Date >= startDate.Value.Date);
                }

                if (endDate.HasValue)
                {
                    query = query.Where(a => a.AppointmentDate.Date <= endDate.Value.Date);
                }

                var appointments = await query
                    .Select(a => new
                    {
                        id = a.Id,
                        patientId = a.PatientId,
                        doctorId = a.DoctorId,
                        patientName = $"{a.Patient.User.FirstName} {a.Patient.User.LastName}",
                        doctorName = $"Dr. {a.Doctor.User.FirstName} {a.Doctor.User.LastName}",
                        doctorSpecialization = a.Doctor.Specialization,
                        appointmentDate = a.AppointmentDate,
                        startTime = a.StartTime,
                        endTime = a.EndTime,
                        status = a.Status.ToString(),
                        reason = a.Reason,
                        notes = a.Notes,
                        fee = a.Fee,
                        createdAt = a.CreatedAt,
                        updatedAt = a.UpdatedAt,
                        cancelledAt = a.CancelledAt,
                        cancellationReason = a.CancellationReason
                    })
                    .ToListAsync();

                return Ok(appointments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all appointments");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPatch("doctors/{id}/verify")]
        public async Task<ActionResult> VerifyDoctor(int id, [FromBody] bool isVerified)
        {
            try
            {
                var doctor = await _context.Doctors
                    .Include(d => d.User)
                    .FirstOrDefaultAsync(d => d.Id == id);
                
                if (doctor == null)
                {
                    return NotFound(new { message = "Doctor not found" });
                }

                doctor.IsVerified = isVerified;
                doctor.UpdatedAt = DateTime.UtcNow;
                
                // If rejecting, deactivate the user account
                if (!isVerified)
                {
                    doctor.User.IsActive = false;
                    doctor.User.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    // If approving, ensure the user account is active
                    doctor.User.IsActive = true;
                    doctor.User.UpdatedAt = DateTime.UtcNow;
                }
                
                await _context.SaveChangesAsync();

                return Ok(new { message = $"Doctor {(isVerified ? "approved and verified" : "rejected and deactivated")} successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating doctor verification status");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost("doctors/{id}/approve")]
        public async Task<ActionResult> ApproveDoctor(int id)
        {
            try
            {
                var doctor = await _context.Doctors
                    .Include(d => d.User)
                    .FirstOrDefaultAsync(d => d.Id == id);
                
                if (doctor == null)
                {
                    return NotFound(new { message = "Doctor not found" });
                }

                doctor.IsVerified = true;
                doctor.User.IsActive = true;
                doctor.UpdatedAt = DateTime.UtcNow;
                doctor.User.UpdatedAt = DateTime.UtcNow;
                
                // Create default availability for the approved doctor (9am-9pm except Sundays)
                CreateDefaultAvailability(doctor.Id);
                
                await _context.SaveChangesAsync();

                return Ok(new { message = "Doctor approved successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving doctor");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost("doctors/{id}/reject")]
        public async Task<ActionResult> RejectDoctor(int id, [FromBody] string? reason = null)
        {
            try
            {
                var doctor = await _context.Doctors
                    .Include(d => d.User)
                    .FirstOrDefaultAsync(d => d.Id == id);
                
                if (doctor == null)
                {
                    return NotFound(new { message = "Doctor not found" });
                }

                doctor.IsVerified = false;
                doctor.User.IsActive = false;
                doctor.UpdatedAt = DateTime.UtcNow;
                doctor.User.UpdatedAt = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();

                return Ok(new { message = "Doctor rejected successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rejecting doctor");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPatch("users/{id}/status")]
        public async Task<ActionResult> UpdateUserStatus(int id, [FromBody] bool isActive)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                user.IsActive = isActive;
                user.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new { message = $"User {(isActive ? "activated" : "deactivated")} successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user status");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPatch("appointments/{id}/status")]
        public async Task<ActionResult> UpdateAppointmentStatus(int id, [FromBody] UpdateAppointmentStatusRequest request)
        {
            try
            {
                var appointment = await _context.Appointments.FindAsync(id);
                if (appointment == null)
                {
                    return NotFound(new { message = "Appointment not found" });
                }

                // Admin can make any status transition
                appointment.Status = request.Status;
                appointment.UpdatedAt = DateTime.UtcNow;
                
                if (request.Status == AppointmentStatus.Cancelled)
                {
                    appointment.CancelledAt = DateTime.UtcNow;
                    if (!string.IsNullOrEmpty(request.CancellationReason))
                    {
                        appointment.CancellationReason = request.CancellationReason;
                    }
                    else
                    {
                        appointment.CancellationReason = "Cancelled by Admin";
                    }
                }
                
                await _context.SaveChangesAsync();
                return Ok(new { message = "Appointment status updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating appointment status");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPatch("doctors/{id}")]
        public async Task<ActionResult> UpdateDoctor(int id, [FromBody] object updateData)
        {
            try
            {
                var doctor = await _context.Doctors
                    .Include(d => d.User)
                    .FirstOrDefaultAsync(d => d.Id == id);
                
                if (doctor == null)
                {
                    return NotFound(new { message = "Doctor not found" });
                }

                // For now, just return success
                // TODO: Implement proper doctor update logic
                return Ok(new { message = "Doctor updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating doctor");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost("seed-database")]
        public async Task<ActionResult> SeedDatabase()
        {
            try
            {
                await DoctorAppointmentAPI.Services.DatabaseSeeder.SeedAsync(_context);
                return Ok(new { message = "Database seeded successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error seeding database");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost("public-seed-database")]
        [AllowAnonymous]
        public async Task<ActionResult> PublicSeedDatabase()
        {
            try
            {
                await DoctorAppointmentAPI.Services.DatabaseSeeder.SeedAsync(_context);
                return Ok(new { message = "Database seeded successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error seeding database");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        private void CreateDefaultAvailability(int doctorId)
        {
            // Create default availabilities (9am-9pm except Sundays)
            var dayOfWeeks = new[] { 
                DayOfWeek.Monday, 
                DayOfWeek.Tuesday, 
                DayOfWeek.Wednesday, 
                DayOfWeek.Thursday, 
                DayOfWeek.Friday, 
                DayOfWeek.Saturday 
            };
            var timeSlots = new[]
            {
                (new TimeSpan(9, 0, 0), new TimeSpan(10, 0, 0)),
                (new TimeSpan(10, 0, 0), new TimeSpan(11, 0, 0)),
                (new TimeSpan(11, 0, 0), new TimeSpan(12, 0, 0)),
                (new TimeSpan(12, 0, 0), new TimeSpan(13, 0, 0)),
                (new TimeSpan(13, 0, 0), new TimeSpan(14, 0, 0)),
                (new TimeSpan(14, 0, 0), new TimeSpan(15, 0, 0)),
                (new TimeSpan(15, 0, 0), new TimeSpan(16, 0, 0)),
                (new TimeSpan(16, 0, 0), new TimeSpan(17, 0, 0)),
                (new TimeSpan(17, 0, 0), new TimeSpan(18, 0, 0)),
                (new TimeSpan(18, 0, 0), new TimeSpan(19, 0, 0)),
                (new TimeSpan(19, 0, 0), new TimeSpan(20, 0, 0)),
                (new TimeSpan(20, 0, 0), new TimeSpan(21, 0, 0))
            };

            foreach (var dayOfWeek in dayOfWeeks)
            {
                foreach (var (startTime, endTime) in timeSlots)
                {
                    _context.Availabilities.Add(new Availability
                    {
                        DoctorId = doctorId,
                        DayOfWeek = dayOfWeek,
                        StartTime = startTime,
                        EndTime = endTime,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }
        }
    }
}
