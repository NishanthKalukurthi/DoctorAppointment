import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Stethoscope, Mail, Phone, MapPin } from 'lucide-react'

export const Footer = () => {
  const { isAuthenticated, user, logout } = useAuth()
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Stethoscope className="w-6 h-6" />
              <span className="text-xl font-bold">MediCare India</span>
            </div>
            <p className="text-gray-300 mb-4">
              India's leading healthcare platform connecting patients with verified doctors across the country.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              {!isAuthenticated() ? (
                <>
                  <li>
                    <Link to="/doctors" className="text-gray-300 hover:text-white transition-colors">
                      Find Doctors
                    </Link>
                  </li>
                  <li>
                    <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="text-gray-300 hover:text-white transition-colors">
                      Sign Up
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to={user?.role === 'Patient' ? '/patient' : user?.role === 'Doctor' ? '/doctor' : '/admin'} className="text-gray-300 hover:text-white transition-colors">
                      Dashboard
                    </Link>
                  </li>
                  {user?.role === 'Patient' && (
                    <li>
                      <Link to="/doctors" className="text-gray-300 hover:text-white transition-colors">
                        Find Doctors
                      </Link>
                    </li>
                  )}
                  <li>
                    <button onClick={logout} className="text-gray-300 hover:text-white transition-colors">
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              {!isAuthenticated() ? (
                // Show general services for non-authenticated users
                <>
                  <li>
                    <Link to="/doctors" className="text-gray-300 hover:text-white transition-colors">
                      Doctor Search
                    </Link>
                  </li>
                  <li>
                    <Link to="/register/patient" className="text-gray-300 hover:text-white transition-colors">
                      Patient Registration
                    </Link>
                  </li>
                  <li>
                    <Link to="/register/doctor" className="text-gray-300 hover:text-white transition-colors">
                      Doctor Registration
                    </Link>
                  </li>
                </>
              ) : user?.role === 'Patient' ? (
                // Show patient-specific services
                <>
                  <li>
                    <Link to="/doctors" className="text-gray-300 hover:text-white transition-colors">
                      Find Doctors
                    </Link>
                  </li>
                  <li>
                    <Link to="/patient/appointments" className="text-gray-300 hover:text-white transition-colors">
                      My Appointments
                    </Link>
                  </li>
                  <li>
                    <Link to="/patient/profile" className="text-gray-300 hover:text-white transition-colors">
                      My Profile
                    </Link>
                  </li>
                </>
              ) : user?.role === 'Doctor' ? (
                // Show doctor-specific services
                <>
                  <li>
                    <Link to="/doctor/appointments" className="text-gray-300 hover:text-white transition-colors">
                      My Appointments
                    </Link>
                  </li>
                  <li>
                    <Link to="/doctor/availability" className="text-gray-300 hover:text-white transition-colors">
                      Manage Availability
                    </Link>
                  </li>
                  <li>
                    <Link to="/doctor/profile" className="text-gray-300 hover:text-white transition-colors">
                      My Profile
                    </Link>
                  </li>
                </>
              ) : user?.role === 'Admin' ? (
                // Show admin services
                <>
                  <li>
                    <Link to="/admin" className="text-gray-300 hover:text-white transition-colors">
                      Admin Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/doctors" className="text-gray-300 hover:text-white transition-colors">
                      View Doctors
                    </Link>
                  </li>
                </>
              ) : null}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span className="text-gray-300">Connaught Place, New Delhi, India</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span className="text-gray-300">+91 11 1234 5678</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span className="text-gray-300">info@medicareindia.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2024 MediCare India. All rights reserved. Built with ❤️ for better healthcare in India.
          </p>
        </div>
      </div>
    </footer>
  )
}
