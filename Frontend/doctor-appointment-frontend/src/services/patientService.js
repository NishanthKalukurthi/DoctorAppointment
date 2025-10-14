import api from './api'

export const patientService = {
  async getProfile() {
    const response = await api.get('/patients/profile')
    return response.data
  },

  async updateProfile(data) {
    const response = await api.put('/patients/profile', data)
    return response.data
  },

  async getAppointments() {
    const response = await api.get('/patients/appointments')
    return response.data
  }
}
