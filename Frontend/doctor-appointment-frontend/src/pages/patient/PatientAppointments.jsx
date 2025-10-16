import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { patientService } from '../../services/patientService'
import { appointmentService } from '../../services/appointmentService'
import { Calendar, Clock, User, Phone, MapPin, CheckCircle, XCircle, AlertCircle, MessageSquare, Stethoscope } from 'lucide-react'
import toast from 'react-hot-toast'

export const PatientAppointments = () => {
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
      setAppointments(data)
    } catch (error) {
      toast.error('Failed to fetch appointments')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentService.cancelAppointment(appointmentId, 'Cancelled by patient')
        toast.success('Appointment cancelled successfully!')
        fetchAppointments()
      } catch (error) {
        toast.error('Failed to cancel appointment')
      }
    }
  }

  const getStatusColor = (status) => {
    // Handle both string and numeric status values
    switch (status) {
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

  const getStatusIcon = (status) => {
    // Handle both string and numeric status values
    switch (status) {
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

  const canCancelAppointment = (appointment) => {
    const appointmentDate = new Date(appointment.appointmentDate)
    const now = new Date()
    const hoursUntilAppointment = (appointmentDate - now) / (1000 * 60 * 60)
    
    // Check if status is 'Scheduled' (either string or numeric value 0)
    const isScheduled = appointment.status === 'Scheduled' || appointment.status === 0
    
    return isScheduled && hoursUntilAppointment > 24
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
          <div className="text-sm text-gray-600">
            Total: {appointments.length} appointments
          </div>
        </div>

        {appointments.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments yet</h3>
            <p className="text-gray-600 mb-4">You don't have any appointments scheduled.</p>
            <a href="/doctors" className="btn-primary">
              Find a Doctor
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Dr. {appointment.doctorName}
                      </h3>
                      <p className="text-primary-600 font-medium">{appointment.doctorSpecialization}</p>
                      <p className="text-gray-600 text-sm">{appointment.reason || 'No reason provided'}</p>
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
                      <span className="text-sm font-medium text-gray-700">Doctor's Notes</span>
                    </div>
                    <p className="text-gray-600 text-sm">{appointment.notes}</p>
                  </div>
                )}

                {appointment.cancellationReason && (
                  <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center mb-2">
                      <XCircle className="w-4 h-4 mr-2 text-red-600" />
                      <span className="text-sm font-medium text-red-700">Cancellation Reason</span>
                    </div>
                    <p className="text-red-600 text-sm">{appointment.cancellationReason}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-2 border-t pt-4">
                  {canCancelAppointment(appointment) && (
                    <button
                      onClick={() => handleCancelAppointment(appointment.id)}
                      className="btn-danger flex items-center"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Appointment
                    </button>
                  )}
                  {!canCancelAppointment(appointment) && (appointment.status === 'Scheduled' || appointment.status === 0) && (
                    <span className="text-sm text-gray-500 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Cannot cancel within 24 hours
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
