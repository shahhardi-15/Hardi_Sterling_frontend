import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

const doctorAPI = {
  // Get token from localStorage
  _getAuthHeaders() {
    const token = localStorage.getItem('doctorToken')
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  },

  // Login
  async login(email, password) {
    const response = await axios.post(`${API_BASE_URL}/auth/signin`, {
      email,
      password,
    })
    return response
  },

  // Get assigned patients
  async getAssignedPatients() {
    const response = await axios.get(`${API_BASE_URL}/doctor/patients`, {
      headers: this._getAuthHeaders(),
    })
    return response
  },

  // Get appointments
  async getAppointments() {
    const response = await axios.get(`${API_BASE_URL}/doctor/appointments`, {
      headers: this._getAuthHeaders(),
    })
    return response
  },

  // Update appointment status
  async updateAppointmentStatus(appointmentId, data) {
    const response = await axios.put(
      `${API_BASE_URL}/doctor/appointments/${appointmentId}/status`,
      data,
      {
        headers: this._getAuthHeaders(),
      }
    )
    return response
  },

  // Get dashboard stats
  async getDashboardStats() {
    const response = await axios.get(`${API_BASE_URL}/doctor/dashboard/stats`, {
      headers: this._getAuthHeaders(),
    })
    return response
  },

  // Get doctor profile
  async getProfile() {
    const response = await axios.get(`${API_BASE_URL}/doctor/profile`, {
      headers: this._getAuthHeaders(),
    })
    return response
  },
}

export default doctorAPI
