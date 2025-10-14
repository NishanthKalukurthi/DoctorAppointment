import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Search, 
  Eye, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Calendar,
  Phone,
  Mail
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminService } from '../../services/adminService'

export const AdminPatients = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const patientsData = await adminService.getAllPatients()
      setPatients(patientsData)
    } catch (error) {
      console.error('Error fetching patients:', error)
      toast.error('Failed to fetch patients')
      setPatients([])
    } finally {
      setLoading(false)
    }
  }


  const calculateAge = (dateOfBirth) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || 
                         (filterStatus === 'active' && patient.isActive) ||
                         (filterStatus === 'inactive' && !patient.isActive)
    
    return matchesSearch && matchesStatus
  })

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient)
    setShowViewModal(true)
  }

  const closeModal = () => {
    setShowViewModal(false)
    setSelectedPatient(null)
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
          <h1 className="text-3xl font-bold text-gray-900">View Patients</h1>
          <div className="text-sm text-gray-600">
            Total: {patients.length} patients
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
                  placeholder="Search patients..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterStatus('')
                }}
                className="btn-secondary w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Patients List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <div key={patient.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-lg">
                      {patient.firstName[0]}{patient.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {patient.firstName} {patient.lastName}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {calculateAge(patient.dateOfBirth)} years old • {patient.gender}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  {patient.isActive ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="text-sm">{patient.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span className="text-sm">{patient.phoneNumber}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm">
                    {patient.totalAppointments} appointments
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Blood Type: {patient.bloodType}
                </div>
              </div>

              {patient.medicalHistory && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Medical History:</p>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {patient.medicalHistory}
                  </p>
                </div>
              )}

              {patient.allergies && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Allergies:</p>
                  <p className="text-gray-600 text-sm">
                    {patient.allergies}
                  </p>
                </div>
              )}

              <div className="flex space-x-2 mb-4">
                <button 
                  onClick={() => handleViewPatient(patient)}
                  className="btn-secondary w-full"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </button>
              </div>

            </div>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No patients found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}

        {/* View Patient Modal */}
        {showViewModal && selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Patient Details</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-xl">
                      {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </h3>
                    <p className="text-gray-600">
                      {calculateAge(selectedPatient.dateOfBirth)} years old • {selectedPatient.gender}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">Email:</span> {selectedPatient.email}</p>
                      <p><span className="font-medium">Phone:</span> {selectedPatient.phoneNumber}</p>
                      <p><span className="font-medium">Date of Birth:</span> {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</p>
                      <p><span className="font-medium">Blood Type:</span> {selectedPatient.bloodType}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Medical Information</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">Medical History:</span> {selectedPatient.medicalHistory || 'None'}</p>
                      <p><span className="font-medium">Allergies:</span> {selectedPatient.allergies || 'None'}</p>
                      <p><span className="font-medium">Insurance:</span> {selectedPatient.insuranceProvider || 'Not provided'}</p>
                      <p><span className="font-medium">Policy Number:</span> {selectedPatient.insuranceNumber || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Emergency Contact</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedPatient.emergencyContactName || 'Not provided'}</p>
                    <p><span className="font-medium">Phone:</span> {selectedPatient.emergencyContactPhone || 'Not provided'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Account Information</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Total Appointments:</span> {selectedPatient.totalAppointments}</p>
                    <p><span className="font-medium">Member Since:</span> {new Date(selectedPatient.createdAt).toLocaleDateString()}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        selectedPatient.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedPatient.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </p>
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
