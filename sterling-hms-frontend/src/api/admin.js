import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const adminAPI = {
  // Login endpoint
  login: (email, password) => {
    return axios.post(`${API_BASE_URL}/admin/login`, {
      email,
      password,
    })
  },

  // Get dashboard statistics
  getDashboardStats: (token) => {
    return axios.get(`${API_BASE_URL}/admin/dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  // Logout endpoint
  logout: (token) => {
    return axios.post(
      `${API_BASE_URL}/admin/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
  },
}

export default adminAPI
