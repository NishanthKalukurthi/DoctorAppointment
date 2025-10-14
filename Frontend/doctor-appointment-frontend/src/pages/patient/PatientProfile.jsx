import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { patientService } from '../../services/patientService'
import { User, Phone, Mail, Calendar, Heart, Shield, Edit, Save, X, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

export const PatientProfile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const data = await patientService.getProfile()
      setProfile(data)
      reset(data)
    } catch (error) {
      toast.error('Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      const updatedProfile = await patientService.updateProfile(data)
      setProfile(updatedProfile)
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided'
    return new Date(dateString).toLocaleDateString()
  }

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'Not provided'
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
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
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn-primary flex items-center"
          >
            {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="text-center">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-600 font-bold text-2xl">
                    {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {profile?.firstName} {profile?.lastName}
                </h2>
                <p className="text-gray-600">Patient</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span className="text-sm">{profile?.email}</span>
                  </div>
                  <div className="flex items-center justify-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span className="text-sm">{profile?.phoneNumber}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Age</span>
                  <span className="font-medium">{calculateAge(profile?.dateOfBirth)} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gender</span>
                  <span className="font-medium">{profile?.gender || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Blood Type</span>
                  <span className="font-medium">{profile?.bloodType || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Insurance</span>
                  <span className="font-medium">{profile?.insuranceProvider || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
        <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
              
              {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        {...register('firstName', { required: 'First name is required' })}
                        type="text"
                        className="input-field"
                        defaultValue={profile?.firstName}
                      />
                      {errors.firstName && (
                        <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        {...register('lastName', { required: 'Last name is required' })}
                        type="text"
                        className="input-field"
                        defaultValue={profile?.lastName}
                      />
                      {errors.lastName && (
                        <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        {...register('phoneNumber', { 
                          required: 'Phone number is required',
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: 'Please enter a valid 10-digit phone number'
                          }
                        })}
                        type="tel"
                        className="input-field"
                        defaultValue={profile?.phoneNumber}
                      />
                      {errors.phoneNumber && (
                        <p className="text-red-600 text-sm mt-1">{errors.phoneNumber.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <input
                        {...register('dateOfBirth')}
                        type="date"
                        className="input-field"
                        defaultValue={profile?.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : ''}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <select
                        {...register('gender')}
                        className="input-field"
                        defaultValue={profile?.gender || ''}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Blood Type
                      </label>
                      <select
                        {...register('bloodType')}
                        className="input-field"
                        defaultValue={profile?.bloodType || ''}
                      >
                        <option value="">Select Blood Type</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medical History
                    </label>
                    <textarea
                      {...register('medicalHistory')}
                      rows={4}
                      className="input-field"
                      defaultValue={profile?.medicalHistory}
                      placeholder="Describe any relevant medical history, surgeries, or chronic conditions"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allergies
                    </label>
                    <textarea
                      {...register('allergies')}
                      rows={3}
                      className="input-field"
                      defaultValue={profile?.allergies}
                      placeholder="List any allergies to medications, foods, or other substances"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Emergency Contact Name
                      </label>
                      <input
                        {...register('emergencyContactName')}
                        type="text"
                        className="input-field"
                        defaultValue={profile?.emergencyContactName}
                        placeholder="Full name of emergency contact"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Emergency Contact Phone
                      </label>
                      <input
                        {...register('emergencyContactPhone', {
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: 'Please enter a valid 10-digit phone number'
                          }
                        })}
                        type="tel"
                        className="input-field"
                        defaultValue={profile?.emergencyContactPhone}
                        placeholder="10-digit phone number"
                      />
                      {errors.emergencyContactPhone && (
                        <p className="text-red-600 text-sm mt-1">{errors.emergencyContactPhone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Insurance Provider
                      </label>
                      <input
                        {...register('insuranceProvider')}
                        type="text"
                        className="input-field"
                        defaultValue={profile?.insuranceProvider}
                        placeholder="Name of insurance company"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Insurance Number
                      </label>
                      <input
                        {...register('insuranceNumber')}
                        type="text"
                        className="input-field"
                        defaultValue={profile?.insuranceNumber}
                        placeholder="Insurance policy number"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary flex items-center"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <p className="font-medium">{profile?.email}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Phone:</span>
                        <p className="font-medium">{profile?.phoneNumber}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Date of Birth:</span>
                        <p className="font-medium">{formatDate(profile?.dateOfBirth)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Age:</span>
                        <p className="font-medium">{calculateAge(profile?.dateOfBirth)} years</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Gender:</span>
                        <p className="font-medium">{profile?.gender || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Blood Type:</span>
                        <p className="font-medium">{profile?.bloodType || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  {profile?.medicalHistory && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Medical History</h4>
                      <p className="text-gray-600">{profile.medicalHistory}</p>
                    </div>
                  )}

                  {profile?.allergies && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                        Allergies
                      </h4>
                      <p className="text-gray-600">{profile.allergies}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Emergency Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600">Name:</span>
                        <p className="font-medium">{profile?.emergencyContactName || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Phone:</span>
                        <p className="font-medium">{profile?.emergencyContactPhone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Insurance Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600">Provider:</span>
                        <p className="font-medium">{profile?.insuranceProvider || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Policy Number:</span>
                        <p className="font-medium">{profile?.insuranceNumber || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
