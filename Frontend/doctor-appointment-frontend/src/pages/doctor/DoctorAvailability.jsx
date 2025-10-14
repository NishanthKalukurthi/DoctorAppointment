import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { availabilityService } from '../../services/availabilityService'
import { Calendar, Clock, Plus, Edit, Trash2, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'

export const DoctorAvailability = () => {
  const [availabilities, setAvailabilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm()

  const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ]

  useEffect(() => {
    fetchAvailabilities()
  }, [])

  const fetchAvailabilities = async () => {
    try {
      setLoading(true)
      console.log('Fetching doctor availability...')
      const data = await availabilityService.getMyAvailability()
      console.log('Fetched availability data:', data)
      setAvailabilities(data)
    } catch (error) {
      console.error('Error fetching availability:', error)
      console.error('Error response:', error.response?.data)
      toast.error(`Failed to fetch availability: ${error.response?.data?.message || error.message}`)
      setAvailabilities([])
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      // Validate time slots
      const startTime = new Date(`2000-01-01T${data.startTime}:00`)
      const endTime = new Date(`2000-01-01T${data.endTime}:00`)
      
      if (startTime >= endTime) {
        toast.error('End time must be after start time')
        return
      }
      
      // Check for reasonable time ranges (6 AM to 11 PM)
      const minTime = new Date('2000-01-01T06:00:00')
      const maxTime = new Date('2000-01-01T23:00:00')
      
      if (startTime < minTime || endTime > maxTime) {
        toast.error('Availability must be between 6:00 AM and 11:00 PM')
        return
      }
      
      // Convert string dayOfWeek to number for backend
      const formattedData = {
        ...data,
        dayOfWeek: parseInt(data.dayOfWeek)
      }
      
      console.log('Submitting availability data:', formattedData)
      
      if (editingId) {
        console.log('Updating availability with ID:', editingId)
        await availabilityService.updateAvailability(editingId, formattedData)
        toast.success('Availability updated successfully!')
        setEditingId(null)
      } else {
        console.log('Creating new availability')
        await availabilityService.createAvailability(formattedData)
        toast.success('Availability added successfully!')
        setShowAddForm(false)
      }
      reset()
      fetchAvailabilities()
    } catch (error) {
      console.error('Error saving availability:', error)
      console.error('Error response:', error.response?.data)
      toast.error(`Failed to save availability: ${error.response?.data?.message || error.message}`)
    }
  }

  const handleEdit = (availability) => {
    setEditingId(availability.id)
    setValue('dayOfWeek', availability.dayOfWeek.toString())
    setValue('startTime', availability.startTime)
    setValue('endTime', availability.endTime)
    setShowAddForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this availability?')) {
      try {
        await availabilityService.deleteAvailability(id)
        toast.success('Availability deleted successfully!')
        fetchAvailabilities()
      } catch (error) {
        toast.error('Failed to delete availability')
      }
    }
  }

  const handleQuickSetup = async () => {
    if (window.confirm('This will add standard availability slots (9 AM - 9 PM, Monday-Saturday). Continue?')) {
      try {
        const weekdays = [1, 2, 3, 4, 5, 6] // Monday to Saturday
        const timeSlots = [
          { start: '09:00', end: '10:00' },
          { start: '10:00', end: '11:00' },
          { start: '11:00', end: '12:00' },
          { start: '12:00', end: '13:00' },
          { start: '13:00', end: '14:00' },
          { start: '14:00', end: '15:00' },
          { start: '15:00', end: '16:00' },
          { start: '16:00', end: '17:00' },
          { start: '17:00', end: '18:00' },
          { start: '18:00', end: '19:00' },
          { start: '19:00', end: '20:00' },
          { start: '20:00', end: '21:00' }
        ]

        let successCount = 0
        let errorCount = 0

        for (const dayOfWeek of weekdays) {
          for (const slot of timeSlots) {
            try {
              await availabilityService.createAvailability({
                dayOfWeek: dayOfWeek,
                startTime: slot.start,
                endTime: slot.end
              })
              successCount++
            } catch (error) {
              errorCount++
              console.warn(`Failed to add slot ${slot.start}-${slot.end} for day ${dayOfWeek}:`, error.response?.data?.message)
            }
          }
        }

        if (successCount > 0) {
          toast.success(`Quick setup completed! Added ${successCount} availability slots.`)
          fetchAvailabilities()
        }
        
        if (errorCount > 0) {
          toast.warning(`${errorCount} slots were skipped due to overlaps or conflicts.`)
        }
      } catch (error) {
        console.error('Quick setup error:', error)
        toast.error('Quick setup failed. Please add slots manually.')
      }
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingId(null)
    reset()
  }

  const formatTime = (timeString) => {
    const time = new Date(`2000-01-01T${timeString}`)
    return time.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const getDayColor = (dayOfWeek) => {
    const colors = {
      'Sunday': 'bg-red-100 text-red-800',
      'Monday': 'bg-blue-100 text-blue-800',
      'Tuesday': 'bg-green-100 text-green-800',
      'Wednesday': 'bg-yellow-100 text-yellow-800',
      'Thursday': 'bg-purple-100 text-purple-800',
      'Friday': 'bg-pink-100 text-pink-800',
      'Saturday': 'bg-indigo-100 text-indigo-800'
    }
    return colors[dayOfWeek] || 'bg-gray-100 text-gray-800'
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
          <h1 className="text-3xl font-bold text-gray-900">Manage Availability</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => handleQuickSetup()}
              className="btn-secondary flex items-center"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Quick Setup
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Availability
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="card mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              {editingId ? 'Edit Availability' : 'Add New Availability'}
            </h3>
            
            {/* Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-blue-900 mb-2">📋 Availability Guidelines</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Time Range:</strong> Available hours are 6:00 AM to 11:00 PM</li>
                <li>• <strong>Slot Duration:</strong> Each slot represents a 1-hour appointment window</li>
                <li>• <strong>No Overlaps:</strong> Cannot overlap with existing availability slots</li>
                <li>• <strong>Sunday:</strong> Typically not available (day off)</li>
                <li>• <strong>Example:</strong> 9:00 AM - 10:00 AM creates a slot for 9:00 AM appointments</li>
              </ul>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Day of Week
                  </label>
                  <select
                    {...register('dayOfWeek', { required: 'Please select a day' })}
                    className="input-field"
                  >
                    <option value="">Select Day</option>
                    {daysOfWeek.map((day, index) => (
                      <option key={index} value={index}>
                        {day}
                      </option>
                    ))}
                  </select>
                  {errors.dayOfWeek && (
                    <p className="text-red-600 text-sm mt-1">{errors.dayOfWeek.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    {...register('startTime', { 
                      required: 'Start time is required',
                      min: '06:00',
                      max: '22:00'
                    })}
                    type="time"
                    min="06:00"
                    max="22:00"
                    className="input-field"
                  />
                  {errors.startTime && (
                    <p className="text-red-600 text-sm mt-1">{errors.startTime.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Available hours: 6:00 AM - 11:00 PM</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    {...register('endTime', { 
                      required: 'End time is required',
                      min: '06:00',
                      max: '23:00'
                    })}
                    type="time"
                    min="06:00"
                    max="23:00"
                    className="input-field"
                  />
                  {errors.endTime && (
                    <p className="text-red-600 text-sm mt-1">{errors.endTime.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Must be after start time</p>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary flex items-center"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? 'Update' : 'Add'} Availability
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Availability List */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Current Availability</h3>
          
          {availabilities.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No availability set</h3>
              <p className="text-gray-600 mb-4">Add your availability to start receiving appointments.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary flex items-center mx-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Availability
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {availabilities.map((availability) => (
                <div key={availability.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDayColor(daysOfWeek[availability.dayOfWeek])}`}>
                      {daysOfWeek[availability.dayOfWeek]}
                    </span>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>
                        {formatTime(availability.startTime)} - {formatTime(availability.endTime)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(availability)}
                      className="btn-secondary flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(availability.id)}
                      className="btn-danger flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
