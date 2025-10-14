import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Stethoscope, 
  Calendar, 
  Users, 
  Clock, 
  Shield, 
  Heart,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export const HomePage = () => {
  const { isAuthenticated, user } = useAuth()

  const features = [
    {
      icon: <Stethoscope className="w-8 h-8" />,
      title: "Find Doctors",
      description: "Search and connect with verified healthcare professionals in your area."
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Easy Booking",
      description: "Book appointments online with real-time availability and instant confirmation."
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "24/7 Access",
      description: "Manage your appointments and health records anytime, anywhere."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Private",
      description: "Your health information is protected with enterprise-grade security."
    }
  ]

  const stats = [
    { number: "1000+", label: "Verified Doctors" },
    { number: "50K+", label: "Happy Patients" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Health is wealth
              </h1>
              <p className="text-xl mb-8 text-primary-100">
                Connect with India's finest doctors and healthcare professionals. 
                Quality healthcare made accessible across the country.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/doctors" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                  Find Doctors
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                {!isAuthenticated() && (
                  <Link to="/register" className="btn-secondary border-white text-white hover:bg-white hover:text-primary-600">
                    Get Started
                  </Link>
                )}
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-3xl font-bold text-white">{stat.number}</div>
                      <div className="text-primary-200">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Why Choose MediCare India?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make healthcare accessible, convenient, and reliable for every Indian.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                <div className="text-primary-600 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in just a few simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Sign Up
              </h3>
              <p className="text-gray-600">
                Create your account as a patient or doctor
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Find & Book
              </h3>
              <p className="text-gray-600">
                Search for doctors and book appointments
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Get Care
              </h3>
              <p className="text-gray-600">
                Attend your appointment and get quality care
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated() && (
        <section className="py-20 bg-primary-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 text-primary-100">
              Join thousands of patients and doctors who trust MediCare India
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                Sign Up as Patient
              </Link>
              <Link to="/register/doctor" className="btn-secondary border-white text-white hover:bg-white hover:text-primary-600">
                Sign Up as Doctor
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <section className="py-16 bg-gray-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Have Questions?
          </h2>
          <p className="text-gray-300 mb-8">
            Our support team is here to help you 24/7
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:support@doctorapp.com" className="btn-primary">
              Contact Support
            </a>
            <a href="tel:+15551234567" className="btn-secondary border-white text-white hover:bg-white hover:text-gray-800">
              Call Us
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
