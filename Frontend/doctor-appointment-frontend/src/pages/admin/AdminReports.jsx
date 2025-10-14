import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminService } from '../../services/adminService'

export const AdminReports = () => {
  const [reports, setReports] = useState({
    overview: {
      totalRevenue: 67500,
      totalAppointments: 145,
      completedAppointments: 120,
      cancelledAppointments: 15,
      noShowAppointments: 10,
      averageAppointmentValue: 465,
      patientSatisfaction: 4.8
    },
    monthlyStats: [
      { month: 'Jan', appointments: 45, revenue: 22500 },
      { month: 'Feb', appointments: 52, revenue: 26000 },
      { month: 'Mar', appointments: 48, revenue: 19000 }
    ],
    topDoctors: [
      { name: 'Dr. Priya Patel', specialization: 'Dermatology', appointments: 25, revenue: 30000 },
      { name: 'Dr. Vikram Singh', specialization: 'Orthopedics', appointments: 22, revenue: 44000 },
      { name: 'Dr. Rajesh Sharma', specialization: 'Cardiology', appointments: 20, revenue: 30000 }
    ],
    popularSpecializations: [
      { name: 'Dermatology', count: 35, percentage: 24 },
      { name: 'Orthopedics', count: 28, percentage: 19 },
      { name: 'Cardiology', count: 25, percentage: 17 },
      { name: 'Pediatrics', count: 22, percentage: 15 },
      { name: 'Neurology', count: 20, percentage: 14 },
      { name: 'Others', count: 15, percentage: 11 }
    ]
  })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: '2024-01-01',
    endDate: '2024-03-31'
  })
  const [statusFilter, setStatusFilter] = useState('All')
  const [specializationFilter, setSpecializationFilter] = useState('All')

  useEffect(() => {
    fetchReports()
  }, [dateRange])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const [statsData, appointmentsData, doctorsData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getAllAppointments(dateRange.startDate, dateRange.endDate),
        adminService.getAllDoctors()
      ])
      
      // Apply client-side filters
      let filteredAppointments = appointmentsData
      
      // Apply status filter
      if (statusFilter !== 'All') {
        filteredAppointments = filteredAppointments.filter(apt => apt.status === statusFilter)
      }
      
      // Apply specialization filter
      if (specializationFilter !== 'All') {
        filteredAppointments = filteredAppointments.filter(apt => apt.doctorSpecialization === specializationFilter)
      }
      
      // Calculate real-time reports from filtered data
      const totalAppointments = filteredAppointments.length
      const completedAppointments = filteredAppointments.filter(apt => apt.status === 'Completed').length
      const cancelledAppointments = filteredAppointments.filter(apt => apt.status === 'Cancelled').length
      const noShowAppointments = filteredAppointments.filter(apt => apt.status === 'NoShow').length
      const totalRevenue = filteredAppointments
        .filter(apt => apt.status === 'Completed')
        .reduce((sum, apt) => sum + (apt.fee || 0), 0)
      const averageAppointmentValue = completedAppointments > 0 ? totalRevenue / completedAppointments : 0
      
      // Calculate monthly stats (last 3 months) using filtered data
      const monthlyStats = []
      const currentDate = new Date()
      for (let i = 2; i >= 0; i--) {
        const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
        const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' })
        const monthAppointments = filteredAppointments.filter(apt => {
          const aptDate = new Date(apt.appointmentDate)
          return aptDate.getMonth() === monthDate.getMonth() && 
                 aptDate.getFullYear() === monthDate.getFullYear()
        })
        const monthRevenue = monthAppointments
          .filter(apt => apt.status === 'Completed')
          .reduce((sum, apt) => sum + (apt.fee || 0), 0)
        
        monthlyStats.push({
          month: monthName,
          appointments: monthAppointments.length,
          revenue: monthRevenue
        })
      }
      
      // Calculate top doctors using filtered data
      const doctorStats = doctorsData.map(doctor => {
        const doctorAppointments = filteredAppointments.filter(apt => apt.doctorId === doctor.id)
        const completedDoctorAppointments = doctorAppointments.filter(apt => apt.status === 'Completed')
        const doctorRevenue = completedDoctorAppointments.reduce((sum, apt) => sum + (apt.fee || 0), 0)
        
        return {
          name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
          specialization: doctor.specialization,
          appointments: doctorAppointments.length,
          revenue: doctorRevenue
        }
      }).sort((a, b) => b.appointments - a.appointments).slice(0, 3)
      
      // Calculate specialization distribution using filtered data
      const specializationStats = {}
      filteredAppointments.forEach(apt => {
        const spec = apt.doctorSpecialization || 'Unknown'
        specializationStats[spec] = (specializationStats[spec] || 0) + 1
      })
      
      const popularSpecializations = Object.entries(specializationStats)
        .map(([name, count]) => ({
          name,
          count,
          percentage: Math.round((count / totalAppointments) * 100)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)
      
      setReports({
        overview: {
          totalRevenue,
          totalAppointments,
          completedAppointments,
          cancelledAppointments,
          noShowAppointments,
          averageAppointmentValue: Math.round(averageAppointmentValue),
          patientSatisfaction: 4.8 // This would come from feedback system
        },
        monthlyStats,
        topDoctors: doctorStats,
        popularSpecializations
      })
    } catch (error) {
      console.error('Failed to fetch reports:', error)
      toast.error('Failed to fetch reports data')
    } finally {
      setLoading(false)
    }
  }

  const handleApplyFilter = async () => {
    try {
      // Validate date range
      const startDate = new Date(dateRange.startDate)
      const endDate = new Date(dateRange.endDate)
      
      if (startDate > endDate) {
        toast.error('Start date must be before end date')
        return
      }
      
      if (endDate > new Date()) {
        toast.error('End date cannot be in the future')
        return
      }
      
      // Show loading state
      setLoading(true)
      
      // Fetch reports with new filters
      await fetchReports()
      
      toast.success('Filter applied successfully!')
    } catch (error) {
      console.error('Error applying filter:', error)
      toast.error('Failed to apply filter')
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = (reportType) => {
    try {
      if (reportType === 'all-pdf') {
        exportToPDF()
      } else if (reportType === 'all-excel') {
        exportToExcel()
      } else {
        // Individual report exports
        exportIndividualReport(reportType)
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export report')
    }
  }

  const exportToPDF = () => {
    // Create a new window with the report content
    const printWindow = window.open('', '_blank')
    const reportContent = generateReportHTML()
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>MediCare India - Admin Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .section h2 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 5px; }
            .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
            .stat-item { background: #f8fafc; padding: 15px; border-radius: 8px; }
            .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f1f5f9; }
            .footer { margin-top: 30px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          ${reportContent}
        </body>
      </html>
    `)
    
    printWindow.document.close()
    printWindow.print()
    toast.success('PDF report generated successfully!')
  }

  const exportToExcel = () => {
    // Create CSV content for Excel
    const csvContent = generateCSVContent()
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `medicare-report-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    
    toast.success('Excel report downloaded successfully!')
  }

  const exportIndividualReport = (reportType) => {
    // Export individual report sections
    let content = ''
    let filename = ''
    
    switch (reportType) {
      case 'revenue':
        content = generateRevenueReport()
        filename = 'revenue-report'
        break
      case 'doctors':
        content = generateDoctorsReport()
        filename = 'doctors-report'
        break
      case 'specializations':
        content = generateSpecializationsReport()
        filename = 'specializations-report'
        break
      case 'status':
        content = generateStatusReport()
        filename = 'status-report'
        break
      default:
        toast.error('Unknown report type')
        return
    }
    
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    
    toast.success(`${reportType} report downloaded successfully!`)
  }

  const generateReportHTML = () => {
    return `
      <div class="header">
        <h1>MediCare India - Admin Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
      </div>
      
      <div class="section">
        <h2>Overview Statistics</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <strong>Total Revenue:</strong> ₹{reports.overview.totalRevenue.toLocaleString()}
          </div>
          <div class="stat-item">
            <strong>Total Appointments:</strong> {reports.overview.totalAppointments}
          </div>
          <div class="stat-item">
            <strong>Completed Appointments:</strong> {reports.overview.completedAppointments}
          </div>
          <div class="stat-item">
            <strong>Cancelled Appointments:</strong> {reports.overview.cancelledAppointments}
          </div>
          <div class="stat-item">
            <strong>No Show Appointments:</strong> {reports.overview.noShowAppointments}
          </div>
          <div class="stat-item">
            <strong>Average Appointment Value:</strong> ₹{reports.overview.averageAppointmentValue}
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Top Performing Doctors</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Doctor Name</th>
              <th>Specialization</th>
              <th>Appointments</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            ${reports.topDoctors.map(doctor => `
              <tr>
                <td>${doctor.name}</td>
                <td>${doctor.specialization}</td>
                <td>${doctor.appointments}</td>
                <td>₹{doctor.revenue.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>Specialization Distribution</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Specialization</th>
              <th>Count</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${reports.popularSpecializations.map(spec => `
              <tr>
                <td>${spec.name}</td>
                <td>${spec.count}</td>
                <td>${spec.percentage}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="footer">
        <p>This report was generated by MediCare India Admin System</p>
      </div>
    `
  }

  const generateCSVContent = () => {
    let csv = 'MediCare India - Admin Report\n'
    csv += `Generated on: ${new Date().toLocaleDateString()}\n\n`
    
    csv += 'Overview Statistics\n'
    csv += 'Metric,Value\n'
    csv += `Total Revenue,${reports.overview.totalRevenue}\n`
    csv += `Total Appointments,${reports.overview.totalAppointments}\n`
    csv += `Completed Appointments,${reports.overview.completedAppointments}\n`
    csv += `Cancelled Appointments,${reports.overview.cancelledAppointments}\n`
    csv += `No Show Appointments,${reports.overview.noShowAppointments}\n`
    csv += `Average Appointment Value,${reports.overview.averageAppointmentValue}\n\n`
    
    csv += 'Top Performing Doctors\n'
    csv += 'Doctor Name,Specialization,Appointments,Revenue\n'
    reports.topDoctors.forEach(doctor => {
      csv += `${doctor.name},${doctor.specialization},${doctor.appointments},${doctor.revenue}\n`
    })
    csv += '\n'
    
    csv += 'Specialization Distribution\n'
    csv += 'Specialization,Count,Percentage\n'
    reports.popularSpecializations.forEach(spec => {
      csv += `${spec.name},${spec.count},${spec.percentage}\n`
    })
    
    return csv
  }

  const generateRevenueReport = () => {
    let csv = 'Monthly Revenue Report\n'
    csv += `Generated on: ${new Date().toLocaleDateString()}\n\n`
    csv += 'Month,Appointments,Revenue\n'
    reports.monthlyStats.forEach(stat => {
      csv += `${stat.month},${stat.appointments},${stat.revenue}\n`
    })
    return csv
  }

  const generateDoctorsReport = () => {
    let csv = 'Top Performing Doctors Report\n'
    csv += `Generated on: ${new Date().toLocaleDateString()}\n\n`
    csv += 'Doctor Name,Specialization,Appointments,Revenue\n'
    reports.topDoctors.forEach(doctor => {
      csv += `${doctor.name},${doctor.specialization},${doctor.appointments},${doctor.revenue}\n`
    })
    return csv
  }

  const generateSpecializationsReport = () => {
    let csv = 'Specialization Distribution Report\n'
    csv += `Generated on: ${new Date().toLocaleDateString()}\n\n`
    csv += 'Specialization,Count,Percentage\n'
    reports.popularSpecializations.forEach(spec => {
      csv += `${spec.name},${spec.count},${spec.percentage}\n`
    })
    return csv
  }

  const generateStatusReport = () => {
    let csv = 'Appointment Status Report\n'
    csv += `Generated on: ${new Date().toLocaleDateString()}\n\n`
    csv += 'Status,Count\n'
    csv += `Completed,${reports.overview.completedAppointments}\n`
    csv += `Cancelled,${reports.overview.cancelledAppointments}\n`
    csv += `No Show,${reports.overview.noShowAppointments}\n`
    return csv
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
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        </div>

        {/* Filter Section */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="All">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="NoShow">No Show</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialization
              </label>
              <select
                value={specializationFilter}
                onChange={(e) => setSpecializationFilter(e.target.value)}
                className="input-field"
              >
                <option value="All">All Specializations</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Neurology">Neurology</option>
                <option value="General Medicine">General Medicine</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button 
              onClick={handleApplyFilter}
              className="btn-primary"
              disabled={loading}
            >
              <Filter className="w-4 h-4 mr-2" />
              {loading ? 'Applying...' : 'Apply Filter'}
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{reports.overview.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{reports.overview.totalAppointments}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round((reports.overview.completedAppointments / reports.overview.totalAppointments) * 100)}%
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Appointment Value</p>
                <p className="text-2xl font-bold text-gray-900">₹{reports.overview.averageAppointmentValue}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Detailed Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Revenue Chart */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Monthly Revenue</h2>
              <button 
                onClick={() => handleExportReport('revenue')}
                className="btn-secondary"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
            <div className="space-y-4">
              {reports.monthlyStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{stat.month}</span>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full" 
                        style={{ width: `${(stat.revenue / 30000) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-20 text-right">
                      ₹{stat.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Doctors */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Top Performing Doctors</h2>
              <button 
                onClick={() => handleExportReport('doctors')}
                className="btn-secondary"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
            <div className="space-y-4">
              {reports.topDoctors.map((doctor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{doctor.name}</p>
                    <p className="text-sm text-gray-600">{doctor.specialization}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{doctor.appointments} appointments</p>
                    <p className="text-sm text-gray-600">₹{doctor.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Specialization Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Specialization Distribution</h2>
              <button 
                onClick={() => handleExportReport('specializations')}
                className="btn-secondary"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
            <div className="space-y-3">
              {reports.popularSpecializations.map((spec, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}></div>
                    <span className="text-sm font-medium text-gray-900">{spec.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${spec.percentage}%`,
                          backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {spec.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Appointment Status Breakdown */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Appointment Status</h2>
              <button 
                onClick={() => handleExportReport('status')}
                className="btn-secondary"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Completed</span>
                </div>
                <span className="font-medium text-gray-900">{reports.overview.completedAppointments}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Scheduled</span>
                </div>
                <span className="font-medium text-gray-900">
                  {reports.overview.totalAppointments - reports.overview.completedAppointments - reports.overview.cancelledAppointments - reports.overview.noShowAppointments}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Cancelled</span>
                </div>
                <span className="font-medium text-gray-900">{reports.overview.cancelledAppointments}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">No Show</span>
                </div>
                <span className="font-medium text-gray-900">{reports.overview.noShowAppointments}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Export All Reports */}
        <div className="card">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Export All Reports</h2>
            <p className="text-gray-600 mb-6">
              Download comprehensive reports including all analytics and data
            </p>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => handleExportReport('all-pdf')}
                className="btn-primary"
              >
                <Download className="w-4 h-4 mr-2" />
                Export as PDF
              </button>
              <button 
                onClick={() => handleExportReport('all-excel')}
                className="btn-secondary"
              >
                <Download className="w-4 h-4 mr-2" />
                Export as Excel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
