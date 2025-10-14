import api from './api'

export const doctorService = {
  async getDoctors(searchParams = {}) {
    const response = await api.get('/doctors', { params: searchParams })
    return response.data
  },

  async getDoctor(id) {
    const response = await api.get(`/doctors/${id}`)
    return response.data
  },

  async getProfile() {
    const response = await api.get('/doctors/profile')
    return response.data
  },

  async updateProfile(data) {
    const response = await api.put('/doctors/profile', data)
    return response.data
  },

  async getAppointments(doctorId) {
    const response = await api.get(`/doctors/${doctorId}/appointments`)
    return response.data
  },

  async getAvailability() {
    const response = await api.get('/availability/my-availability')
    return response.data
  },

  async createAvailability(data) {
    const response = await api.post('/availability/my-availability', data)
    return response.data
  },

  async updateAvailability(id, data) {
    const response = await api.put(`/availability/${id}`, data)
    return response.data
  },

  async deleteAvailability(id) {
    const response = await api.delete(`/availability/${id}`)
    return response.data
  },

  async getAvailableSlots(doctorId, startDate, endDate) {
    const response = await api.get(`/availability/doctor/${doctorId}/slots`, {
      params: { startDate, endDate }
    })
    return response.data
  }
}
