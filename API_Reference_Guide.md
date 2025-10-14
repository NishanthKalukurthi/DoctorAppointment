# Doctor Appointment System - API Reference Guide

## Base Configuration

**Base URL**: `https://localhost:7001/api`  
**Content-Type**: `application/json`  
**Authentication**: Bearer Token (JWT)

---

## Authentication Endpoints

### POST /auth/login
Authenticate user and receive JWT token.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "Patient",
    "isActive": true
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid credentials
- `401 Unauthorized`: Account not verified (for doctors)
- `500 Internal Server Error`: Server error

---

### POST /auth/register
Register new user account.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "1234567890",
  "role": "Patient"
}
```

**Success Response (201)**:
```json
{
  "message": "Registration successful",
  "userId": 1
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors
- `409 Conflict`: Email already exists
- `500 Internal Server Error`: Server error

---

## Doctor Endpoints

### GET /doctors
Get list of all verified doctors.

**Query Parameters**:
- `specialization` (optional): Filter by specialization
- `search` (optional): Search by doctor name

**Example**: `/doctors?specialization=Cardiology&search=John`

**Success Response (200)**:
```json
[
  {
    "id": 1,
    "firstName": "Dr. Jane",
    "lastName": "Smith",
    "specialization": "Cardiology",
    "experience": 10,
    "consultationFee": 1000,
    "bio": "Experienced cardiologist with 10 years of practice...",
    "practiceAddress": "123 Medical Street, City",
    "isVerified": true
  }
]
```

---

### GET /doctors/{id}
Get specific doctor details.

**Success Response (200)**:
```json
{
  "id": 1,
  "firstName": "Dr. Jane",
  "lastName": "Smith",
  "specialization": "Cardiology",
  "experience": 10,
  "consultationFee": 1000,
  "bio": "Experienced cardiologist...",
  "practiceAddress": "123 Medical Street",
  "isVerified": true
}
```

**Error Responses**:
- `404 Not Found`: Doctor not found
- `500 Internal Server Error`: Server error

---

### GET /doctors/profile
Get current doctor's profile. **Requires Doctor role.**

**Headers**: `Authorization: Bearer <token>`

**Success Response (200)**:
```json
{
  "id": 1,
  "firstName": "Dr. Jane",
  "lastName": "Smith",
  "specialization": "Cardiology",
  "experience": 10,
  "consultationFee": 1000,
  "bio": "Experienced cardiologist...",
  "practiceAddress": "123 Medical Street",
  "isVerified": true,
  "userId": 1
}
```

---

### PUT /doctors/profile
Update doctor profile. **Requires Doctor role.**

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "specialization": "Cardiology",
  "experience": 10,
  "consultationFee": 1000,
  "bio": "Updated bio information...",
  "practiceAddress": "123 Medical Street, City"
}
```

**Success Response (200)**:
```json
{
  "message": "Profile updated successfully"
}
```

---

### GET /doctors/{doctorId}/appointments
Get appointments for specific doctor. **Requires Doctor role.**

**Headers**: `Authorization: Bearer <token>`

**Success Response (200)**:
```json
[
  {
    "id": 1,
    "appointmentDate": "2024-01-15",
    "startTime": "10:00:00",
    "endTime": "11:00:00",
    "status": 1,
    "reason": "Regular checkup",
    "notes": "Patient is doing well",
    "fee": 1000,
    "patientName": "John Doe",
    "patientId": 1
  }
]
```

---

## Patient Endpoints

### GET /patients/profile
Get current patient's profile. **Requires Patient role.**

**Headers**: `Authorization: Bearer <token>`

**Success Response (200)**:
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "1234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "Male",
  "address": "123 Patient Street",
  "emergencyContact": "9876543210",
  "medicalHistory": "No significant medical history",
  "userId": 1
}
```

---

