import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { patientService } from '../../services/patientService'
import { 
  Calendar, 
  Clock, 
  Search, 
  User,
  Plus,
  Eye,
  Edit,
  RefreshCw
} from 'lucide-react'

export const PatientDashboard = () => {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const data = await patientService.getAppointments()
      console.log('Patient appointments fetched:', data)
      setAppointments(data)
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    // Handle both string and numeric status values
    const statusValue = typeof status === 'number' ? status : status
    switch (statusValue) {
      case 'Scheduled':
      case 0: return 'bg-blue-100 text-blue-800'
      case 'Confirmed':
      case 1: return 'bg-green-100 text-green-800'
      case 'InProgress':
      case 2: return 'bg-yellow-100 text-yellow-800'
      case 'Completed':
      case 3: return 'bg-gray-100 text-gray-800'
      case 'Cancelled':
      case 4: return 'bg-red-100 text-red-800'
      case 'NoShow':
      case 5: return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    // Convert numeric status to string for display
    switch (status) {
      case 0: return 'Scheduled'
      case 1: return 'Confirmed'
      case 2: return 'InProgress'
      case 3: return 'Completed'
      case 4: return 'Cancelled'
      case 5: return 'NoShow'
      default: return status // Return as-is if it's already a string
    }
  }

  const isFinalState = (status) => {
    // Check if appointment is in a final state (completed, cancelled, or no-show)
    return status === 'Completed' || status === 3 || 
           status === 'Cancelled' || status === 4 || 
           status === 'NoShow' || status === 5
  }

  const upcomingAppointments = appointments.filter(apt => {
    const isFutureDate = new Date(apt.appointmentDate) >= new Date()
    const isNotFinalState = !isFinalState(apt.status)
    const isUpcoming = isFutureDate && isNotFinalState
    
    console.log(`Appointment ${apt.id}:`, {
      date: apt.appointmentDate,
      status: apt.status,
      statusText: getStatusText(apt.status),
      isFutureDate,
      isNotFinalState,
      isUpcoming
    })
    
    return isUpcoming
  }).slice(0, 3)

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.firstName}
              </h1>
              <p className="text-gray-600">Manage your health appointments and find care</p>
            </div>
            <button
              onClick={fetchAppointments}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                <p className="text-2xl font-semibold text-gray-900">{appointments.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Clock className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-semibold text-gray-900">{upcomingAppointments.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <User className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Doctors Visited</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {new Set(appointments.map(apt => apt.doctorId)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
                  <Link to="/patient/appointments" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View all
                  </Link>
                </div>
              </div>
              
              <div className="space-y-4">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold">
                            Dr. {appointment.doctorName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Dr. {appointment.doctorName}</p>
                          <p className="text-sm text-gray-600">{appointment.doctorSpecialization}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(appointment.appointmentDate).toLocaleDateString()} at{' '}
                            {new Date(`2000-01-01T${appointment.startTime}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No upcoming appointments</p>
                    <Link to="/doctors" className="btn-primary">
                      Find Doctors
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/doctors"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Search className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-700">Find Doctors</span>
                </Link>
                <Link
                  to="/patient/profile"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-700">Update Profile</span>
                </Link>
                <Link
                  to="/patient/appointments"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-700">View Appointments</span>
                </Link>
              </div>
            </div>

            {/* Health Summary */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Checkup</span>
                  <span className="font-medium">2 months ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Appointment</span>
                  <span className="font-medium">
                    {upcomingAppointments.length > 0 
                      ? new Date(upcomingAppointments[0].appointmentDate).toLocaleDateString()
                      : 'None scheduled'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Primary Doctor</span>
                  <span className="font-medium">Dr. Smith</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Health Status</span>
                  <span className="text-green-600 font-medium">Good</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
