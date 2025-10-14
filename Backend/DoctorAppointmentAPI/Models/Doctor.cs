using System.ComponentModel.DataAnnotations;

namespace DoctorAppointmentAPI.Models
{
    public class Doctor
    {
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        [Required]
        public string Specialization { get; set; } = string.Empty;
        
        [Required]
        public string LicenseNumber { get; set; } = string.Empty;
        
        public string? Bio { get; set; }
        
        public string? ProfileImageUrl { get; set; }
        
        [Required]
        public string Address { get; set; } = string.Empty;
        
        [Required]
        public string City { get; set; } = string.Empty;
        
        [Required]
        public string State { get; set; } = string.Empty;
        
        [Required]
        public string ZipCode { get; set; } = string.Empty;
        
        public decimal ConsultationFee { get; set; }
        
        public int ExperienceYears { get; set; }
        
        public bool IsVerified { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation properties
        public ICollection<Availability> Availabilities { get; set; } = new List<Availability>();
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    }
}
