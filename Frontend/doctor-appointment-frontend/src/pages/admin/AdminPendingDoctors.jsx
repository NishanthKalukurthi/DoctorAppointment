import React, { useState, useEffect } from 'react'
import { 
  UserCheck, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle,
  MapPin,
  Clock,
  DollarSign,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminService } from '../../services/adminService'

export const AdminPendingDoctors = () => {
  const [pendingDoctors, setPendingDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSpecialization, setFilterSpecialization] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    fetchPendingDoctors()
  }, [])

  const fetchPendingDoctors = async () => {
    try {
      setLoading(true)
      const doctorsData = await adminService.getPendingDoctors()
      setPendingDoctors(doctorsData)
    } catch (error) {
      console.error('Error fetching pending doctors:', error)
      toast.error('Failed to fetch pending doctors')
      setPendingDoctors([])
    } finally {
      setLoading(false)
    }
  }

  const filteredDoctors = pendingDoctors.filter(doctor => {
    const matchesSearch = doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialization = !filterSpecialization || doctor.specialization === filterSpecialization
    
    return matchesSearch && matchesSpecialization
  })

  const specializations = [...new Set(pendingDoctors.map(d => d.specialization))]

  const handleViewDoctor = (doctor) => {
    setSelectedDoctor(doctor)
    setShowViewModal(true)
  }

  const handleApproveDoctor = async (doctorId) => {
    try {
      await adminService.approveDoctor(doctorId)
      toast.success('Doctor approved successfully!')
      fetchPendingDoctors()
    } catch (error) {
      console.error('Error approving doctor:', error)
      toast.error('Failed to approve doctor')
    }
  }

  const handleRejectDoctor = async (doctorId) => {
    try {
      await adminService.rejectDoctor(doctorId, rejectReason)
      toast.success('Doctor rejected successfully!')
      setShowRejectModal(false)
      setRejectReason('')
      fetchPendingDoctors()
    } catch (error) {
      console.error('Error rejecting doctor:', error)
      toast.error('Failed to reject doctor')
    }
  }

  const openRejectModal = (doctor) => {
    setSelectedDoctor(doctor)
    setShowRejectModal(true)
  }

  const closeModals = () => {
    setShowViewModal(false)
    setShowRejectModal(false)
    setSelectedDoctor(null)
    setRejectReason('')
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pending Doctor Approvals</h1>
            <p className="text-gray-600 mt-2">
              Review and approve doctor registration requests
            </p>
          </div>
          <div className="text-sm text-gray-600">
            Total: {pendingDoctors.length} pending
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterSpecialization('')
                }}
                className="btn-secondary w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Pending Doctors List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="card border-l-4 border-l-yellow-500">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 font-semibold text-lg">
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
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="text-xs text-yellow-600 font-medium">Pending</span>
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
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span className="text-sm">
                    ₹{doctor.consultationFee} consultation fee
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  License: {doctor.licenseNumber}
                </div>
                <div className="text-sm text-gray-500">
                  Applied: {new Date(doctor.createdAt).toLocaleDateString()}
                </div>
              </div>

              {doctor.bio && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {doctor.bio}
                </p>
              )}

              <div className="flex space-x-2">
                <button 
                  onClick={() => handleViewDoctor(doctor)}
                  className="btn-secondary flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </button>
                <button 
                  onClick={() => handleApproveDoctor(doctor.id)}
                  className="btn-primary flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </button>
                <button 
                  onClick={() => openRejectModal(doctor)}
                  className="btn-primary flex-1 bg-red-600 hover:bg-red-700"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No pending doctors found
            </h3>
            <p className="text-gray-600">
              {pendingDoctors.length === 0 
                ? "All doctor registrations have been processed"
                : "Try adjusting your search criteria or filters"
              }
            </p>
          </div>
        )}

        {/* View Doctor Modal */}
        {showViewModal && selectedDoctor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Doctor Registration Details</h2>
                <button
                  onClick={closeModals}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 font-semibold text-xl">
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
                    <div className="flex items-center mt-1">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mr-1" />
                      <span className="text-sm text-yellow-600 font-medium">Pending Approval</span>
                    </div>
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
                      <p><span className="font-medium">Applied:</span> {new Date(selectedDoctor.createdAt).toLocaleDateString()}</p>
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
                  onClick={() => {
                    closeModals()
                    openRejectModal(selectedDoctor)
                  }}
                  className="btn-secondary bg-red-600 hover:bg-red-700 text-white"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
                </button>
                <button
                  onClick={() => {
                    handleApproveDoctor(selectedDoctor.id)
                    closeModals()
                  }}
                  className="btn-primary bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Doctor Modal */}
        {showRejectModal && selectedDoctor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Reject Doctor Registration</h2>
                <button
                  onClick={closeModals}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-600 mb-2">
                  Are you sure you want to reject the registration for:
                </p>
                <p className="font-semibold text-gray-900">
                  Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for rejection (optional)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="input-field"
                  placeholder="Enter reason for rejection..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModals}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRejectDoctor(selectedDoctor.id)}
                  className="btn-primary bg-red-600 hover:bg-red-700"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject Registration
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

