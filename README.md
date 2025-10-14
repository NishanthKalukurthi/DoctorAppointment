# Doctor Appointment System

A comprehensive full-stack application for managing doctor appointments with separate interfaces for doctors, patients, and administrators.

## 🏗️ Architecture

- **Backend**: .NET Core Web API with JWT authentication
- **Frontend**: React with Vite, Tailwind CSS
- **Database**: SQL Server (LocalDB)
- **Authentication**: JWT Bearer tokens
- **State Management**: React Context API

## 🚀 Features

### For Patients
- User registration and authentication
- Search and filter doctors by specialization, location, and fees
- Book appointments with available time slots
- View and manage appointment history
- Update personal profile and medical information

### For Doctors
- Doctor registration with professional details
- Manage availability schedules
- View and manage patient appointments
- Update professional profile
- Track consultation fees and revenue

### For Administrators
- System overview and analytics
- User management and verification
- Reports and insights

## 🛠️ Tech Stack

### Backend
- .NET Core 9.0
- Entity Framework Core
- JWT Authentication
- AutoMapper
- BCrypt for password hashing
- SQL Server LocalDB

### Frontend
- React 18
- Vite
- React Router DOM
- Tailwind CSS
- React Hook Form
- Axios
- React Hot Toast
- Lucide React Icons

## 📦 Installation & Setup

### Prerequisites
- .NET 9.0 SDK
- Node.js 18+
- SQL Server LocalDB

### Backend Setup

1. Navigate to the backend directory:
```bash
cd Backend/DoctorAppointmentAPI
```

2. Restore packages:
```bash
dotnet restore
```

3. Update the connection string in `appsettings.json` if needed

4. Run the application:
```bash
dotnet run
```

The API will be available at `https://localhost:5001` and `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd Frontend/doctor-appointment-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔧 Configuration

### Backend Configuration
Update `appsettings.json` with your database connection string and JWT settings:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Your connection string here"
  },
  "JwtSettings": {
    "SecretKey": "Your super secret key (at least 32 characters)",
    "Issuer": "DoctorAppointmentAPI",
    "Audience": "DoctorAppointmentAPIUsers",
    "ExpiryMinutes": 60
  }
}
```

### Frontend Configuration
The frontend is configured to proxy API requests to `http://localhost:5000`. Update `vite.config.js` if your backend runs on a different port.

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - General registration
- `POST /api/auth/register/doctor` - Doctor registration
- `POST /api/auth/register/patient` - Patient registration

### Doctors
- `GET /api/doctors` - Get all doctors (with search filters)
- `GET /api/doctors/{id}` - Get doctor by ID
- `GET /api/doctors/profile` - Get current doctor's profile
- `PUT /api/doctors/profile` - Update doctor profile
- `GET /api/doctors/{id}/appointments` - Get doctor's appointments

### Patients
- `GET /api/patients/profile` - Get current patient's profile
- `PUT /api/patients/profile` - Update patient profile
- `GET /api/patients/appointments` - Get patient's appointments

### Appointments
- `POST /api/appointments` - Create new appointment
- `GET /api/appointments/{id}` - Get appointment by ID
- `PUT /api/appointments/{id}` - Update appointment
- `POST /api/appointments/{id}/cancel` - Cancel appointment

### Availability
- `GET /api/availability/doctor/{id}` - Get doctor's availability
- `GET /api/availability/doctor/{id}/slots` - Get available time slots
- `GET /api/availability/my-availability` - Get current doctor's availability
- `POST /api/availability/my-availability` - Add availability
- `PUT /api/availability/{id}` - Update availability
- `DELETE /api/availability/{id}` - Delete availability

## 🗄️ Database Schema

### Users
- Id, Email, PasswordHash, FirstName, LastName, PhoneNumber, Role, CreatedAt, UpdatedAt, IsActive

### Doctors
- Id, UserId, Specialization, LicenseNumber, Bio, ProfileImageUrl, Address, City, State, ZipCode, ConsultationFee, ExperienceYears, IsVerified

### Patients
- Id, UserId, DateOfBirth, Gender, BloodType, MedicalHistory, Allergies, EmergencyContactName, EmergencyContactPhone, InsuranceProvider, InsuranceNumber

### Appointments
- Id, DoctorId, PatientId, AppointmentDate, StartTime, EndTime, Status, Reason, Notes, Fee, CreatedAt, UpdatedAt, CancelledAt, CancellationReason

### Availability
- Id, DoctorId, DayOfWeek, StartTime, EndTime, IsActive, CreatedAt, UpdatedAt

## 🔐 Security Features

- JWT-based authentication
- Password hashing with BCrypt
- Role-based authorization
- CORS configuration
- Input validation
- SQL injection protection

## 🎨 UI/UX Features

- Responsive design with Tailwind CSS
- Modern, clean interface
- Intuitive navigation
- Real-time form validation
- Toast notifications
- Loading states
- Error handling

## 🚀 Getting Started

1. Clone the repository
2. Set up the backend following the backend setup instructions
3. Set up the frontend following the frontend setup instructions
4. Access the application at `http://localhost:3000`
5. Register as a doctor or patient to start using the system

## 📝 Default Admin Account

A default admin account is seeded in the database:
- Email: `admin@doctorapp.com`
- Password: `Admin123!`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.
