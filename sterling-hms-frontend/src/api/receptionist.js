import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:5000/api/receptionist',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('receptionistToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response errors with better logging
API.interceptors.response.use(
  (response) => {
    console.log('[API] Receptionist API response received:', response.status, response.data)
    return response.data
  },
  (error) => {
    console.error('[API] Receptionist API error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    })
    
    // Extract error message with fallback
    let message = 'An error occurred'
    
    if (error.response?.data?.message) {
      message = error.response.data.message
    } else if (error.response?.statusText) {
      message = error.response.statusText
    } else if (error.message) {
      message = error.message
    }
    
    console.error('[API] Final error message:', message)
    return Promise.reject(new Error(message))
  }
)

export default {
  // Authentication
  login(credentials) {
    return API.post('/login', credentials)
  },

  logout() {
    return API.post('/logout')
  },

  // Dashboard
  getDashboardStats() {
    return API.get('/dashboard/stats')
  },

  // Patient Management
  registerPatient(patientData) {
    return API.post('/patients/register', patientData)
  },

  getPatients(page = 1, limit = 10) {
    return API.get('/patients', {
      params: { page, limit },
    })
  },

  // Appointment Management
  bookAppointment(appointmentData) {
    return API.post('/appointments/book', appointmentData)
  },

  getPendingAppointments(page = 1, limit = 10) {
    return API.get('/appointments/pending', {
      params: { page, limit },
    })
  },

  approveAppointment(appointmentId) {
    return API.post(`/appointments/${appointmentId}/approve`)
  },

  rejectAppointment(appointmentId, reason) {
    return API.post(`/appointments/${appointmentId}/reject`, { reason })
  },
}
