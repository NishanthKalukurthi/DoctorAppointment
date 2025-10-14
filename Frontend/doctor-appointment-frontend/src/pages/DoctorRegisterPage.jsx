import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import { Stethoscope, Eye, EyeOff, User, Mail, Phone, MapPin, GraduationCap, Shield, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export const DoctorRegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors }, watch } = useForm()
  const password = watch('password')

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await registerUser(data, 'doctor')
      toast.success('Registration successful! Your account is pending admin approval.')
      navigate('/login')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Stethoscope className="w-12 h-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Doctor Registration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join our medical community and start helping patients
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
              <p className="text-sm text-blue-800">
                <strong>Important:</strong> Your registration will be reviewed by our admin team before approval. 
                You'll receive an email notification once your account is approved.
              </p>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign in
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name *
                    </label>
                    <input
                      {...register('firstName', { required: 'First name is required' })}
                      type="text"
                      className="input-field mt-1"
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name *
                    </label>
                    <input
                      {...register('lastName', { required: 'Last name is required' })}
                      type="text"
                      className="input-field mt-1"
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address *
                    </label>
                    <input
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      type="email"
                      className="input-field mt-1"
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                      Phone Number *
                    </label>
                    <input
                      {...register('phoneNumber', { required: 'Phone number is required' })}
                      type="tel"
                      className="input-field mt-1"
                      placeholder="Enter your phone number"
                    />
                    {errors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password *
                    </label>
                    <div className="mt-1 relative">
                      <input
                        {...register('password', { 
                          required: 'Password is required',
                          minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters'
                          }
                        })}
                        type={showPassword ? 'text' : 'password'}
                        className="input-field pr-10"
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm Password *
                    </label>
                    <input
                      {...register('confirmPassword', { 
                        required: 'Please confirm your password',
                        validate: value => value === password || 'Passwords do not match'
                      })}
                      type="password"
                      className="input-field mt-1"
                      placeholder="Confirm your password"
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Professional Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                      Medical Specialization *
                    </label>
                    <select
                      {...register('specialization', { required: 'Specialization is required' })}
                      className="input-field mt-1"
                    >
                      <option value="">Select your specialization</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Gynecology">Gynecology</option>
                      <option value="Ophthalmology">Ophthalmology</option>
                      <option value="Psychiatry">Psychiatry</option>
                      <option value="Gastroenterology">Gastroenterology</option>
                      <option value="Endocrinology">Endocrinology</option>
                      <option value="General Medicine">General Medicine</option>
                      <option value="Internal Medicine">Internal Medicine</option>
                      <option value="Emergency Medicine">Emergency Medicine</option>
                      <option value="Radiology">Radiology</option>
                      <option value="Anesthesiology">Anesthesiology</option>
                      <option value="Pathology">Pathology</option>
                      <option value="Oncology">Oncology</option>
                      <option value="Urology">Urology</option>
                      <option value="ENT">ENT (Ear, Nose, Throat)</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.specialization && (
                      <p className="mt-1 text-sm text-red-600">{errors.specialization.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                      Medical License Number *
                    </label>
                    <input
                      {...register('licenseNumber', { required: 'License number is required' })}
                      type="text"
                      className="input-field mt-1"
                      placeholder="Enter your medical license number"
                    />
                    {errors.licenseNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.licenseNumber.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700">
                      Years of Experience *
                    </label>
                    <input
                      {...register('experienceYears', { 
                        required: 'Years of experience is required',
                        min: { value: 0, message: 'Experience must be positive' },
                        max: { value: 50, message: 'Please enter a valid experience' }
                      })}
                      type="number"
                      className="input-field mt-1"
                      placeholder="0"
                      min="0"
                      max="50"
                    />
                    {errors.experienceYears && (
                      <p className="mt-1 text-sm text-red-600">{errors.experienceYears.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="consultationFee" className="block text-sm font-medium text-gray-700">
                      Consultation Fee (₹) *
                    </label>
                    <input
                      {...register('consultationFee', { 
                        required: 'Consultation fee is required',
                        min: { value: 0, message: 'Fee must be positive' }
                      })}
                      type="number"
                      step="0.01"
                      className="input-field mt-1"
                      placeholder="0.00"
                      min="0"
                    />
                    {errors.consultationFee && (
                      <p className="mt-1 text-sm text-red-600">{errors.consultationFee.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                      Professional Bio
                    </label>
                    <textarea
                      {...register('bio')}
                      rows={4}
                      className="input-field mt-1"
                      placeholder="Tell us about your experience, education, and areas of expertise..."
                    />
                  </div>
                </div>
              </div>

              {/* Practice Location */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                  <MapPin className="w-5 h-5 mr-2" />
                  Practice Location
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Practice Address *
                    </label>
                    <input
                      {...register('address', { required: 'Address is required' })}
                      type="text"
                      className="input-field mt-1"
                      placeholder="Enter your practice address"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        City *
                      </label>
                      <input
                        {...register('city', { required: 'City is required' })}
                        type="text"
                        className="input-field mt-1"
                        placeholder="City"
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                        State *
                      </label>
                      <input
                        {...register('state', { required: 'State is required' })}
                        type="text"
                        className="input-field mt-1"
                        placeholder="State"
                      />
                      {errors.state && (
                        <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                      ZIP Code *
                    </label>
                    <input
                      {...register('zipCode', { required: 'ZIP code is required' })}
                      type="text"
                      className="input-field mt-1"
                      placeholder="ZIP Code"
                    />
                    {errors.zipCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
              />
              <label htmlFor="terms" className="ml-3 block text-sm text-gray-900">
                I agree to the{' '}
                <a href="#" className="text-primary-600 hover:text-primary-500">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary-600 hover:text-primary-500">
                  Privacy Policy
                </a>
                . I confirm that all information provided is accurate and I understand that my registration will be reviewed before approval.
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Registering...
                </div>
              ) : (
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Register as Doctor
                </div>
              )}
            </button>
          </div>

          {/* Additional Info */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Want to register as a patient instead?{' '}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Patient Registration
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

