using DoctorAppointmentAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace DoctorAppointmentAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<Availability> Availabilities { get; set; }
        public DbSet<Appointment> Appointments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PhoneNumber).IsRequired().HasMaxLength(20);
            });

            // Configure Doctor entity
            modelBuilder.Entity<Doctor>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.User)
                    .WithOne()
                    .HasForeignKey<Doctor>(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                entity.Property(e => e.Specialization).IsRequired().HasMaxLength(100);
                entity.Property(e => e.LicenseNumber).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Bio).HasMaxLength(1000);
                entity.Property(e => e.ProfileImageUrl).HasMaxLength(500);
                entity.Property(e => e.Address).IsRequired().HasMaxLength(200);
                entity.Property(e => e.City).IsRequired().HasMaxLength(100);
                entity.Property(e => e.State).IsRequired().HasMaxLength(100);
                entity.Property(e => e.ZipCode).IsRequired().HasMaxLength(20);
                entity.Property(e => e.ConsultationFee).HasColumnType("decimal(10,2)");
            });

            // Configure Patient entity
            modelBuilder.Entity<Patient>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.User)
                    .WithOne()
                    .HasForeignKey<Patient>(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                entity.Property(e => e.Gender).HasMaxLength(20);
                entity.Property(e => e.BloodType).HasMaxLength(10);
                entity.Property(e => e.MedicalHistory).HasMaxLength(2000);
                entity.Property(e => e.Allergies).HasMaxLength(500);
                entity.Property(e => e.EmergencyContactName).HasMaxLength(100);
                entity.Property(e => e.EmergencyContactPhone).HasMaxLength(20);
                entity.Property(e => e.InsuranceProvider).HasMaxLength(100);
                entity.Property(e => e.InsuranceNumber).HasMaxLength(50);
            });

            // Configure Availability entity
            modelBuilder.Entity<Availability>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Doctor)
                    .WithMany(d => d.Availabilities)
                    .HasForeignKey(e => e.DoctorId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure Appointment entity
            modelBuilder.Entity<Appointment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Doctor)
                    .WithMany(d => d.Appointments)
                    .HasForeignKey(e => e.DoctorId)
                    .OnDelete(DeleteBehavior.Restrict);
                
                entity.HasOne(e => e.Patient)
                    .WithMany(p => p.Appointments)
                    .HasForeignKey(e => e.PatientId)
                    .OnDelete(DeleteBehavior.Restrict);
                
                entity.Property(e => e.Reason).HasMaxLength(500);
                entity.Property(e => e.Notes).HasMaxLength(1000);
                entity.Property(e => e.CancellationReason).HasMaxLength(500);
                entity.Property(e => e.Fee).HasColumnType("decimal(10,2)");
            });

            // Seed data
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Seed admin user
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    Email = "admin@medicareindia.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                    FirstName = "Admin",
                    LastName = "User",
                    PhoneNumber = "+91 11 1234 5678",
                    Role = UserRole.Admin,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                },
                // Seed sample doctors
                new User
                {
                    Id = 2,
                    Email = "dr.sharma@medicareindia.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Doctor123!"),
                    FirstName = "Rajesh",
                    LastName = "Sharma",
                    PhoneNumber = "+91 11 9876 5432",
                    Role = UserRole.Doctor,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                },
                new User
                {
                    Id = 3,
                    Email = "dr.patel@medicareindia.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Doctor123!"),
                    FirstName = "Priya",
                    LastName = "Patel",
                    PhoneNumber = "+91 22 8765 4321",
                    Role = UserRole.Doctor,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                },
                // Seed sample patients
                new User
                {
                    Id = 4,
                    Email = "patient1@medicareindia.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Patient123!"),
                    FirstName = "Amit",
                    LastName = "Kumar",
                    PhoneNumber = "+91 11 7654 3210",
                    Role = UserRole.Patient,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                },
                new User
                {
                    Id = 5,
                    Email = "patient2@medicareindia.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Patient123!"),
                    FirstName = "Sunita",
                    LastName = "Singh",
                    PhoneNumber = "+91 22 6543 2109",
                    Role = UserRole.Patient,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                }
            );

            // Seed doctor profiles
            modelBuilder.Entity<Doctor>().HasData(
                new Doctor
                {
                    Id = 1,
                    UserId = 2,
                    Specialization = "Cardiology",
                    LicenseNumber = "MD123456",
                    Bio = "Experienced cardiologist with over 10 years of practice. Specializes in heart disease prevention and treatment.",
                    Address = "123 AIIMS Campus, Ansari Nagar",
                    City = "New Delhi",
                    State = "Delhi",
                    ZipCode = "110029",
                    ConsultationFee = 800.00m,
                    ExperienceYears = 10,
                    IsVerified = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Doctor
                {
                    Id = 2,
                    UserId = 3,
                    Specialization = "Dermatology",
                    LicenseNumber = "MD789012",
                    Bio = "Board-certified dermatologist specializing in skin cancer treatment and cosmetic dermatology.",
                    Address = "456 Apollo Hospital, Greams Road",
                    City = "Chennai",
                    State = "Tamil Nadu",
                    ZipCode = "600006",
                    ConsultationFee = 600.00m,
                    ExperienceYears = 8,
                    IsVerified = true,
                    CreatedAt = DateTime.UtcNow
                }
            );

            // Seed patient profiles
            modelBuilder.Entity<Patient>().HasData(
                new Patient
                {
                    Id = 1,
                    UserId = 4,
                    DateOfBirth = new DateTime(1985, 5, 15),
                    Gender = "Male",
                    BloodType = "A+",
                    MedicalHistory = "No significant medical history",
                    Allergies = "None known",
                    EmergencyContactName = "Ravi Kumar",
                    EmergencyContactPhone = "+91 11 5432 1098",
                    InsuranceProvider = "Star Health",
                    InsuranceNumber = "SH123456789",
                    CreatedAt = DateTime.UtcNow
                },
                new Patient
                {
                    Id = 2,
                    UserId = 5,
                    DateOfBirth = new DateTime(1990, 8, 22),
                    Gender = "Female",
                    BloodType = "O+",
                    MedicalHistory = "Previous knee surgery in 2018",
                    Allergies = "Penicillin",
                    EmergencyContactName = "Vikram Singh",
                    EmergencyContactPhone = "+91 22 4321 0987",
                    InsuranceProvider = "HDFC ERGO",
                    InsuranceNumber = "HE987654321",
                    CreatedAt = DateTime.UtcNow
                }
            );

            // Seed availability for doctors
            modelBuilder.Entity<Availability>().HasData(
                // Dr. Smith's availability (Monday to Friday, 9 AM - 5 PM)
                new Availability
                {
                    Id = 1,
                    DoctorId = 1,
                    DayOfWeek = DayOfWeek.Monday,
                    StartTime = new TimeSpan(9, 0, 0),
                    EndTime = new TimeSpan(17, 0, 0),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Availability
                {
                    Id = 2,
                    DoctorId = 1,
                    DayOfWeek = DayOfWeek.Tuesday,
                    StartTime = new TimeSpan(9, 0, 0),
                    EndTime = new TimeSpan(17, 0, 0),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Availability
                {
                    Id = 3,
                    DoctorId = 1,
                    DayOfWeek = DayOfWeek.Wednesday,
                    StartTime = new TimeSpan(9, 0, 0),
                    EndTime = new TimeSpan(17, 0, 0),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Availability
                {
                    Id = 4,
                    DoctorId = 1,
                    DayOfWeek = DayOfWeek.Thursday,
                    StartTime = new TimeSpan(9, 0, 0),
                    EndTime = new TimeSpan(17, 0, 0),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Availability
                {
                    Id = 5,
                    DoctorId = 1,
                    DayOfWeek = DayOfWeek.Friday,
                    StartTime = new TimeSpan(9, 0, 0),
                    EndTime = new TimeSpan(17, 0, 0),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                // Dr. Johnson's availability (Monday, Wednesday, Friday, 10 AM - 6 PM)
                new Availability
                {
                    Id = 6,
                    DoctorId = 2,
                    DayOfWeek = DayOfWeek.Monday,
                    StartTime = new TimeSpan(10, 0, 0),
                    EndTime = new TimeSpan(18, 0, 0),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Availability
                {
                    Id = 7,
                    DoctorId = 2,
                    DayOfWeek = DayOfWeek.Wednesday,
                    StartTime = new TimeSpan(10, 0, 0),
                    EndTime = new TimeSpan(18, 0, 0),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Availability
                {
                    Id = 8,
                    DoctorId = 2,
                    DayOfWeek = DayOfWeek.Friday,
                    StartTime = new TimeSpan(10, 0, 0),
                    EndTime = new TimeSpan(18, 0, 0),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                }
            );
        }
    }
}
