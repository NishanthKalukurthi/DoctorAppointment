import api from './api'

export const appointmentService = {
  async createAppointment(data) {
    const response = await api.post('/appointments', data)
    return response.data
  },

  async getAppointment(id) {
    const response = await api.get(`/appointments/${id}`)
    return response.data
  },

  async updateAppointment(id, data) {
    const response = await api.put(`/appointments/${id}`, data)
    return response.data
  },

  async updateAppointmentStatus(id, status, cancellationReason = null) {
    console.log('Sending status update request:', { id, status, cancellationReason })
    
    // Convert string status to numeric enum value
    const statusMap = {
      'Scheduled': 0,
      'Confirmed': 1,
      'InProgress': 2,
      'Completed': 3,
      'Cancelled': 4,
      'NoShow': 5
    }
    
    const numericStatus = statusMap[status] !== undefined ? statusMap[status] : status
    console.log('Converted status:', status, '->', numericStatus)
    
    const requestData = { 
      status: numericStatus, 
      cancellationReason: cancellationReason 
    }
    console.log('Request data being sent:', requestData)
    const response = await api.patch(`/appointments/${id}/status`, requestData)
    console.log('Status update response:', response.data)
    return response.data
  },

  async cancelAppointment(id, reason) {
    const response = await api.post(`/appointments/${id}/cancel`, { cancellationReason: reason })
    return response.data
  }
}
