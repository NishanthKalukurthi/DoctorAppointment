import api from './api'

export const adminService = {
  async getDashboardStats() {
    const response = await api.get('/admin/dashboard-stats')
    return response.data
  },

  async getRecentAppointments() {
    const response = await api.get('/admin/recent-appointments')
    return response.data
  },

  async getRecentUsers() {
    const response = await api.get('/admin/recent-users')
    return response.data
  },

  async getAllDoctors() {
    const response = await api.get('/admin/all-doctors')
    return response.data
  },

  async getPendingDoctors() {
    const response = await api.get('/admin/pending-doctors')
    return response.data
  },

  async getAllPatients() {
    const response = await api.get('/admin/all-patients')
    return response.data
  },

  async getAllAppointments(startDate = null, endDate = null) {
    const params = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    
    const response = await api.get('/admin/all-appointments', { params })
    return response.data
  },

  async verifyDoctor(doctorId, isVerified) {
    const response = await api.patch(`/admin/doctors/${doctorId}/verify`, { isVerified })
    return response.data
  },

  async approveDoctor(doctorId) {
    const response = await api.post(`/admin/doctors/${doctorId}/approve`)
    return response.data
  },

  async rejectDoctor(doctorId, reason = null) {
    const response = await api.post(`/admin/doctors/${doctorId}/reject`, { reason })
    return response.data
  },

  async updateUserStatus(userId, isActive) {
    const response = await api.patch(`/admin/users/${userId}/status`, { isActive })
    return response.data
  },

  async updateAppointmentStatus(appointmentId, status, cancellationReason = null) {
    const response = await api.patch(`/admin/appointments/${appointmentId}/status`, { 
      status: status, 
      cancellationReason: cancellationReason 
    })
    return response.data
  },

  async updateDoctor(doctorId, updateData) {
    const response = await api.patch(`/admin/doctors/${doctorId}`, updateData)
    return response.data
  },

  async seedDatabase() {
    const response = await api.post('/admin/seed-database')
    return response.data
  }
}
