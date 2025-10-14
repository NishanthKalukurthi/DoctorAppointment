using System.ComponentModel.DataAnnotations;

namespace DoctorAppointmentAPI.Models
{
    public class Appointment
    {
        public int Id { get; set; }
        
        [Required]
        public int DoctorId { get; set; }
        public Doctor Doctor { get; set; } = null!;
        
        [Required]
        public int PatientId { get; set; }
        public Patient Patient { get; set; } = null!;
        
        [Required]
        public DateTime AppointmentDate { get; set; }
        
        [Required]
        public TimeSpan StartTime { get; set; }
        
        [Required]
        public TimeSpan EndTime { get; set; }
        
        [Required]
        public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;
        
        public string? Reason { get; set; }
        
        public string? Notes { get; set; }
        
        public decimal? Fee { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? CancelledAt { get; set; }
        
        public string? CancellationReason { get; set; }
    }

    public enum AppointmentStatus
    {
        Scheduled = 0,
        Confirmed = 1,
        InProgress = 2,
        Completed = 3,
        Cancelled = 4,
        NoShow = 5
    }
}
