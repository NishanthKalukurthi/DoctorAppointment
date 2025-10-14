using System.ComponentModel.DataAnnotations;

namespace DoctorAppointmentAPI.Models
{
    public class Patient
    {
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        public DateTime? DateOfBirth { get; set; }
        
        public string? Gender { get; set; }
        
        public string? BloodType { get; set; }
        
        public string? MedicalHistory { get; set; }
        
        public string? Allergies { get; set; }
        
        public string? EmergencyContactName { get; set; }
        
        public string? EmergencyContactPhone { get; set; }
        
        public string? InsuranceProvider { get; set; }
        
        public string? InsuranceNumber { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation properties
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    }
}
