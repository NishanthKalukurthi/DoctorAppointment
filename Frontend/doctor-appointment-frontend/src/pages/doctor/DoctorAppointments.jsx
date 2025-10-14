import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { doctorService } from '../../services/doctorService'
import { appointmentService } from '../../services/appointmentService'
import { Calendar, Clock, User, Phone, MapPin, CheckCircle, XCircle, AlertCircle, Edit, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

export const DoctorAppointments = () => {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingAppointment, setEditingAppointment] = useState(null)
  const [editingData, setEditingData] = useState({ notes: '', status: '' })

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      // Get doctor profile first to get doctor ID
      const profile = await doctorService.getProfile()
      const data = await doctorService.getAppointments(profile.id)
      console.log('Fetched appointments:', data)
      console.log('First appointment status:', data[0]?.status, 'Type:', typeof data[0]?.status)
      setAppointments(data)
    } catch (error) {
      toast.error('Failed to fetch appointments')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateAppointment = async (appointmentId, newStatus, newNotes) => {
    try {
      console.log('Updating appointment:', { appointmentId, newStatus, newNotes })
      console.log('Current editing data:', editingData)
      
      // Update notes if provided
      if (newNotes !== undefined && newNotes !== '') {
        console.log('Updating notes...')
        await appointmentService.updateAppointment(appointmentId, { notes: newNotes })
      }
      
      // Update status if provided using the dedicated status endpoint
      if (newStatus && newStatus !== '') {
        console.log('Updating status to:', newStatus)
        await appointmentService.updateAppointmentStatus(appointmentId, newStatus)
      }
      
      toast.success('Appointment updated successfully!')
      setEditingAppointment(null)
      setEditingData({ notes: '', status: '' })
      fetchAppointments()
    } catch (error) {
      console.error('Error updating appointment:', error)
      console.error('Error response:', error.response?.data)
      
      let errorMessage = 'Failed to update appointment'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid status transition. Please check the current appointment status.'
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to update this appointment.'
      } else if (error.response?.status === 404) {
        errorMessage = 'Appointment not found.'
      } else if (error.response?.status === 401) {
        errorMessage = 'Please log in again to continue.'
      }
      
      toast.error(errorMessage)
    }
  }

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentService.cancelAppointment(appointmentId, 'Cancelled by doctor')
        toast.success('Appointment cancelled successfully!')
        fetchAppointments()
      } catch (error) {
        toast.error('Failed to cancel appointment')
      }
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
      case 2: return <AlertCircle className="w-4 h-4" />
      case 'Completed':
      case 3: return <CheckCircle className="w-4 h-4" />
      case 'Cancelled':
      case 4: return <XCircle className="w-4 h-4" />
      case 'NoShow':
      case 5: return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
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
    // Check if appointment is in a final state (no further updates allowed)
    return (status === 'Completed' || status === 3) || 
           (status === 'Cancelled' || status === 4) || 
           (status === 'NoShow' || status === 5)
  }

  const canCancel = (status) => {
    // Check if appointment can be cancelled
    return (status !== 'Cancelled' && status !== 4) && 
           (status !== 'Completed' && status !== 3)
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Total: {appointments.length} appointments
            </div>
            {appointments.length === 0 && (
              <button
                onClick={() => {
                  toast.info('To test appointment management, please register as a patient and book an appointment with yourself, or use the admin panel to create test data.')
                }}
                className="btn-secondary text-sm"
              >
                Need Test Data?
              </button>
            )}
          </div>
        </div>

        {appointments.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments yet</h3>
            <p className="text-gray-600 mb-4">You don't have any appointments scheduled.</p>
            <p className="text-sm text-gray-500">
              To test the appointment management features, you can:
            </p>
            <ul className="text-sm text-gray-500 mt-2 space-y-1">
              <li>• Ask a patient to book an appointment with you</li>
              <li>• Register as a patient and book an appointment with yourself</li>
            </ul>
          </div>
        ) : (
          <div className="space-y-6">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.patientName}
                      </h3>
                      <p className="text-gray-600">{appointment.reason || 'No reason provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                      <span className="ml-1">{getStatusText(appointment.status)}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{formatDate(appointment.appointmentDate)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium">Fee: ₹{appointment.fee}</span>
                  </div>
                </div>

                {appointment.notes && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <MessageSquare className="w-4 h-4 mr-2 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Notes</span>
                    </div>
                    <p className="text-gray-600 text-sm">{appointment.notes}</p>
                  </div>
                )}

                {editingAppointment === appointment.id ? (
                  <div className="border-t pt-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status (Current: {appointment.status} - Type: {typeof appointment.status})
                        </label>
                        <select
                          id={`status-${appointment.id}`}
                          value={editingData.status}
                          onChange={(e) => {
                            console.log('Status changed to:', e.target.value)
                            setEditingData(prev => ({ ...prev, status: e.target.value }))
                          }}
                          className="input-field"
                        >
                          <option value="">Select Status</option>
                           
                            {(appointment.status === 'Scheduled' || appointment.status === 0) && (
                            <>
                              <option value="Confirmed">Confirm Appointment</option>
                              <option value="Cancelled">Cancel Appointment</option>
                            </>
                          )}
                          {(appointment.status === 'Confirmed' || appointment.status === 1) && (
                            <>
                              <option value="InProgress">Start Consultation</option>
                              <option value="Cancelled">Cancel Appointment</option>
                              <option value="NoShow">Mark as No Show</option>
                            </>
                          )}
                          {(appointment.status === 'InProgress' || appointment.status === 2) && (
                            <>
                              <option value="Completed">Mark as Completed</option>
                              <option value="Cancelled">Cancel Appointment</option>
                            </>
                          )}
                          {(appointment.status === 'Completed' || appointment.status === 3) && (
                            <option value="" disabled>Appointment Completed</option>
                          )}
                          {(appointment.status === 'Cancelled' || appointment.status === 4) && (
                            <option value="" disabled>Appointment Cancelled</option>
                          )}
                          {(appointment.status === 'NoShow' || appointment.status === 5) && (
                            <option value="" disabled>No Show</option>
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <textarea
                          id={`notes-${appointment.id}`}
                          value={editingData.notes}
                          onChange={(e) => {
                            console.log('Notes changed to:', e.target.value)
                            setEditingData(prev => ({ ...prev, notes: e.target.value }))
                          }}
                          rows={3}
                          className="input-field"
                          placeholder="Add notes about the appointment..."
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setEditingAppointment(null)
                            setEditingData({ notes: '', status: '' })
                          }}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            console.log('Save button clicked for appointment:', appointment.id)
                            console.log('Current editing data:', editingData)
                            console.log('Status value:', editingData.status)
                            console.log('Notes value:', editingData.notes)
                            
                            if (!editingData.status && !editingData.notes) {
                              toast.error('Please select a status or add notes before saving')
                              return
                            }
                            
                            handleUpdateAppointment(
                              appointment.id, 
                              editingData.status, 
                              editingData.notes
                            )
                          }}
                          className="btn-primary"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end space-x-2 border-t pt-4">
                    {/* Only show Update button if appointment is not in final state */}
                    {!isFinalState(appointment.status) && (
                      <button
                        onClick={() => {
                          setEditingAppointment(appointment.id)
                          setEditingData({ 
                            notes: appointment.notes || '', 
                            status: appointment.status 
                          })
                        }}
                        className="btn-secondary flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Update
                      </button>
                    )}
                    {/* Only show Cancel button if appointment can be cancelled */}
                    {canCancel(appointment.status) && (
                      <button
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="btn-danger flex items-center"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel
                      </button>
                    )}
                    {/* Show final state message for completed/cancelled appointments */}
                    {isFinalState(appointment.status) && (
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-2">
                          {appointment.status === 'Completed' || appointment.status === 3 ? '✓' : 
                           appointment.status === 'Cancelled' || appointment.status === 4 ? '✗' : '⚠'}
                        </span>
                        <span>
                          {appointment.status === 'Completed' || appointment.status === 3 ? 'Appointment Completed' :
                           appointment.status === 'Cancelled' || appointment.status === 4 ? 'Appointment Cancelled' :
                           'No Show'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
