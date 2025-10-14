using System.ComponentModel.DataAnnotations;

namespace DoctorAppointmentAPI.DTOs
{
    public class DoctorRegistrationRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;
        
        [Required]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        public string LastName { get; set; } = string.Empty;
        
        [Required]
        public string PhoneNumber { get; set; } = string.Empty;
        
        [Required]
        public string Specialization { get; set; } = string.Empty;
        
        [Required]
        public string LicenseNumber { get; set; } = string.Empty;
        
        public string? Bio { get; set; }
        
        [Required]
        public string Address { get; set; } = string.Empty;
        
        [Required]
        public string City { get; set; } = string.Empty;
        
        [Required]
        public string State { get; set; } = string.Empty;
        
        [Required]
        public string ZipCode { get; set; } = string.Empty;
        
        [Required]
        [Range(0, double.MaxValue)]
        public decimal ConsultationFee { get; set; }
        
        [Required]
        [Range(0, 100)]
        public int ExperienceYears { get; set; }
    }

    public class DoctorUpdateRequest
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Bio { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? ZipCode { get; set; }
        public decimal? ConsultationFee { get; set; }
        public int? ExperienceYears { get; set; }
    }

    public class DoctorResponse
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
        public string LicenseNumber { get; set; } = string.Empty;
        public string? Bio { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;
        public decimal ConsultationFee { get; set; }
        public int ExperienceYears { get; set; }
        public bool IsVerified { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class DoctorSearchRequest
    {
        public string? Name { get; set; }
        public string? Specialization { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public decimal? MaxFee { get; set; }
    }
}
