import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const adminAPI = {
  // Login endpoint
  login: (email, password) => {
    console.log('[ADMIN_API] Calling login endpoint:', `${API_BASE_URL}/admin/login`)
    return axios.post(`${API_BASE_URL}/admin/login`, {
      email,
      password,
    }).then(response => {
      console.log('[ADMIN_API] Login response received:', {
        success: response.data.success,
        token: response.data.token ? response.data.token.substring(0, 20) + '...' : 'null'
      })
      return response
    }).catch(error => {
      console.error('[ADMIN_API] Login error:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.message
      })
      throw error
    })
  },

  // Get dashboard statistics
  getDashboardStats: (token) => {
    console.log('[ADMIN_API] Calling getDashboardStats endpoint with token:', token ? token.substring(0, 20) + '...' : 'null')
    return axios.get(`${API_BASE_URL}/admin/dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(response => {
      console.log('[ADMIN_API] getDashboardStats response received:', {
        success: response.data.success,
        stats: response.data.stats
      })
      return response
    }).catch(error => {
      console.error('[ADMIN_API] getDashboardStats error:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.message
      })
      throw error
    })
  },

  // Logout endpoint
  logout: (token) => {
    console.log('[ADMIN_API] Calling logout endpoint')
    return axios.post(
      `${API_BASE_URL}/admin/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ).then(response => {
      console.log('[ADMIN_API] Logout response received')
      return response
    }).catch(error => {
      console.error('[ADMIN_API] Logout error:', error.message)
      throw error
    })
  },
}

export default adminAPI
