using System.ComponentModel.DataAnnotations;
using DoctorAppointmentAPI.Models;

namespace DoctorAppointmentAPI.DTOs
{
    public class CreateAppointmentRequest
    {
        [Required]
        public int DoctorId { get; set; }
        
        [Required]
        public DateTime AppointmentDate { get; set; }
        
        [Required]
        public TimeSpan StartTime { get; set; }
        
        [Required]
        public TimeSpan EndTime { get; set; }
        
        public string? Reason { get; set; }
    }

    public class UpdateAppointmentRequest
    {
        public DateTime? AppointmentDate { get; set; }
        public TimeSpan? StartTime { get; set; }
        public TimeSpan? EndTime { get; set; }
        public string? Reason { get; set; }
        public string? Notes { get; set; }
        public AppointmentStatus? Status { get; set; }
        public string? CancellationReason { get; set; }
    }

    public class CancelAppointmentRequest
    {
        [Required]
        public string CancellationReason { get; set; } = string.Empty;
    }

    public class AppointmentResponse
    {
        public int Id { get; set; }
        public int DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string DoctorSpecialization { get; set; } = string.Empty;
        public int PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public DateTime AppointmentDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public AppointmentStatus Status { get; set; }
        public string? Reason { get; set; }
        public string? Notes { get; set; }
        public decimal? Fee { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? CancelledAt { get; set; }
        public string? CancellationReason { get; set; }
    }

    public class AvailabilityRequest
    {
        [Required]
        public DayOfWeek DayOfWeek { get; set; }
        
        [Required]
        public TimeSpan StartTime { get; set; }
        
        [Required]
        public TimeSpan EndTime { get; set; }
    }

    public class AvailabilityResponse
    {
        public int Id { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AvailableSlotResponse
    {
        public DateTime Date { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsAvailable { get; set; }
    }

    public class UpdateAppointmentStatusRequest
    {
        [Required]
        public AppointmentStatus Status { get; set; }
        
        public string? CancellationReason { get; set; }
    }
}