### PUT /patients/profile
Update patient profile. **Requires Patient role.**

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "dateOfBirth": "1990-01-01",
  "gender": "Male",
  "address": "123 Patient Street",
  "emergencyContact": "9876543210",
  "medicalHistory": "Updated medical history"
}
```

**Success Response (200)**:
```json
{
  "message": "Profile updated successfully"
}
```

---

### GET /patients/appointments
Get appointments for current patient. **Requires Patient role.**

**Headers**: `Authorization: Bearer <token>`

**Success Response (200)**:
```json
[
  {
    "id": 1,
    "appointmentDate": "2024-01-15",
    "startTime": "10:00:00",
    "endTime": "11:00:00",
    "status": 1,
    "reason": "Regular checkup",
    "notes": "Patient is doing well",
    "fee": 1000,
    "doctorName": "Dr. Jane Smith",
    "doctorSpecialization": "Cardiology",
    "doctorId": 1
  }
]
```

---

## Appointment Endpoints

### GET /appointments
Get appointments for current user (role-based).

**Headers**: `Authorization: Bearer <token>`

**Success Response (200)**:
```json
[
  {
    "id": 1,
    "appointmentDate": "2024-01-15",
    "startTime": "10:00:00",
    "endTime": "11:00:00",
    "status": 1,
    "reason": "Regular checkup",
    "notes": "Patient is doing well",
    "fee": 1000,
    "patientName": "John Doe",
    "doctorName": "Dr. Jane Smith",
    "doctorSpecialization": "Cardiology",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

---

### POST /appointments
Create new appointment. **Requires Patient role.**

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "doctorId": 1,
  "appointmentDate": "2024-01-15",
  "startTime": "10:00:00",
  "endTime": "11:00:00",
  "reason": "Regular checkup"
}
```

**Success Response (201)**:
```json
{
  "id": 1,
  "message": "Appointment created successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid appointment data or slot not available
- `409 Conflict`: Time slot already booked
- `500 Internal Server Error`: Server error

---

### PATCH /appointments/{id}/status
Update appointment status. **Requires Doctor or Admin role.**

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "status": 1,
  "cancellationReason": "Patient requested cancellation"
}
```

**Status Values**:
- `0`: Scheduled
- `1`: Confirmed
- `2`: InProgress
- `3`: Completed
- `4`: Cancelled
- `5`: NoShow

**Success Response (200)**:
```json
{
  "message": "Appointment status updated successfully"
}
```

---

### DELETE /appointments/{id}
Cancel appointment. **Requires Patient role.**

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "cancellationReason": "Patient requested cancellation"
}
```

**Success Response (200)**:
```json
{
  "message": "Appointment cancelled successfully"
}
```

---

## Availability Endpoints

### GET /availability/my-availability
Get current doctor's availability. **Requires Doctor role.**

**Headers**: `Authorization: Bearer <token>`

**Success Response (200)**:
```json
[
  {
    "id": 1,
    "dayOfWeek": 1,
    "startTime": "09:00:00",
    "endTime": "10:00:00",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

**Day of Week Values**:
- `0`: Sunday
- `1`: Monday
- `2`: Tuesday
- `3`: Wednesday
- `4`: Thursday
- `5`: Friday
- `6`: Saturday

---

### POST /availability/my-availability
Create new availability slot. **Requires Doctor role.**

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "dayOfWeek": 1,
  "startTime": "09:00:00",
  "endTime": "10:00:00"
}
```

**Success Response (201)**:
```json
{
  "id": 1,
  "message": "Availability created successfully"
}
```

---

### PUT /availability/{id}
Update availability slot. **Requires Doctor role.**

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "dayOfWeek": 1,
  "startTime": "09:00:00",
  "endTime": "10:00:00",
  "isActive": true
}
```

**Success Response (200)**:
```json
{
  "message": "Availability updated successfully"
}
```

---

### DELETE /availability/{id}
Delete availability slot. **Requires Doctor role.**

**Headers**: `Authorization: Bearer <token>`

**Success Response (200)**:
```json
{
  "message": "Availability deleted successfully"
}
```

---

### GET /availability/doctor/{doctorId}
Get doctor's availability (public endpoint).

**Success Response (200)**:
```json
[
  {
    "id": 1,
    "dayOfWeek": 1,
    "startTime": "09:00:00",
    "endTime": "10:00:00",
    "isActive": true
  }
]
```

---

### GET /availability/doctor/{doctorId}/slots
Get available time slots for a doctor.

**Query Parameters**:
- `startDate` (required): Start date (YYYY-MM-DD)
- `endDate` (required): End date (YYYY-MM-DD)

**Example**: `/availability/doctor/1/slots?startDate=2024-01-15&endDate=2024-01-20`

**Success Response (200)**:
```json
[
  {
    "date": "2024-01-15",
    "slots": [
      {
        "startTime": "09:00:00",
        "endTime": "10:00:00",
        "isAvailable": true
      },
      {
        "startTime": "10:00:00",
        "endTime": "11:00:00",
        "isAvailable": false
      }
    ]
  }
]
```

---

## Admin Endpoints

### GET /admin/dashboard-stats
Get dashboard statistics. **Requires Admin role.**

**Headers**: `Authorization: Bearer <token>`

**Success Response (200)**:
```json
{
  "totalUsers": 100,
  "totalDoctors": 25,
  "totalPatients": 75,
  "totalAppointments": 500,
  "pendingAppointments": 50,
  "completedAppointments": 400,
  "cancelledAppointments": 50
}
```

---

### GET /admin/doctors
Get all doctors. **Requires Admin role.**

**Headers**: `Authorization: Bearer <token>`

**Success Response (200)**:
```json
[
  {
    "id": 1,
    "firstName": "Dr. Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "specialization": "Cardiology",
    "isVerified": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

---

### GET /admin/doctors/pending
Get pending doctor approvals. **Requires Admin role.**

**Headers**: `Authorization: Bearer <token>`

**Success Response (200)**:
```json
[
  {
    "id": 1,
    "firstName": "Dr. New",
    "lastName": "Doctor",
    "email": "new@example.com",
    "specialization": "General Medicine",
    "isVerified": false,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

---

### POST /admin/doctors/{id}/approve
Approve doctor registration. **Requires Admin role.**

**Headers**: `Authorization: Bearer <token>`

**Success Response (200)**:
```json
{
  "message": "Doctor approved successfully"
}
```

---

### POST /admin/doctors/{id}/reject
Reject doctor registration. **Requires Admin role.**

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "reason": "Incomplete documentation"
}
```

**Success Response (200)**:
```json
{
  "message": "Doctor rejected successfully"
}
```

---

### GET /admin/appointments
Get all appointments. **Requires Admin role.**

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `status` (optional): Filter by status
- `date` (optional): Filter by date
- `doctorId` (optional): Filter by doctor

**Success Response (200)**:
```json
[
  {
    "id": 1,
    "appointmentDate": "2024-01-15",
    "startTime": "10:00:00",
    "endTime": "11:00:00",
    "status": 1,
    "reason": "Regular checkup",
    "notes": "Patient is doing well",
    "fee": 1000,
    "patientName": "John Doe",
    "doctorName": "Dr. Jane Smith",
    "doctorSpecialization": "Cardiology",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

---

### PATCH /admin/appointments/{id}/status
Update appointment status. **Requires Admin role.**

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "status": 4,
  "cancellationReason": "Admin cancelled due to emergency"
}
```

**Success Response (200)**:
```json
{
  "message": "Appointment status updated successfully"
}
```

---

### GET /admin/patients
Get all patients. **Requires Admin role.**

**Headers**: `Authorization: Bearer <token>`

**Success Response (200)**:
```json
[
  {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "1234567890",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

---

### GET /admin/reports
Get system reports. **Requires Admin role.**

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `startDate` (optional): Report start date
- `endDate` (optional): Report end date
- `type` (optional): Report type (revenue, appointments, doctors)

**Success Response (200)**:
```json
{
  "overview": {
    "totalRevenue": 50000,
    "totalAppointments": 500,
    "completedAppointments": 400,
    "cancelledAppointments": 50,
    "noShowAppointments": 50,
    "averageAppointmentValue": 1000
  },
  "topDoctors": [
    {
      "name": "Dr. Jane Smith",
      "specialization": "Cardiology",
      "appointments": 50,
      "revenue": 50000
    }
  ],
  "popularSpecializations": [
    {
      "name": "Cardiology",
      "count": 100,
      "percentage": 20
    }
  ],
  "monthlyStats": [
    {
      "month": "January 2024",
      "appointments": 50,
      "revenue": 50000
    }
  ]
}
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "message": "Error description",
  "errors": {
    "fieldName": ["Validation error message"]
  }
}
```

### HTTP Status Codes
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate email)
- `500 Internal Server Error`: Server error

### Common Error Scenarios

#### Authentication Errors
```json
{
  "message": "Invalid credentials"
}
```

#### Validation Errors
```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["Email is required"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

#### Authorization Errors
```json
{
  "message": "Access denied. Insufficient permissions."
}
```

#### Resource Not Found
```json
{
  "message": "Doctor not found"
}
```

---

## Rate Limiting

Currently, no rate limiting is implemented. Future versions may include:
- 100 requests per minute per IP
- 1000 requests per hour per authenticated user

---

## Pagination

For endpoints that return lists, pagination parameters may be added in future versions:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `sortBy`: Sort field
- `sortOrder`: Sort direction (asc/desc)

---

## Webhooks

Webhook functionality is not currently implemented but may be added for:
- Appointment status changes
- New doctor registrations
- System notifications

---

## SDKs and Libraries

### JavaScript/TypeScript
```javascript
// Example API client usage
const apiClient = {
  baseURL: 'https://localhost:7001/api',
  
  async login(email, password) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },
  
  async getDoctors() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/doctors`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};
```

### cURL Examples
```bash
# Login
curl -X POST https://localhost:7001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get doctors (with token)
curl -X GET https://localhost:7001/api/doctors \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create appointment
curl -X POST https://localhost:7001/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"doctorId":1,"appointmentDate":"2024-01-15","startTime":"10:00:00","endTime":"11:00:00","reason":"Checkup"}'
```

---

*This API reference is maintained and updated regularly. For the latest version, please refer to the project repository.*

