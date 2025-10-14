import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext()

// Export the hook as default for HMR compatibility
const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { useAuth }
export default AuthContext

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    const initAuth = async () => {
      // Get token from localStorage
      const storedToken = localStorage.getItem('token')
      console.log('Initializing auth with token:', storedToken ? 'exists' : 'none')
      
      if (storedToken) {
        setToken(storedToken)
        
        // Get user data from API instead of parsing JWT token
        try {
          console.log('Fetching user data from API...')
          const userData = await authService.getCurrentUser()
          console.log('User data from API:', userData)
          setUser(userData)
          console.log('User data set successfully from API')
        } catch (error) {
          console.error('Error fetching user data from API:', error)
          
          // Fallback: try to parse token if API call fails
          try {
            console.log('Falling back to token parsing...')
            const tokenParts = storedToken.split('.')
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]))
              console.log('JWT Payload (fallback):', payload)
              
              const userId = payload.nameid || payload.sub || payload.userId || payload.id || payload.NameIdentifier
              if (userId) {
                const fallbackUserData = {
                  id: userId,
                  email: payload.email || payload.Email || '',
                  firstName: payload.FirstName || payload.given_name || payload.firstName || '',
                  lastName: payload.LastName || payload.family_name || payload.lastName || '',
                  phoneNumber: payload.PhoneNumber || payload.phone_number || payload.phoneNumber || '',
                  role: payload.role || payload.roles || payload.Role || 'Patient',
                  isActive: payload.IsActive === 'True' || payload.isActive === true || true
                }
                
                console.log('Fallback user data:', fallbackUserData)
                setUser(fallbackUserData)
              }
            }
          } catch (parseError) {
            console.error('Error parsing token (fallback):', parseError)
          }
        }
      } else {
        console.log('No token found in localStorage')
      }
      
      // Set loading to false after all processing is complete
      setLoading(false)
      console.log('Auth initialization complete, loading set to false')
    }
    
    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password)
      setUser(response.user)
      setToken(response.token)
      localStorage.setItem('token', response.token)
      return response
    } catch (error) {
      // Check if it's a doctor account that's not verified
      if (error.response?.status === 401 && error.response?.data?.message?.includes('not verified')) {
        throw new Error('Your doctor account is pending admin approval. Please wait for approval before logging in.')
      }
      throw error
    }
  }

  const register = async (userData, type = 'patient') => {
    try {
      const response = await authService.register(userData, type)
      setUser(response.user)
      setToken(response.token)
      localStorage.setItem('token', response.token)
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    console.log('Logging out user...')
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    console.log('User logged out successfully')
  }

  const isAuthenticated = () => {
    // Simple check: if we have a token in localStorage, user is authenticated
    const hasToken = !!localStorage.getItem('token')
    console.log('isAuthenticated check - hasToken:', hasToken, 'user:', user)
    return hasToken
  }

  const hasRole = (role) => {
    return user?.role === role
  }

  const reinitializeAuth = async () => {
    console.log('Reinitializing auth state...')
    const storedToken = localStorage.getItem('token')
    setToken(storedToken)
    
    if (storedToken) {
      try {
        const userData = await authService.getCurrentUser()
        setUser(userData)
        console.log('Auth reinitialized successfully:', userData)
      } catch (error) {
        console.error('Failed to reinitialize auth:', error)
        
        // Try to refresh token if it's expired
        if (error.message.includes('expired')) {
          console.log('Token expired, attempting to refresh...')
          try {
            const refreshResponse = await authService.refreshToken()
            setUser(refreshResponse.user)
            setToken(refreshResponse.token)
            localStorage.setItem('token', refreshResponse.token)
            console.log('Token refreshed successfully')
            return
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError)
          }
        }
        
        // Only clear token if it's definitely invalid and can't be refreshed
        if (error.message.includes('Invalid token') || error.message.includes('expired')) {
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
        }
      }
    } else {
      setUser(null)
    }
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole,
    reinitializeAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
