import api from './api'

export const availabilityService = {
  async getDoctorAvailability(doctorId) {
    const response = await api.get(`/availability/doctor/${doctorId}`)
    return response.data
  },

  async getAvailableSlots(doctorId, startDate, endDate) {
    try {
      console.log('Making API call to:', `/availability/doctor/${doctorId}/slots`)
      console.log('With params:', { startDate, endDate })
      
      const response = await api.get(`/availability/doctor/${doctorId}/slots`, {
        params: { startDate, endDate }
      })
      
      console.log('API response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching available slots:', error)
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      })
      // Return empty array if API fails
      return []
    }
  },

  async getMyAvailability() {
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
  }
}
