import React, { useState, useEffect } from 'react'
import { 
  UserCheck, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  CheckCircle, 
  XCircle,
  MapPin,
  Clock,
  TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminService } from '../../services/adminService'

export const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSpecialization, setFilterSpecialization] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const doctorsData = await adminService.getAllDoctors()
      setDoctors(doctorsData)
    } catch (error) {
      console.error('Error fetching doctors:', error)
      toast.error('Failed to fetch doctors')
      setDoctors([])
    } finally {
      setLoading(false)
    }
  }



  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialization = !filterSpecialization || doctor.specialization === filterSpecialization
    const matchesStatus = !filterStatus || 
                         (filterStatus === 'active' && doctor.isActive) ||
                         (filterStatus === 'inactive' && !doctor.isActive)
    
    return matchesSearch && matchesSpecialization && matchesStatus
  })

  const specializations = [...new Set(doctors.map(d => d.specialization))]

  const handleViewDoctor = (doctor) => {
    setSelectedDoctor(doctor)
    setShowViewModal(true)
  }

  const handleApproveDoctor = async (doctorId) => {
    try {
      await adminService.approveDoctor(doctorId)
      toast.success('Doctor approved successfully!')
      fetchDoctors()
    } catch (error) {
      console.error('Error approving doctor:', error)
      toast.error('Failed to approve doctor')
    }
  }



  const closeModals = () => {
    setShowViewModal(false)
    setSelectedDoctor(null)
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
          <h1 className="text-3xl font-bold text-gray-900">View Doctors</h1>
          <div className="text-sm text-gray-600">
            Total: {doctors.length} doctors
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
                  placeholder="Search doctors..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialization
              </label>
              <select
                value={filterSpecialization}
                onChange={(e) => setFilterSpecialization(e.target.value)}
                className="input-field"
              >
                <option value="">All Specializations</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterSpecialization('')
                  setFilterStatus('')
                }}
                className="btn-secondary w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Doctors List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="card">
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
                <div className="flex space-x-1">
                  {doctor.isVerified ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
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
                <div className="text-sm text-gray-600">
                  License: {doctor.licenseNumber}
                </div>
              </div>

              {doctor.bio && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {doctor.bio}
                </p>
              )}

              <div className="flex space-x-2 mb-4">
                <button 
                  onClick={() => handleViewDoctor(doctor)}
                  className="btn-secondary w-full"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </button>
                {!doctor.isVerified && (
                  <button 
                    onClick={() => handleApproveDoctor(doctor.id)}
                    className="btn-primary w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No doctors found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}

        {/* View Doctor Modal */}
        {showViewModal && selectedDoctor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Doctor Details</h2>
                <button
                  onClick={closeModals}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-xl">
                      {selectedDoctor.firstName[0]}{selectedDoctor.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                    </h3>
                    <p className="text-primary-600 font-medium">
                      {selectedDoctor.specialization}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">Email:</span> {selectedDoctor.email}</p>
                      <p><span className="font-medium">Phone:</span> {selectedDoctor.phoneNumber}</p>
                      <p><span className="font-medium">Address:</span> {selectedDoctor.address}</p>
                      <p><span className="font-medium">City:</span> {selectedDoctor.city}, {selectedDoctor.state}</p>
                      <p><span className="font-medium">ZIP:</span> {selectedDoctor.zipCode}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Professional Details</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">License:</span> {selectedDoctor.licenseNumber}</p>
                      <p><span className="font-medium">Experience:</span> {selectedDoctor.experienceYears} years</p>
                      <p><span className="font-medium">Consultation Fee:</span> ₹{selectedDoctor.consultationFee}</p>
                      <p><span className="font-medium">Status:</span> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          selectedDoctor.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedDoctor.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {selectedDoctor.bio && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Bio</h4>
                    <p className="text-gray-600">{selectedDoctor.bio}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={closeModals}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
