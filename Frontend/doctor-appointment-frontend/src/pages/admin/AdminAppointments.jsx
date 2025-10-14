import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  CheckCircle, 
  XCircle,
  Clock,
  User,
  Stethoscope
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminService } from '../../services/adminService'

export const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [cancellationReason, setCancellationReason] = useState('')

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const appointmentsData = await adminService.getAllAppointments()
      setAppointments(appointmentsData)
    } catch (error) {
      console.error('Error fetching appointments:', error)
      toast.error('Failed to fetch appointments')
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }


  const getStatusColor = (status) => {
    // Handle both string and numeric status values
    const statusValue = typeof status === 'number' ? status : status
    switch (statusValue) {
      case 'Scheduled':
      case 0: return 'text-blue-600 bg-blue-100'
      case 'Confirmed':
      case 1: return 'text-green-600 bg-green-100'
      case 'InProgress':
      case 2: return 'text-yellow-600 bg-yellow-100'
      case 'Completed':
      case 3: return 'text-gray-600 bg-gray-100'
      case 'Cancelled':
      case 4: return 'text-red-600 bg-red-100'
      case 'NoShow':
      case 5: return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    // Handle both string and numeric status values
    const statusValue = typeof status === 'number' ? status : status
    switch (statusValue) {
      case 'Scheduled':
      case 0: return <Clock className="w-4 h-4" />
      case 'Confirmed':
      case 1: return <CheckCircle className="w-4 h-4" />
      case 'InProgress':
      case 2: return <Clock className="w-4 h-4" />
      case 'Completed':
      case 3: return <CheckCircle className="w-4 h-4" />
      case 'Cancelled':
      case 4: return <XCircle className="w-4 h-4" />
      case 'NoShow':
      case 5: return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const isFinalState = (status) => {
    // Check if appointment is in a final state (no further updates allowed)
    return (status === 'Completed' || status === 3) || 
           (status === 'Cancelled' || status === 4) || 
           (status === 'NoShow' || status === 5)
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

  const formatTime = (timeString) => {
    const time = new Date(`2000-01-01T${timeString}`)
    return time.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || appointment.status === filterStatus
    const matchesDate = !filterDate || appointment.appointmentDate === filterDate
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const statusOptions = ['Scheduled', 'Confirmed', 'InProgress', 'Completed', 'Cancelled', 'NoShow']

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setShowViewModal(true)
  }

  const closeModal = () => {
    setShowViewModal(false)
    setSelectedAppointment(null)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditingAppointment(null)
    setNewStatus('')
    setCancellationReason('')
  }

  const handleEditAppointment = (appointment) => {
    // Only allow editing scheduled appointments
    if (appointment.status === 'Scheduled' || appointment.status === 0) {
      setEditingAppointment(appointment)
      setNewStatus('Cancelled') // Admin can only cancel scheduled appointments
      setShowEditModal(true)
    } else {
      toast.error('Only scheduled appointments can be cancelled by admin')
    }
  }

  const handleUpdateStatus = async () => {
    if (!editingAppointment || !newStatus) {
      toast.error('Please select a status')
      return
    }

    if (newStatus === 'Cancelled' && !cancellationReason.trim()) {
      toast.error('Please provide a cancellation reason')
      return
    }

    try {
      // Convert string status to numeric value for backend
      const statusMap = {
        'Scheduled': 0,
        'Confirmed': 1,
        'InProgress': 2,
        'Completed': 3,
        'Cancelled': 4,
        'NoShow': 5
      }
      
      const numericStatus = statusMap[newStatus]
      console.log('Updating appointment status:', {
        appointmentId: editingAppointment.id,
        status: newStatus,
        numericStatus: numericStatus,
        cancellationReason: cancellationReason
      })

      await adminService.updateAppointmentStatus(
        editingAppointment.id, 
        numericStatus, 
        cancellationReason || null
      )
      
      toast.success('Appointment status updated successfully!')
      closeEditModal()
      fetchAppointments() // Refresh the list
    } catch (error) {
      console.error('Error updating appointment status:', error)
      toast.error('Failed to update appointment status')
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
          <h1 className="text-3xl font-bold text-gray-900">View Appointments</h1>
          <div className="text-sm text-gray-600">
            Total: {appointments.length} appointments
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Search appointments..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field"
              >
                <option value="">All Status</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterStatus('')
                  setFilterDate('')
                }}
                className="btn-secondary w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{appointment.patientName}</p>
                        <p className="text-sm text-gray-600">Patient</p>
                      </div>
                    </div>
                    
                    <div className="text-gray-300">•</div>
                    
                    <div className="flex items-center space-x-2">
                      <Stethoscope className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{appointment.doctorName}</p>
                        <p className="text-sm text-gray-600">{appointment.doctorSpecialization}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Date & Time</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(appointment.appointmentDate)} at {formatTime(appointment.startTime)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Reason</p>
                      <p className="text-sm text-gray-600">{appointment.reason}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Fee</p>
                      <p className="text-sm text-gray-600">₹{appointment.fee}</p>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700">Notes</p>
                      <p className="text-sm text-gray-600">{appointment.notes}</p>
                    </div>
                  )}

                  {appointment.cancellationReason && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700">Cancellation Reason</p>
                      <p className="text-sm text-red-600">{appointment.cancellationReason}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(appointment.status)}`}>
                    {getStatusIcon(appointment.status)}
                    <span>{getStatusText(appointment.status)}</span>
                  </span>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleViewAppointment(appointment)}
                      className="btn-secondary"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {/* Only show Edit button for scheduled appointments */}
                    {(appointment.status === 'Scheduled' || appointment.status === 0) && (
                      <button 
                        onClick={() => handleEditAppointment(appointment)}
                        className="btn-secondary"
                        title="Cancel Appointment"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    {/* Show final state indicator for completed/cancelled appointments */}
                    {isFinalState(appointment.status) && (
                      <div className="flex items-center text-sm text-gray-500 px-2">
                        <span className="mr-1">
                          {appointment.status === 'Completed' || appointment.status === 3 ? '✓' : 
                           appointment.status === 'Cancelled' || appointment.status === 4 ? '✗' : '⚠'}
                        </span>
                        <span className="text-xs">
                          {appointment.status === 'Completed' || appointment.status === 3 ? 'Completed' :
                           appointment.status === 'Cancelled' || appointment.status === 4 ? 'Cancelled' :
                           'No Show'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>


              {/* Show status info for cancelled/completed appointments */}
              {isFinalState(appointment.status) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <p><strong>Status:</strong> {getStatusText(appointment.status)}</p>
                    {appointment.cancellationReason && (
                      <p><strong>Reason:</strong> {appointment.cancellationReason}</p>
                    )}
                    {appointment.updatedAt && (
                      <p><strong>Last Updated:</strong> {new Date(appointment.updatedAt).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No appointments found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}

        {/* View Appointment Modal */}
        {showViewModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Appointment Details</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {formatDate(selectedAppointment.appointmentDate)} at {formatTime(selectedAppointment.startTime)}
                      </h3>
                      <p className="text-gray-600">
                        {selectedAppointment.doctorName} • {selectedAppointment.doctorSpecialization}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(selectedAppointment.status)}`}>
                    {getStatusIcon(selectedAppointment.status)}
                    <span>{getStatusText(selectedAppointment.status)}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Patient Information</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">Name:</span> {selectedAppointment.patientName}</p>
                      <p><span className="font-medium">Reason:</span> {selectedAppointment.reason}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Appointment Details</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">Date:</span> {formatDate(selectedAppointment.appointmentDate)}</p>
                      <p><span className="font-medium">Time:</span> {formatTime(selectedAppointment.startTime)} - {formatTime(selectedAppointment.endTime)}</p>
                      <p><span className="font-medium">Fee:</span> ₹{selectedAppointment.fee}</p>
                    </div>
                  </div>
                </div>

                {selectedAppointment.notes && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Doctor's Notes</h4>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedAppointment.notes}</p>
                  </div>
                )}

                {selectedAppointment.cancellationReason && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Cancellation Reason</h4>
                    <p className="text-red-600 bg-red-50 p-3 rounded-lg">{selectedAppointment.cancellationReason}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Timeline</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Created:</span> {new Date(selectedAppointment.createdAt).toLocaleString()}</p>
                    {selectedAppointment.updatedAt && (
                      <p><span className="font-medium">Last Updated:</span> {new Date(selectedAppointment.updatedAt).toLocaleString()}</p>
                    )}
                    {selectedAppointment.cancelledAt && (
                      <p><span className="font-medium">Cancelled:</span> {new Date(selectedAppointment.cancelledAt).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={closeModal}
                  className="btn-secondary"
                >
                  Close
                </button>

                {isFinalState(selectedAppointment.status) && (
                  <div className="text-sm text-gray-600">
                    <p><strong>Status:</strong> {getStatusText(selectedAppointment.status)}</p>
                    {selectedAppointment.cancellationReason && (
                      <p><strong>Reason:</strong> {selectedAppointment.cancellationReason}</p>
                    )}
                    {selectedAppointment.updatedAt && (
                      <p><strong>Last Updated:</strong> {new Date(selectedAppointment.updatedAt).toLocaleString()}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Appointment Modal */}
        {showEditModal && editingAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Cancel Appointment</h2>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Appointment Details</h3>
                  <p><span className="font-medium">Patient:</span> {editingAppointment.patientName}</p>
                  <p><span className="font-medium">Doctor:</span> {editingAppointment.doctorName}</p>
                  <p><span className="font-medium">Date:</span> {formatDate(editingAppointment.appointmentDate)}</p>
                  <p><span className="font-medium">Time:</span> {formatTime(editingAppointment.startTime)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="input-field"
                    disabled
                  >
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Admin can only cancel scheduled appointments
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cancellation Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="Please provide a reason for cancellation..."
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={closeEditModal}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  className="btn-primary bg-red-600 hover:bg-red-700"
                >
                  Cancel Appointment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
