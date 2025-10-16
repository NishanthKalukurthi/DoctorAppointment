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
    public class AvailabilityController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<AvailabilityController> _logger;

        public AvailabilityController(AppDbContext context, ILogger<AvailabilityController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("doctor/{doctorId}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<AvailabilityResponse>>> GetDoctorAvailability(int doctorId)
        {
            try
            {
                var availabilities = await _context.Availabilities
                    .Where(a => a.DoctorId == doctorId && a.IsActive)
                    .Select(a => new AvailabilityResponse
                    {
                        Id = a.Id,
                        DayOfWeek = a.DayOfWeek,
                        StartTime = a.StartTime,
                        EndTime = a.EndTime,
                        IsActive = a.IsActive,
                        CreatedAt = a.CreatedAt
                    })
                    .ToListAsync();

                return Ok(availabilities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving availability for doctor {DoctorId}", doctorId);
                return StatusCode(500, new { message = "An error occurred while retrieving availability" });
            }
        }

        [HttpGet("doctor/{doctorId}/slots")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<AvailableSlotResponse>>> GetAvailableSlots(int doctorId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                var doctor = await _context.Doctors
                    .Include(d => d.Availabilities)
                    .FirstOrDefaultAsync(d => d.Id == doctorId && d.IsVerified);

                if (doctor == null)
                {
                    return NotFound(new { message = "Doctor not found" });
                }

                var slots = new List<AvailableSlotResponse>();
                var currentDate = startDate.Date;

                // Debug: Log existing appointments for this doctor
                var existingAppointments = await _context.Appointments
                    .Where(a => a.DoctorId == doctorId && a.Status != AppointmentStatus.Cancelled)
                    .ToListAsync();
                _logger.LogInformation($"Found {existingAppointments.Count} existing appointments for doctor {doctorId}");
                foreach (var apt in existingAppointments)
                {
                    var willBlockSlot = apt.Status == AppointmentStatus.Confirmed || 
                                       apt.Status == AppointmentStatus.InProgress || 
                                       apt.Status == AppointmentStatus.Completed ||
                                       apt.Status == AppointmentStatus.NoShow;
                    _logger.LogInformation($"Appointment: {apt.AppointmentDate:yyyy-MM-dd} {apt.StartTime}-{apt.EndTime}, Status: {apt.Status}, WillBlockSlot: {willBlockSlot}");
                }

                while (currentDate <= endDate.Date)
                {
                    var dayOfWeek = currentDate.DayOfWeek;
                    var dayAvailabilities = doctor.Availabilities
                        .Where(a => a.DayOfWeek == dayOfWeek && a.IsActive)
                        .ToList();

                    foreach (var availability in dayAvailabilities)
                    {
                        var slotStart = currentDate.Add(availability.StartTime);
                        var slotEnd = currentDate.Add(availability.EndTime);

                        // Check if there's a conflicting appointment
                        // Only disable slots for appointments that are Confirmed, InProgress, or Completed
                        // Allow booking over Scheduled appointments (they can be rescheduled)
                        var hasConflict = await _context.Appointments
                            .AnyAsync(a => a.DoctorId == doctorId &&
                                         a.AppointmentDate.Date == currentDate &&
                                         (a.Status == AppointmentStatus.Confirmed || 
                                          a.Status == AppointmentStatus.InProgress || 
                                          a.Status == AppointmentStatus.Completed ||
                                          a.Status == AppointmentStatus.NoShow) &&
                                         a.StartTime == availability.StartTime &&
                                         a.EndTime == availability.EndTime);

                        // Debug: Log the specific appointments being checked for this slot
                        var conflictingAppointments = await _context.Appointments
                            .Where(a => a.DoctorId == doctorId &&
                                       a.AppointmentDate.Date == currentDate &&
                                       (a.Status == AppointmentStatus.Confirmed || 
                                        a.Status == AppointmentStatus.InProgress || 
                                        a.Status == AppointmentStatus.Completed ||
                                        a.Status == AppointmentStatus.NoShow) &&
                                       a.StartTime == availability.StartTime &&
                                       a.EndTime == availability.EndTime)
                            .ToListAsync();
                        
                        _logger.LogInformation($"Slot {availability.StartTime}-{availability.EndTime} on {currentDate:yyyy-MM-dd}: hasConflict={hasConflict}, conflictingAppointments={conflictingAppointments.Count}");
                        foreach (var apt in conflictingAppointments)
                        {
                            _logger.LogInformation($"  Conflicting appointment: {apt.StartTime}-{apt.EndTime}, Status: {apt.Status}");
                        }

                        slots.Add(new AvailableSlotResponse
                        {
                            Date = currentDate,
                            StartTime = availability.StartTime,
                            EndTime = availability.EndTime,
                            IsAvailable = !hasConflict && slotStart > DateTime.Now
                        });
                    }

                    currentDate = currentDate.AddDays(1);
                }

                return Ok(slots);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving available slots for doctor {DoctorId}", doctorId);
                return StatusCode(500, new { message = "An error occurred while retrieving available slots" });
            }
        }

        [HttpGet("my-availability")]
        public async Task<ActionResult<IEnumerable<AvailabilityResponse>>> GetMyAvailability()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized();
                }

                var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
                if (doctor == null)
                {
                    return NotFound(new { message = "Doctor profile not found" });
                }

                var availabilities = await _context.Availabilities
                    .Where(a => a.DoctorId == doctor.Id)
                    .Select(a => new AvailabilityResponse
                    {
                        Id = a.Id,
                        DayOfWeek = a.DayOfWeek,
                        StartTime = a.StartTime,
                        EndTime = a.EndTime,
                        IsActive = a.IsActive,
                        CreatedAt = a.CreatedAt
                    })
                    .ToListAsync();

                return Ok(availabilities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving doctor availability");
                return StatusCode(500, new { message = "An error occurred while retrieving availability" });
            }
        }

        [HttpPost("my-availability")]
        public async Task<ActionResult<AvailabilityResponse>> CreateAvailability(AvailabilityRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized();
                }

                var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
                if (doctor == null)
                {
                    return NotFound(new { message = "Doctor profile not found" });
                }

                // Check for overlapping availability
                var overlappingAvailability = await _context.Availabilities
                    .AnyAsync(a => a.DoctorId == doctor.Id &&
                                 a.DayOfWeek == request.DayOfWeek &&
                                 a.IsActive &&
                                 ((request.StartTime >= a.StartTime && request.StartTime < a.EndTime) ||
                                  (request.EndTime > a.StartTime && request.EndTime <= a.EndTime) ||
                                  (request.StartTime <= a.StartTime && request.EndTime >= a.EndTime)));

                if (overlappingAvailability)
                {
                    return BadRequest(new { message = "Availability overlaps with existing schedule" });
                }

                var availability = new Availability
                {
                    DoctorId = doctor.Id,
                    DayOfWeek = request.DayOfWeek,
                    StartTime = request.StartTime,
                    EndTime = request.EndTime,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Availabilities.Add(availability);
                await _context.SaveChangesAsync();

                var response = new AvailabilityResponse
                {
                    Id = availability.Id,
                    DayOfWeek = availability.DayOfWeek,
                    StartTime = availability.StartTime,
                    EndTime = availability.EndTime,
                    IsActive = availability.IsActive,
                    CreatedAt = availability.CreatedAt
                };

                return CreatedAtAction(nameof(GetMyAvailability), response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating availability");
                return StatusCode(500, new { message = "An error occurred while creating availability" });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<AvailabilityResponse>> UpdateAvailability(int id, AvailabilityRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized();
                }

                var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
                if (doctor == null)
                {
                    return NotFound(new { message = "Doctor profile not found" });
                }

                var availability = await _context.Availabilities
                    .FirstOrDefaultAsync(a => a.Id == id && a.DoctorId == doctor.Id);

                if (availability == null)
                {
                    return NotFound(new { message = "Availability not found" });
                }

                // Check for overlapping availability (excluding current one)
                var overlappingAvailability = await _context.Availabilities
                    .AnyAsync(a => a.DoctorId == doctor.Id &&
                                 a.Id != id &&
                                 a.DayOfWeek == request.DayOfWeek &&
                                 a.IsActive &&
                                 ((request.StartTime >= a.StartTime && request.StartTime < a.EndTime) ||
                                  (request.EndTime > a.StartTime && request.EndTime <= a.EndTime) ||
                                  (request.StartTime <= a.StartTime && request.EndTime >= a.EndTime)));

                if (overlappingAvailability)
                {
                    return BadRequest(new { message = "Availability overlaps with existing schedule" });
                }

                availability.DayOfWeek = request.DayOfWeek;
                availability.StartTime = request.StartTime;
                availability.EndTime = request.EndTime;
                availability.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var response = new AvailabilityResponse
                {
                    Id = availability.Id,
                    DayOfWeek = availability.DayOfWeek,
                    StartTime = availability.StartTime,
                    EndTime = availability.EndTime,
                    IsActive = availability.IsActive,
                    CreatedAt = availability.CreatedAt
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating availability {AvailabilityId}", id);
                return StatusCode(500, new { message = "An error occurred while updating availability" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAvailability(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized();
                }

                var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
                if (doctor == null)
                {
                    return NotFound(new { message = "Doctor profile not found" });
                }

                var availability = await _context.Availabilities
                    .FirstOrDefaultAsync(a => a.Id == id && a.DoctorId == doctor.Id);

                if (availability == null)
                {
                    return NotFound(new { message = "Availability not found" });
                }

                _context.Availabilities.Remove(availability);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Availability deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting availability {AvailabilityId}", id);
                return StatusCode(500, new { message = "An error occurred while deleting availability" });
            }
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : null;
        }
    }
}
