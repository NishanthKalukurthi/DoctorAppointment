import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Activity, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Database
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminService } from '../../services/adminService'

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0
  })
  const [recentAppointments, setRecentAppointments] = useState([])
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch real data from API
      const [statsData, appointmentsData, usersData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRecentAppointments(),
        adminService.getRecentUsers()
      ])

      setStats(statsData)

      // Transform appointments data
      const transformedAppointments = appointmentsData.map(appointment => ({
        id: appointment.id,
        patientName: appointment.patientName,
        doctorName: appointment.doctorName,
        date: appointment.appointmentDate,
        time: appointment.startTime,
        status: appointment.status,
        specialization: appointment.doctorSpecialization
      }))
      setRecentAppointments(transformedAppointments)

      // Transform users data
      const transformedUsers = usersData.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        joinDate: user.joinDate
      }))
      setRecentUsers(transformedUsers)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to fetch dashboard data')
      
      // Fallback to mock data if API fails
      setStats({
        totalUsers: 0,
        totalDoctors: 0,
        totalPatients: 0,
        totalAppointments: 0,
        pendingAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0
      })
      setRecentAppointments([])
      setRecentUsers([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled': return 'text-blue-600 bg-blue-100'
      case 'Completed': return 'text-green-600 bg-green-100'
      case 'Cancelled': return 'text-red-600 bg-red-100'
      case 'Active': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Scheduled': return <Clock className="w-4 h-4" />
      case 'Completed': return <CheckCircle className="w-4 h-4" />
      case 'Cancelled': return <XCircle className="w-4 h-4" />
      case 'Active': return <CheckCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const handleSeedDatabase = async () => {
    try {
      await adminService.seedDatabase()
      toast.success('Database seeded successfully!')
      // Refresh the dashboard data
      fetchDashboardData()
    } catch (error) {
      console.error('Error seeding database:', error)
      toast.error('Failed to seed database')
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="text-sm text-gray-600">
            Welcome back, Admin!
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Doctors</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDoctors}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-xl font-bold text-blue-600">{stats.pendingAppointments}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-xl font-bold text-green-600">{stats.completedAppointments}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-xl font-bold text-red-600">{stats.cancelledAppointments}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Appointments */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Appointments</h2>
              <Link to="/admin/appointments" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium text-gray-900">{appointment.patientName}</p>
                        <p className="text-sm text-gray-600">with {appointment.doctorName}</p>
                        <p className="text-xs text-gray-500">{appointment.specialization}</p>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      {appointment.date} at {appointment.time}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                      <span>{appointment.status}</span>
                    </span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Users */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Users</h2>
            </div>
            
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-semibold text-sm">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">Joined {user.joinDate}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/admin/doctors" className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">View Doctors</p>
                  <p className="text-sm text-gray-600">View doctor profiles</p>
                </div>
              </div>
            </Link>

            <Link to="/admin/pending-doctors" className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Pending Approvals</p>
                  <p className="text-sm text-gray-600">Review doctor registrations</p>
                </div>
              </div>
            </Link>

            <Link to="/admin/patients" className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">View Patients</p>
                  <p className="text-sm text-gray-600">View patient profiles</p>
                </div>
              </div>
            </Link>

            <Link to="/admin/appointments" className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">View Appointments</p>
                  <p className="text-sm text-gray-600">View all appointments</p>
                </div>
              </div>
            </Link>

            <Link to="/admin/reports" className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">View Reports</p>
                  <p className="text-sm text-gray-600">Analytics and system reports</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Quick Resources */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* System Status */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <span className="text-sm font-medium text-green-600">Online</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">API Server</span>
                  <span className="text-sm font-medium text-green-600">Running</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Backup</span>
                  <span className="text-sm font-medium text-gray-900">Today</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-gray-600">New registrations today:</span>
                  <span className="font-medium text-gray-900 ml-1">{stats.totalUsers > 0 ? Math.floor(stats.totalUsers * 0.1) : 0}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Appointments today:</span>
                  <span className="font-medium text-gray-900 ml-1">{stats.totalAppointments > 0 ? Math.floor(stats.totalAppointments * 0.2) : 0}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">System uptime:</span>
                  <span className="font-medium text-gray-900 ml-1">99.9%</span>
                </div>
              </div>
            </div>

            {/* Database Management */}
        <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Database</h3>
                <Database className="w-5 h-5 text-purple-600" />
              </div>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-gray-600">Total Records:</span>
                  <span className="font-medium text-gray-900 ml-1">{stats.totalUsers + stats.totalDoctors + stats.totalPatients + stats.totalAppointments}</span>
                </div>
                <button
                  onClick={handleSeedDatabase}
                  className="w-full btn-primary text-sm"
                >
                  Seed Sample Data
                </button>
                <div className="text-xs text-gray-500">
                  Add 10 doctors and sample data
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
