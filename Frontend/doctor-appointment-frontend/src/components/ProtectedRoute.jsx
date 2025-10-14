import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, hasRole, loading, user } = useAuth()

  console.log('ProtectedRoute - loading:', loading, 'user:', user, 'isAuthenticated:', isAuthenticated())

  // Show loading while auth is initializing
  if (loading) {
    console.log('ProtectedRoute - showing loading spinner')
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Check authentication using the simplified logic
  if (!isAuthenticated()) {
    console.log('ProtectedRoute - not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }

  // Check role permissions
  if (allowedRoles.length > 0 && !allowedRoles.some(role => hasRole(role))) {
    console.log('ProtectedRoute - role check failed, redirecting to home')
    return <Navigate to="/" replace />
  }

  console.log('ProtectedRoute - rendering children')
  return children
}
