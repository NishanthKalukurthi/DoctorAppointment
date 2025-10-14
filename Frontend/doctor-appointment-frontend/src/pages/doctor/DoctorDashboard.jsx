import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { doctorService } from '../../services/doctorService'
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp,
  Plus,
  Eye,
  Edit,
  RefreshCw,
  User,
  MapPin,
  Phone,
  Mail
} from 'lucide-react'

export const DoctorDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    monthlyRevenue: 0,
    totalPatients: 0
  })
  const [recentAppointments, setRecentAppointments] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // First get the doctor's profile to get their ID
      const doctorProfile = await doctorService.getProfile()
      console.log('Doctor profile:', doctorProfile)
      setProfile(doctorProfile)
      
      // Then get their appointments using their ID
      const appointments = await doctorService.getAppointments(doctorProfile.id)
      console.log('Doctor appointments:', appointments)
      
      // Set recent appointments (limit to 5)
      setRecentAppointments(appointments.slice(0, 5))
      
      // Calculate stats
      const today = new Date().toDateString()
      const todayAppts = appointments.filter(apt => 
        new Date(apt.appointmentDate).toDateString() === today
      )
      
      // Calculate monthly revenue (sum of all completed appointments)
      const completedAppointments = appointments.filter(apt => 
        apt.status === 'Completed' || apt.status === 3
      )
      const monthlyRevenue = completedAppointments.reduce((sum, apt) => {
        return sum + (apt.fee || doctorProfile.consultationFee || 0)
      }, 0)
      
      // Calculate unique patients
      const uniquePatients = new Set(appointments.map(apt => apt.patientId)).size
      
      setStats({
        totalAppointments: appointments.length,
        todayAppointments: todayAppts.length,
        monthlyRevenue: monthlyRevenue,
        totalPatients: uniquePatients
      })
      
      console.log('Dashboard stats calculated:', {
        totalAppointments: appointments.length,
        todayAppointments: todayAppts.length,
        monthlyRevenue: monthlyRevenue,
        totalPatients: uniquePatients
      })
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      // Set default values on error
      setStats({
        totalAppointments: 0,
        todayAppointments: 0,
        monthlyRevenue: 0,
        totalPatients: 0
      })
      setRecentAppointments([])
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
                Welcome back, Dr. {user?.lastName}
              </h1>
              <p className="text-gray-600">Here's what's happening with your practice today</p>
            </div>
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Profile Summary */}
        {profile && (
          <div className="card mb-8">
            <div className="flex items-start space-x-6">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-primary-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Dr. {profile.firstName} {profile.lastName}
                  </h2>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    {profile.specialization}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{profile.bio || 'Experienced medical professional dedicated to providing quality healthcare.'}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Consultation fee: <span className="font-medium">₹{profile.consultationFee || 0}</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {profile.practiceAddress || 'Address not provided'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Link
                  to="/doctor/profile"
                  className="btn-secondary"
                  title="Edit Profile"
                >
                  <Edit className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalAppointments}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Clock className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.todayAppointments}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">₹{stats.monthlyRevenue}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Users className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalPatients}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Appointments */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Appointments</h2>
                  <Link to="/doctor/appointments" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View all
                  </Link>
                </div>
              </div>
              
              <div className="space-y-4">
                {recentAppointments.length > 0 ? (
                  recentAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold">
                            {appointment.patientName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{appointment.patientName}</p>
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
                    <p className="text-gray-600">No appointments yet</p>
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
                  to="/doctor/availability"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-700">Add Availability</span>
                </Link>
                <Link
                  to="/doctor/profile"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-700">Edit Profile</span>
                </Link>
                <Link
                  to="/doctor/appointments"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-700">View Appointments</span>
                </Link>
              </div>
            </div>

            {/* Profile Summary */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Specialization</span>
                  <span className="font-medium">{profile?.specialization || 'Not specified'}</span>
                </div>
                {/* <div className="flex justify-between">
                  <span className="text-gray-600">Experience</span>
                  <span className="font-medium">{profile?.experience || 0} years</span>
                </div> */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Consultation Fee</span>
                  <span className="font-medium">₹{profile?.consultationFee || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="text-green-600 font-medium">Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
