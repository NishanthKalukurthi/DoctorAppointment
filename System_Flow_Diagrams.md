# Doctor Appointment System - Flow Diagrams

## Table of Contents
1. [System Architecture Flow](#system-architecture-flow)
2. [Authentication Flow](#authentication-flow)
3. [User Registration Flow](#user-registration-flow)
4. [Appointment Booking Flow](#appointment-booking-flow)
5. [Doctor Approval Flow](#doctor-approval-flow)
6. [Availability Management Flow](#availability-management-flow)
7. [Status Update Flow](#status-update-flow)
8. [Report Generation Flow](#report-generation-flow)

---

## System Architecture Flow

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser]
        B[React Frontend]
    end
    
    subgraph "API Layer"
        C[ASP.NET Core Web API]
        D[JWT Authentication]
        E[Authorization Middleware]
    end
    
    subgraph "Business Logic Layer"
        F[Controllers]
        G[Services]
        H[DTOs]
    end
    
    subgraph "Data Access Layer"
        I[Entity Framework Core]
        J[Repository Pattern]
    end
    
    subgraph "Data Layer"
        K[SQL Server Database]
        L[Users Table]
        M[Doctors Table]
        N[Patients Table]
        O[Appointments Table]
        P[Availability Table]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
    K --> L
    K --> M
    K --> N
    K --> O
    K --> P
```

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant D as Database
    
    U->>F: Enter credentials
    F->>A: POST /auth/login
    A->>D: Validate credentials
    D-->>A: User data
    A->>A: Generate JWT token
    A-->>F: Token + User data
    F->>F: Store token in localStorage
    F-->>U: Redirect to dashboard
    
    Note over F,A: Subsequent requests
    F->>A: API request with Bearer token
    A->>A: Validate JWT token
    A->>A: Check user permissions
    A-->>F: API response
```

---

## User Registration Flow

```mermaid
graph TD
    A[User visits registration page] --> B{Select user type}
    B -->|Patient| C[Patient Registration Form]
    B -->|Doctor| D[Doctor Registration Form]
    
    C --> E[Fill patient details]
    D --> F[Fill doctor details + credentials]
    
    E --> G[Submit patient registration]
    F --> H[Submit doctor registration]
    
    G --> I[Create user account]
    H --> J[Create user account]
    
    I --> K[Create patient profile]
    J --> L[Create doctor profile]
    
    K --> M[Account ready - can login]
    L --> N[Account pending approval]
    
    N --> O[Admin notification]
    O --> P[Admin reviews application]
    P --> Q{Admin decision}
    
    Q -->|Approve| R[Activate doctor account]
    Q -->|Reject| S[Deactivate doctor account]
    
    R --> T[Create default availability]
    T --> U[Doctor can login]
    S --> V[Doctor cannot login]
```

---

## Appointment Booking Flow

```mermaid
sequenceDiagram
    participant P as Patient
    participant F as Frontend
    participant A as API
    participant D as Database
    
    P->>F: Search for doctors
    F->>A: GET /doctors?specialization=Cardiology
    A->>D: Query doctors table
    D-->>A: List of doctors
    A-->>F: Doctor list
    F-->>P: Display doctors
    
    P->>F: Select doctor and date
    F->>A: GET /availability/doctor/1/slots?startDate=2024-01-15&endDate=2024-01-15
    A->>D: Query availability and appointments
    D-->>A: Available time slots
    A-->>F: Available slots
    F-->>P: Display time slots
    
    P->>F: Select time slot and fill details
    F->>A: POST /appointments
    A->>A: Validate appointment data
    A->>D: Check slot availability
    D-->>A: Slot available
    A->>D: Create appointment
    D-->>A: Appointment created
    A-->>F: Success response
    F-->>P: Booking confirmation
```

---

## Doctor Approval Flow

```mermaid
sequenceDiagram
    participant DR as Doctor Registration
    participant A as API
    participant D as Database
    participant AD as Admin
    participant F as Frontend
    
    DR->>A: POST /auth/register (Doctor)
    A->>D: Create user and doctor records
    D-->>A: Records created
    A-->>DR: Registration pending approval
    
    AD->>F: Login as admin
    F->>A: GET /admin/doctors/pending
    A->>D: Query pending doctors
    D-->>A: Pending doctors list
    A-->>F: Pending doctors
    F-->>AD: Display pending doctors
    
    AD->>F: Click approve button
    F->>A: POST /admin/doctors/1/approve
    A->>D: Update doctor verification status
    A->>D: Create default availability slots
    D-->>A: Updates successful
    A-->>F: Approval successful
    F-->>AD: Doctor approved notification
    
    Note over DR,A: Doctor can now login
    DR->>A: POST /auth/login
    A->>D: Validate credentials
    D-->>A: Doctor verified
    A-->>DR: Login successful
```

---

## Availability Management Flow

```mermaid
graph TD
    A[Doctor logs in] --> B[Navigate to availability]
    B --> C[View current availability]
    C --> D{Want to modify?}
    
    D -->|Yes| E[Click add/edit availability]
    D -->|No| F[Continue to other features]
    
    E --> G[Fill availability form]
    G --> H[Select day of week]
    H --> I[Select start time]
    I --> J[Select end time]
    J --> K[Submit availability]
    
    K --> L{Valid data?}
    L -->|No| M[Show validation errors]
    L -->|Yes| N[Save to database]
    
    M --> G
    N --> O[Update availability list]
    O --> P[Show success message]
    
    P --> Q[Doctor can manage appointments]
    F --> Q
```

---

## Status Update Flow

```mermaid
sequenceDiagram
    participant D as Doctor
    participant F as Frontend
    participant A as API
    participant DB as Database
    participant P as Patient
    
    D->>F: View appointments
    F->>A: GET /doctors/1/appointments
    A->>DB: Query appointments
    DB-->>A: Appointments list
    A-->>F: Appointments data
    F-->>D: Display appointments
    
    D->>F: Click update status
    F->>F: Show status update modal
    D->>F: Select new status and add notes
    F->>A: PATCH /appointments/1/status
    A->>A: Validate status transition
    A->>DB: Update appointment status
    DB-->>A: Update successful
    A-->>F: Status updated
    F-->>D: Show success message
    
    Note over P: Patient can see updated status
    P->>F: View appointments
    F->>A: GET /patients/appointments
    A->>DB: Query patient appointments
    DB-->>A: Updated appointment data
    A-->>F: Appointments with new status
    F-->>P: Display updated status
```

---

## Report Generation Flow

```mermaid
graph TD
    A[Admin logs in] --> B[Navigate to reports]
    B --> C[Select report type]
    C --> D{Report type}
    
    D -->|Revenue Report| E[Generate revenue data]
    D -->|Appointment Report| F[Generate appointment data]
    D -->|Doctor Report| G[Generate doctor data]
    D -->|Patient Report| H[Generate patient data]
    
    E --> I[Query appointments table]
    F --> J[Query appointments with filters]
    G --> K[Query doctors and appointments]
    H --> L[Query patients and appointments]
    
    I --> M[Calculate total revenue]
    J --> N[Count appointments by status]
    K --> O[Calculate doctor performance]
    L --> P[Count patient statistics]
    
    M --> Q[Format data for display]
    N --> Q
    O --> Q
    P --> Q
    
    Q --> R{Export format}
    R -->|PDF| S[Generate PDF report]
    R -->|Excel| T[Generate CSV file]
    R -->|View| U[Display in browser]
    
    S --> V[Download PDF]
    T --> W[Download CSV]
    U --> X[Show report in UI]
```

---

## Data Flow Diagrams

### Patient Data Flow

```mermaid
graph LR
    A[Patient Registration] --> B[User Table]
    B --> C[Patient Table]
    C --> D[Appointment Booking]
    D --> E[Appointments Table]
    E --> F[Status Updates]
    F --> G[Appointment History]
```

### Doctor Data Flow

```mermaid
graph LR
    A[Doctor Registration] --> B[User Table]
    B --> C[Doctor Table]
    C --> D[Admin Approval]
    D --> E[Default Availability]
    E --> F[Availability Table]
    F --> G[Appointment Management]
    G --> H[Status Updates]
```

### Admin Data Flow

```mermaid
graph LR
    A[Admin Login] --> B[User Table]
    B --> C[Doctor Approval]
    C --> D[System Reports]
    D --> E[Data Aggregation]
    E --> F[Report Generation]
    F --> G[Export/Display]
```

---

## Error Handling Flow

```mermaid
graph TD
    A[API Request] --> B{Valid Request?}
    B -->|No| C[Return 400 Bad Request]
    B -->|Yes| D{Authenticated?}
    
    D -->|No| E[Return 401 Unauthorized]
    D -->|Yes| F{Authorized?}
    
    F -->|No| G[Return 403 Forbidden]
    F -->|Yes| H[Process Request]
    
    H --> I{Success?}
    I -->|No| J[Return 500 Internal Error]
    I -->|Yes| K[Return 200 Success]
    
    C --> L[Log Error]
    E --> L
    G --> L
    J --> L
    L --> M[Error Monitoring]
```

---

## Security Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant F as Frontend
    participant A as API
    participant J as JWT Service
    participant D as Database
    
    C->>F: Request protected resource
    F->>F: Check localStorage for token
    F->>A: API request with Bearer token
    A->>J: Validate JWT token
    J->>J: Check token signature
    J->>J: Check token expiration
    J-->>A: Token valid/invalid
    
    alt Token Valid
        A->>A: Extract user claims
        A->>A: Check user permissions
        A->>D: Execute business logic
        D-->>A: Data response
        A-->>F: Success response
        F-->>C: Display data
    else Token Invalid/Expired
        A-->>F: 401 Unauthorized
        F->>F: Clear localStorage
        F-->>C: Redirect to login
    end
```

---

## Database Transaction Flow

```mermaid
sequenceDiagram
    participant A as API
    participant EF as Entity Framework
    participant DB as Database
    participant T as Transaction
    
    A->>EF: Begin transaction
    EF->>T: Start transaction
    T->>DB: BEGIN TRANSACTION
    
    A->>EF: Create appointment
    EF->>DB: INSERT INTO Appointments
    DB-->>EF: Appointment created
    
    A->>EF: Update availability
    EF->>DB: UPDATE Availability
    DB-->>EF: Availability updated
    
    A->>EF: Commit transaction
    EF->>T: Commit
    T->>DB: COMMIT TRANSACTION
    DB-->>T: Transaction committed
    T-->>EF: Success
    EF-->>A: Success response
    
    Note over A,DB: If any step fails, rollback occurs
```

---

## Caching Flow (Future Enhancement)

```mermaid
graph TD
    A[API Request] --> B{Cache exists?}
    B -->|Yes| C[Return cached data]
    B -->|No| D[Query database]
    D --> E[Store in cache]
    E --> F[Return data]
    
    G[Data Update] --> H[Invalidate cache]
    H --> I[Update database]
    I --> J[Cache refreshed]
```

---

## Notification Flow (Future Enhancement)

```mermaid
sequenceDiagram
    participant S as System
    participant N as Notification Service
    participant E as Email Service
    participant SMS as SMS Service
    participant P as Push Service
    participant U as User
    
    S->>N: Trigger notification
    N->>N: Determine notification type
    N->>E: Send email notification
    N->>SMS: Send SMS notification
    N->>P: Send push notification
    
    E-->>U: Email received
    SMS-->>U: SMS received
    P-->>U: Push notification
```

---

*These flow diagrams provide a comprehensive view of how the Doctor Appointment System operates. They can be used for system understanding, development planning, and troubleshooting.*


