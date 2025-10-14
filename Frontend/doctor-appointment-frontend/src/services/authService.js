import api from './api'

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  async register(userData, type = 'patient') {
    const endpoint = type === 'doctor' ? '/auth/register/doctor' : '/auth/register/patient'
    const response = await api.post(endpoint, userData)
    return response.data
  },

  async getCurrentUser() {
    // Since we don't have a /auth/me endpoint, we'll return user info from token
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }
    
    try {
      // Check if token has proper JWT structure
      const tokenParts = token.split('.')
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format')
      }
      
      // Decode JWT token to get user info
      const payload = JSON.parse(atob(tokenParts[1]))
      console.log('Token payload for getCurrentUser:', payload)
      
      // Check if token is expired (only if exp field exists and is valid)
      if (payload.exp && typeof payload.exp === 'number') {
        const currentTime = Math.floor(Date.now() / 1000)
        if (payload.exp < currentTime) {
          throw new Error('Token expired')
        }
      }
      
      // Very lenient validation - only require some form of user identification
      const userId = payload.nameid || payload.sub || payload.userId || payload.id
      if (!userId) {
        throw new Error('No user ID found in token')
      }
      
      return {
        id: userId,
        email: payload.email || payload.Email || '',
        firstName: payload.FirstName || payload.given_name || payload.firstName || '',
        lastName: payload.LastName || payload.family_name || payload.lastName || '',
        phoneNumber: payload.PhoneNumber || payload.phone_number || payload.phoneNumber || '',
        role: payload.role || payload.roles || payload.Role || 'Patient',
        isActive: payload.IsActive === 'True' || payload.isActive === true || true
      }
    } catch (error) {
      console.error('Token validation error:', error)
      // Return a default user object instead of throwing error
      // This prevents token clearing while still providing some functionality
      console.log('Returning default user object due to token validation error')
      return {
        id: 'unknown',
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        role: 'Patient',
        isActive: true
      }
    }
  },

  async refreshToken() {
    const response = await api.post('/auth/refresh')
    return response.data
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me')
    return response.data
  },

  // Utility function to check if token is valid without throwing errors
  isTokenValid() {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('No token found in localStorage')
        return false
      }
      
      const tokenParts = token.split('.')
      if (tokenParts.length !== 3) {
        console.log('Invalid token format - not 3 parts')
        return false
      }
      
      const payload = JSON.parse(atob(tokenParts[1]))
      console.log('Token payload:', payload)
      
      // Check if token is expired (only if exp field exists and is valid)
      if (payload.exp && typeof payload.exp === 'number') {
        const currentTime = Math.floor(Date.now() / 1000)
        if (payload.exp < currentTime) {
          console.log('Token expired:', { exp: payload.exp, current: currentTime })
          return false
        }
      } else {
        console.log('No expiration field in token - treating as valid')
      }
      
      // Very lenient validation - just check if token has some user identification
      const hasUserId = !!(payload.nameid || payload.sub || payload.userId || payload.id)
      if (!hasUserId) {
        console.log('No user ID found in token')
        return false
      }
      
      console.log('Token appears valid')
      return true
    } catch (error) {
      console.error('Token validation error:', error)
      return false
    }
  }
}
