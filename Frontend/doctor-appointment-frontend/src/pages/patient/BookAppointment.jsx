import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { doctorService } from '../../services/doctorService'
import { appointmentService } from '../../services/appointmentService'
import { availabilityService } from '../../services/availabilityService'
import { Calendar, Clock, User, MapPin, Phone, Mail, Stethoscope, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export const BookAppointment = () => {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm()

  useEffect(() => {
    if (doctorId) {
      fetchDoctorDetails()
    }
  }, [doctorId])

  const fetchDoctorDetails = async () => {
    try {
      setLoading(true)
      const data = await doctorService.getDoctor(doctorId)
      setDoctor(data)
    } catch (error) {
      toast.error('Failed to fetch doctor details')
      navigate('/doctors')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableSlots = async (date) => {
    if (!date) return
    
    try {
      setLoadingSlots(true)
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      
      console.log('Fetching slots for:', {
        doctorId: parseInt(doctorId),
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      })
      
      const slots = await availabilityService.getAvailableSlots(
        parseInt(doctorId), 
        startDate.toISOString().split('T')[0], 
        endDate.toISOString().split('T')[0]
      )
      
      console.log('Received slots:', slots)
      
      // Debug: Log each slot's availability status
      if (slots && slots.length > 0) {
        console.log('Slot availability details:')
        slots.forEach((slot, index) => {
          console.log(`Slot ${index}:`, {
            time: `${slot.startTime} - ${slot.endTime}`,
            isAvailable: slot.isAvailable,
            date: slot.date
          })
        })
      }
      
      // If no slots returned, generate some default slots for testing
      if (!slots || slots.length === 0) {
        console.log('No slots returned, generating default slots for testing')
        const defaultSlots = generateDefaultSlots(date)
        setAvailableSlots(defaultSlots)
      } else {
        // Show all slots (both available and unavailable) so users can see what's booked
        setAvailableSlots(slots)
      }
    } catch (error) {
      console.error('Error fetching slots:', error)
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      })
      console.log('API failed, generating default slots for testing')
      // Generate default slots as fallback
      const defaultSlots = generateDefaultSlots(date)
      console.log('Generated default slots:', defaultSlots)
      setAvailableSlots(defaultSlots)
      toast.error('Using default time slots. Please contact the doctor for actual availability.')
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleDateChange = (date) => {
    setSelectedDate(date)
    setSelectedSlot(null)
    fetchAvailableSlots(date)
  }

  const handleSlotSelect = (slot) => {
    console.log('Slot clicked:', {
      time: `${slot.startTime} - ${slot.endTime}`,
      isAvailable: slot.isAvailable,
      date: slot.date
    })
    
    // Only allow selection of available slots
    if (!slot.isAvailable) {
      console.log('Blocking selection of unavailable slot')
      toast.error('This time slot is unavailable')
      return
    }
    
    console.log('Allowing selection of available slot')
    setSelectedSlot(slot)
    setValue('appointmentDate', slot.date)
    setValue('startTime', slot.startTime)
    setValue('endTime', slot.endTime)
  }

  const onSubmit = async (data) => {
    if (!selectedSlot) {
      toast.error('Please select a time slot')
      return
    }

    try {
      const appointmentData = {
        doctorId: parseInt(doctorId),
        appointmentDate: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        reason: data.reason
      }

      await appointmentService.createAppointment(appointmentData)
      toast.success('Appointment booked successfully!')
      navigate('/patient/appointments')
    } catch (error) {
      toast.error('Failed to book appointment')
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

  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const generateDefaultSlots = (date) => {
    // Generate some default time slots for testing
    const slots = []
    const baseDate = new Date(date)
    
    // Generate slots from 9 AM to 5 PM with 1-hour intervals
    for (let hour = 9; hour < 17; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00:00`
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00:00`
      
      // Make some slots unavailable for testing (simulating confirmed/in-progress appointments)
      const isAvailable = hour !== 10 && hour !== 14 // Make 10-11 AM and 2-3 PM unavailable (simulating confirmed appointments)
      
      slots.push({
        date: baseDate.toISOString().split('T')[0],
        startTime: startTime,
        endTime: endTime,
        isAvailable: isAvailable
      })
    }
    
    console.log('Generated test slots with mixed availability:', slots)
    return slots
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Doctor not found</h2>
          <p className="text-gray-600 mb-4">The doctor you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/doctors')} className="btn-primary">
            Find Doctors
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Book Appointment</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Doctor Info */}
            <div className="lg:col-span-1">
              <div className="card">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary-600 font-bold text-2xl">
                      {doctor.firstName?.[0]}{doctor.lastName?.[0]}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h2>
                  <p className="text-primary-600 font-medium">{doctor.specialization}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-3" />
                    <span className="text-sm">{doctor.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-3" />
                    <span className="text-sm">{doctor.phoneNumber}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-3" />
                    <span className="text-sm">{doctor.city}, {doctor.state}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Stethoscope className="w-4 h-4 mr-3" />
                    <span className="text-sm">{doctor.experienceYears} years experience</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Consultation Fee</span>
                    <span className="text-2xl font-bold text-primary-600">₹{doctor.consultationFee}</span>
                  </div>
                </div>

                {doctor.bio && (
                  <div className="mt-6">
                    <h3 className="font-medium text-gray-900 mb-2">About Doctor</h3>
                    <p className="text-gray-600 text-sm">{doctor.bio}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-2">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Select Date & Time</h3>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Date
                    </label>
                    <input
                      type="date"
                      min={getMinDate()}
                      value={selectedDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>

                  {/* Time Slot Selection */}
                  {selectedDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Time Slots
                      </label>
                      {loadingSlots ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        </div>
                      ) : availableSlots.length > 0 ? (
                        <div>
                          {availableSlots.some(slot => slot.isAvailable) ? null : (
                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-yellow-800 text-sm">
                                <AlertCircle className="w-4 h-4 inline mr-1" />
                                All time slots for this date are currently unavailable. Please select a different date.
                              </p>
                            </div>
                          )}
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {availableSlots.map((slot, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleSlotSelect(slot)}
                              disabled={!slot.isAvailable}
                              className={`p-3 rounded-lg border text-center transition-colors ${
                                !slot.isAvailable
                                  ? 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed opacity-60'
                                  : selectedSlot === slot
                                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                                  : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="font-medium">
                                {formatTime(slot.startTime)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatTime(slot.endTime)}
                              </div>
                              {!slot.isAvailable && (
                                <div className="text-xs text-red-600 mt-1 font-semibold">
                                  UNAVAILABLE
                                </div>
                              )}
                            </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p className="mb-2">No time slots for this date</p>
                          <p className="text-sm text-gray-400">
                            The doctor may not have set their availability for this day.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reason */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Visit
                    </label>
                    <textarea
                      {...register('reason', { required: 'Please provide a reason for the visit' })}
                      rows={4}
                      className="input-field"
                      placeholder="Please describe your symptoms or reason for the appointment..."
                    />
                    {errors.reason && (
                      <p className="text-red-600 text-sm mt-1">{errors.reason.message}</p>
                    )}
                  </div>

                  {/* Summary */}
                  {selectedSlot && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Appointment Summary</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>Date: {formatDate(selectedSlot.date)}</div>
                        <div>Time: {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}</div>
                        <div>Doctor: Dr. {doctor.firstName} {doctor.lastName}</div>
                        <div>Fee: ₹{doctor.consultationFee}</div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => navigate('/doctors')}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!selectedSlot}
                      className="btn-primary flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Book Appointment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
