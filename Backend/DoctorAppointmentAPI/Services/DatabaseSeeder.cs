using DoctorAppointmentAPI.Data;
using DoctorAppointmentAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace DoctorAppointmentAPI.Services
{
    public static class DatabaseSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            try
            {
                // Check if we have any users already
                var hasUsers = false;
                try
                {
                    hasUsers = await context.Users.AnyAsync();
                }
                catch
                {
                    // If table doesn't exist, hasUsers remains false
                    hasUsers = false;
                }
                
                // Clear existing data for fresh seeding (for development)
                if (hasUsers)
                {
                    // Remove existing data
                    context.Availabilities.RemoveRange(context.Availabilities);
                    context.Appointments.RemoveRange(context.Appointments);
                    context.Doctors.RemoveRange(context.Doctors);
                    context.Patients.RemoveRange(context.Patients);
                    context.Users.RemoveRange(context.Users);
                    await context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                // If there's any error, just continue with seeding
                Console.WriteLine($"Database seeding check failed: {ex.Message}");
            }

            // Create admin account first
            var adminUser = new User
            {
                Email = "admin@medicare.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                FirstName = "Admin",
                LastName = "User",
                PhoneNumber = "9999999999",
                Role = UserRole.Admin,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            // Check if admin already exists
            var existingAdmin = await context.Users.FirstOrDefaultAsync(u => u.Email == "admin@medicare.com");
            if (existingAdmin == null)
            {
                context.Users.Add(adminUser);
                await context.SaveChangesAsync();
                Console.WriteLine("Admin account created successfully");
            }

            // Create sample doctors with Indian names
            var doctors = new List<(User user, Doctor doctor)>
            {
                new(
                    new User
                    {
                        Email = "dr.rajesh.sharma@medicare.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Doctor123!"),
                        FirstName = "Rajesh",
                        LastName = "Sharma",
                        PhoneNumber = "9876543210",
                        Role = UserRole.Doctor,
                        CreatedAt = DateTime.UtcNow,
                        IsActive = true
                    },
                    new Doctor
                    {
                        Specialization = "Cardiology",
                        LicenseNumber = "CARD001",
                        Bio = "Senior cardiologist with 15 years of experience. Specializes in heart disease prevention, treatment, and cardiac surgery.",
                        Address = "123 Apollo Heart Center",
                        City = "Mumbai",
                        State = "Maharashtra",
                        ZipCode = "400001",
                        ConsultationFee = 1500,
                        ExperienceYears = 15,
                        IsVerified = true,
                        CreatedAt = DateTime.UtcNow
                    }
                ),
                new(
                    new User
                    {
                        Email = "dr.priya.patel@medicare.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Doctor123!"),
                        FirstName = "Priya",
                        LastName = "Patel",
                        PhoneNumber = "9876543211",
                        Role = UserRole.Doctor,
                        CreatedAt = DateTime.UtcNow,
                        IsActive = true
                    },
                    new Doctor
                    {
                        Specialization = "Dermatology",
                        LicenseNumber = "DERM001",
                        Bio = "Board-certified dermatologist specializing in skin conditions, cosmetic dermatology, and hair treatments.",
                        Address = "456 Skin Care Clinic",
                        City = "Delhi",
                        State = "Delhi",
                        ZipCode = "110001",
                        ConsultationFee = 1200,
                        ExperienceYears = 12,
                        IsVerified = true,
                        CreatedAt = DateTime.UtcNow
                    }
                ),
                new(
                    new User
                    {
                        Email = "dr.vikram.singh@medicare.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Doctor123!"),
                        FirstName = "Vikram",
                        LastName = "Singh",
                        PhoneNumber = "9876543212",
                        Role = UserRole.Doctor,
                        CreatedAt = DateTime.UtcNow,
                        IsActive = true
                    },
                    new Doctor
                    {
                        Specialization = "Orthopedics",
                        LicenseNumber = "ORTH001",
                        Bio = "Orthopedic surgeon with expertise in joint replacement, sports medicine, and trauma surgery.",
                        Address = "789 Bone & Joint Center",
                        City = "Bangalore",
                        State = "Karnataka",
                        ZipCode = "560001",
                        ConsultationFee = 2000,
                        ExperienceYears = 18,
                        IsVerified = true,
                        CreatedAt = DateTime.UtcNow
                    }
                ),
                new(
                    new User
                    {
                        Email = "dr.anita.reddy@medicare.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Doctor123!"),
                        FirstName = "Anita",
                        LastName = "Reddy",
                        PhoneNumber = "9876543213",
                        Role = UserRole.Doctor,
                        CreatedAt = DateTime.UtcNow,
                        IsActive = true
                    },
                    new Doctor
                    {
                        Specialization = "Pediatrics",
                        LicenseNumber = "PED001",
                        Bio = "Pediatrician with 10 years of experience in child healthcare, development, and vaccination.",
                        Address = "321 Rainbow Children's Hospital",
                        City = "Chennai",
                        State = "Tamil Nadu",
                        ZipCode = "600001",
                        ConsultationFee = 1000,
                        ExperienceYears = 10,
                        IsVerified = true,
                        CreatedAt = DateTime.UtcNow
                    }
                ),
                new(
                    new User
                    {
                        Email = "dr.arun.kumar@medicare.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Doctor123!"),
                        FirstName = "Arun",
                        LastName = "Kumar",
                        PhoneNumber = "9876543214",
                        Role = UserRole.Doctor,
                        CreatedAt = DateTime.UtcNow,
                        IsActive = true
                    },
                    new Doctor
                    {
                        Specialization = "Neurology",
                        LicenseNumber = "NEURO001",
                        Bio = "Neurologist specializing in brain and nervous system disorders, epilepsy, and stroke treatment.",
                        Address = "654 Neuro Care Center",
                        City = "Hyderabad",
                        State = "Telangana",
                        ZipCode = "500001",
                        ConsultationFee = 1800,
                        ExperienceYears = 14,
                        IsVerified = true,
                        CreatedAt = DateTime.UtcNow
                    }
                ),
                new(
                    new User
                    {
                        Email = "dr.sneha.gupta@medicare.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Doctor123!"),
                        FirstName = "Sneha",
                        LastName = "Gupta",
                        PhoneNumber = "9876543215",
                        Role = UserRole.Doctor,
                        CreatedAt = DateTime.UtcNow,
                        IsActive = true
                    },
                    new Doctor
                    {
                        Specialization = "Gynecology",
                        LicenseNumber = "GYN001",
                        Bio = "Gynecologist with expertise in women's health, reproductive medicine, and high-risk pregnancies.",
                        Address = "987 Women's Wellness Center",
                        City = "Pune",
                        State = "Maharashtra",
                        ZipCode = "411001",
                        ConsultationFee = 1300,
                        ExperienceYears = 11,
                        IsVerified = true,
                        CreatedAt = DateTime.UtcNow
                    }
                ),
                new(
                    new User
                    {
                        Email = "dr.ramesh.iyer@medicare.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Doctor123!"),
                        FirstName = "Ramesh",
                        LastName = "Iyer",
                        PhoneNumber = "9876543216",
                        Role = UserRole.Doctor,
                        CreatedAt = DateTime.UtcNow,
                        IsActive = true
                    },
                    new Doctor
                    {
                        Specialization = "Ophthalmology",
                        LicenseNumber = "OPHTH001",
                        Bio = "Eye specialist with advanced training in cataract surgery, LASIK, and retinal disorders.",
                        Address = "147 Vision Care Center",
                        City = "Kolkata",
                        State = "West Bengal",
                        ZipCode = "700001",
                        ConsultationFee = 1100,
                        ExperienceYears = 13,
                        IsVerified = true,
                        CreatedAt = DateTime.UtcNow
                    }
                ),
                new(
                    new User
                    {
                        Email = "dr.kavitha.nair@medicare.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Doctor123!"),
                        FirstName = "Kavitha",
                        LastName = "Nair",
                        PhoneNumber = "9876543217",
                        Role = UserRole.Doctor,
                        CreatedAt = DateTime.UtcNow,
                        IsActive = true
                    },
                    new Doctor
                    {
                        Specialization = "Psychiatry",
                        LicenseNumber = "PSYCH001",
                        Bio = "Psychiatrist specializing in mental health disorders, therapy, and addiction treatment.",
                        Address = "258 Mind Care Center",
                        City = "Ahmedabad",
                        State = "Gujarat",
                        ZipCode = "380001",
                        ConsultationFee = 1600,
                        ExperienceYears = 16,
                        IsVerified = true,
                        CreatedAt = DateTime.UtcNow
                    }
                ),
                new(
                    new User
                    {
                        Email = "dr.suresh.jain@medicare.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Doctor123!"),
                        FirstName = "Suresh",
                        LastName = "Jain",
                        PhoneNumber = "9876543218",
                        Role = UserRole.Doctor,
                        CreatedAt = DateTime.UtcNow,
                        IsActive = true
                    },
                    new Doctor
                    {
                        Specialization = "Gastroenterology",
                        LicenseNumber = "GASTRO001",
                        Bio = "Gastroenterologist specializing in digestive system disorders, endoscopy, and liver diseases.",
                        Address = "369 Digestive Health Center",
                        City = "Jaipur",
                        State = "Rajasthan",
                        ZipCode = "302001",
                        ConsultationFee = 1400,
                        ExperienceYears = 12,
                        IsVerified = true,
                        CreatedAt = DateTime.UtcNow
                    }
                ),
                new(
                    new User
                    {
                        Email = "dr.meera.desai@medicare.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Doctor123!"),
                        FirstName = "Meera",
                        LastName = "Desai",
                        PhoneNumber = "9876543219",
                        Role = UserRole.Doctor,
                        CreatedAt = DateTime.UtcNow,
                        IsActive = true
                    },
                    new Doctor
                    {
                        Specialization = "Endocrinology",
                        LicenseNumber = "ENDO001",
                        Bio = "Endocrinologist specializing in diabetes, thyroid disorders, and hormonal imbalances.",
                        Address = "741 Hormone Care Clinic",
                        City = "Kochi",
                        State = "Kerala",
                        ZipCode = "682001",
                        ConsultationFee = 1250,
                        ExperienceYears = 9,
                        IsVerified = true,
                        CreatedAt = DateTime.UtcNow
                    }
                )
            };

            // Add users and doctors to context
            foreach (var (user, doctor) in doctors)
            {
                context.Users.Add(user);
                await context.SaveChangesAsync(); // Save to get the user ID
                
                doctor.UserId = user.Id;
                context.Doctors.Add(doctor);
            }

            // Create default availabilities for each doctor (9am-9pm except Sundays)
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

            await context.SaveChangesAsync(); // Save doctors first

            var doctorIds = await context.Doctors.Select(d => d.Id).ToListAsync();
            
            foreach (var doctorId in doctorIds)
            {
                foreach (var dayOfWeek in dayOfWeeks)
                {
                    foreach (var (startTime, endTime) in timeSlots)
                    {
                        context.Availabilities.Add(new Availability
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


            await context.SaveChangesAsync();
        }
    }
}
