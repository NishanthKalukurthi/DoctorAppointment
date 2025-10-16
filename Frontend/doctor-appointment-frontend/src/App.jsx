import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'

// Pages
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DoctorRegisterPage } from './pages/DoctorRegisterPage'
import { DoctorDashboard } from './pages/doctor/DoctorDashboard'
import { DoctorProfile } from './pages/doctor/DoctorProfile'
import { DoctorAvailability } from './pages/doctor/DoctorAvailability'
import { DoctorAppointments } from './pages/doctor/DoctorAppointments'
import { PatientDashboard } from './pages/patient/PatientDashboard'
import { PatientProfile } from './pages/patient/PatientProfile'
import { PatientAppointments } from './pages/patient/PatientAppointments'
import { SearchDoctors } from './pages/patient/SearchDoctors'
import { BookAppointment } from './pages/patient/BookAppointment'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminDoctors } from './pages/admin/AdminDoctors'
import { AdminPendingDoctors } from './pages/admin/AdminPendingDoctors'
import { AdminPatients } from './pages/admin/AdminPatients'
import { AdminAppointments } from './pages/admin/AdminAppointments'
import { AdminReports } from './pages/admin/AdminReports'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register/patient" element={<RegisterPage />} />
            <Route path="/register/doctor" element={<DoctorRegisterPage />} />
            <Route path="/doctors" element={<SearchDoctors />} />
            
            {/* Protected Doctor routes */}
            <Route path="/doctor" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/doctor/profile" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <DoctorProfile />
              </ProtectedRoute>
            } />
            <Route path="/doctor/availability" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <DoctorAvailability />
              </ProtectedRoute>
            } />
            <Route path="/doctor/appointments" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <DoctorAppointments />
              </ProtectedRoute>
            } />
            
            {/* Protected Patient routes */}
            <Route path="/patient" element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/patient/profile" element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <PatientProfile />
              </ProtectedRoute>
            } />
            <Route path="/patient/appointments" element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <PatientAppointments />
              </ProtectedRoute>
            } />
            <Route path="/patient/book/:doctorId" element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <BookAppointment />
              </ProtectedRoute>
            } />
            
            {/* Protected Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/doctors" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDoctors />
              </ProtectedRoute>
            } />
            <Route path="/admin/pending-doctors" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminPendingDoctors />
              </ProtectedRoute>
            } />
            <Route path="/admin/patients" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminPatients />
              </ProtectedRoute>
            } />
            <Route path="/admin/appointments" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminAppointments />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminReports />
              </ProtectedRoute>
            } />
            
            {/* Redirect to home for unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}

export default App
