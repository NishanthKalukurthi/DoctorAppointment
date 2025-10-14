import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { doctorService } from '../../services/doctorService'
import { Search, MapPin, Star, Clock, TrendingUp, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

export const SearchDoctors = () => {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [searchParams, setSearchParams] = useState({
    name: '',
    specialization: '',
    city: '',
    state: '',
    maxFee: ''
  })

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      console.log('Fetching doctors with params:', searchParams)
      const data = await doctorService.getDoctors(searchParams)
      console.log('Received doctors:', data)
      setDoctors(data)
    } catch (error) {
      console.error('Error fetching doctors:', error)
      toast.error(`Failed to fetch doctors: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchDoctors()
  }

  const handleInputChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value
    })
  }

  const clearFilters = () => {
    setSearchParams({
      name: '',
      specialization: '',
      city: '',
      state: '',
      maxFee: ''
    })
  }

  const handleViewProfile = (doctor) => {
    setSelectedDoctor(doctor)
    setShowProfileModal(true)
  }

  const closeProfileModal = () => {
    setShowProfileModal(false)
    setSelectedDoctor(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Doctors</h1>
          <p className="text-gray-600">Search and book appointments with verified healthcare professionals</p>
        </div>

        {/* Search Form */}
        <div className="card mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor Name
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="name"
                    value={searchParams.name}
                    onChange={handleInputChange}
                    className="input-field pl-10"
                    placeholder="Search by name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={searchParams.specialization}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., Cardiology"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={searchParams.city}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={searchParams.state}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter state"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Fee (₹)
                </label>
                <input
                  type="number"
                  name="maxFee"
                  value={searchParams.maxFee}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Max fee"
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={clearFilters}
                className="btn-secondary"
              >
                Clear Filters
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center"
              >
                <Search className="w-4 h-4 mr-2" />
                Search Doctors
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold text-lg">
                        {doctor.firstName[0]}{doctor.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </h3>
                      <p className="text-primary-600 font-medium">
                        {doctor.specialization}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">4.8</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {doctor.city}, {doctor.state}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {doctor.experienceYears} years experience
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      ₹{doctor.consultationFee} consultation fee
                    </span>
                  </div>
                </div>

                {doctor.bio && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {doctor.bio}
                  </p>
                )}

                <div className="flex space-x-2">
                  <Link
                    to={`/patient/book/${doctor.id}`}
                    className="btn-primary flex-1 text-center"
                  >
                    Book Appointment
                  </Link>
                  <button 
                    onClick={() => handleViewProfile(doctor)}
                    className="btn-secondary"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && doctors.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No doctors found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or clear the filters
            </p>
          </div>
        )}

        {/* Doctor Profile Modal */}
        {showProfileModal && selectedDoctor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Doctor Profile</h2>
                <button
                  onClick={closeProfileModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Doctor Info */}
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-xl">
                      {selectedDoctor.firstName[0]}{selectedDoctor.lastName[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                    </h3>
                    <p className="text-primary-600 font-medium text-lg">
                      {selectedDoctor.specialization}
                    </p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">4.8 (120 reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {selectedDoctor.address}, {selectedDoctor.city}, {selectedDoctor.state} {selectedDoctor.zipCode}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {selectedDoctor.experienceYears} years experience
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      ₹{selectedDoctor.consultationFee} consultation fee
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      License: {selectedDoctor.licenseNumber}
                    </span>
                  </div>
                </div>

                {/* Bio */}
                {selectedDoctor.bio && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">About</h4>
                    <p className="text-gray-600 leading-relaxed">
                      {selectedDoctor.bio}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-4 pt-4 border-t">
                  <Link
                    to={`/patient/book/${selectedDoctor.id}`}
                    onClick={closeProfileModal}
                    className="btn-primary flex-1 text-center"
                  >
                    Book Appointment
                  </Link>
                  <button
                    onClick={closeProfileModal}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
