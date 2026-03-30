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

  // Patient Management Endpoints
  // List all patients with pagination and search
  listPatients: (token, page = 1, limit = 10, search = '') => {
    console.log('[ADMIN_API] Calling listPatients endpoint:', { page, limit, search })
    return axios.get(`${API_BASE_URL}/admin/patients`, {
      params: { page, limit, search },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(response => {
      console.log('[ADMIN_API] listPatients response received:', {
        total: response.data.data?.length,
        page: response.data.page
      })
      return response
    }).catch(error => {
      console.error('[ADMIN_API] listPatients error:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.message
      })
      throw error
    })
  },

  // Create a new patient
  createPatient: (token, patientData) => {
    console.log('[ADMIN_API] Calling createPatient endpoint')
    return axios.post(`${API_BASE_URL}/admin/patients`, patientData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(response => {
      console.log('[ADMIN_API] createPatient response received: Success')
      return response
    }).catch(error => {
      console.error('[ADMIN_API] createPatient error:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.message
      })
      throw error
    })
  },

  // Get a patient by ID
  getPatient: (token, patientId) => {
    console.log('[ADMIN_API] Calling getPatient endpoint:', { patientId })
    return axios.get(`${API_BASE_URL}/admin/patients/${patientId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(response => {
      console.log('[ADMIN_API] getPatient response received: Success')
      return response
    }).catch(error => {
      console.error('[ADMIN_API] getPatient error:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.message
      })
      throw error
    })
  },

  // Update patient information
  updatePatient: (token, patientId, patientData) => {
    console.log('[ADMIN_API] Calling updatePatient endpoint:', { patientId })
    return axios.put(`${API_BASE_URL}/admin/patients/${patientId}`, patientData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(response => {
      console.log('[ADMIN_API] updatePatient response received: Success')
      return response
    }).catch(error => {
      console.error('[ADMIN_API] updatePatient error:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.message
      })
      throw error
    })
  },

  // Toggle patient status (activate/deactivate)
  updatePatientStatus: (token, patientId, isActive) => {
    console.log('[ADMIN_API] Calling updatePatientStatus endpoint:', { patientId, isActive })
    return axios.patch(`${API_BASE_URL}/admin/patients/${patientId}/status`, { is_active: isActive }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(response => {
      console.log('[ADMIN_API] updatePatientStatus response received: Success')
      return response
    }).catch(error => {
      console.error('[ADMIN_API] updatePatientStatus error:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.message
      })
      throw error
    })
  },

  // Doctor Management Endpoints
  // List all doctors with pagination and search
  listDoctors: (token, page = 1, limit = 10, search = '') => {
    console.log('[ADMIN_API] Calling listDoctors endpoint:', { page, limit, search })
    return axios.get(`${API_BASE_URL}/admin/doctors`, {
      params: { page, limit, search },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(response => {
      console.log('[ADMIN_API] listDoctors response received:', {
        total: response.data.data?.length,
        page: response.data.page
      })
      return response
    }).catch(error => {
      console.error('[ADMIN_API] listDoctors error:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.message
      })
      throw error
    })
  },

  // Create a new doctor
  createDoctor: (token, doctorData) => {
    console.log('[ADMIN_API] Calling createDoctor endpoint')
    return axios.post(`${API_BASE_URL}/admin/doctors`, doctorData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(response => {
      console.log('[ADMIN_API] createDoctor response received: Success')
      return response
    }).catch(error => {
      console.error('[ADMIN_API] createDoctor error:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.message
      })
      throw error
    })
  },

  // Get a doctor by ID
  getDoctor: (token, doctorId) => {
    console.log('[ADMIN_API] Calling getDoctor endpoint:', { doctorId })
    return axios.get(`${API_BASE_URL}/admin/doctors/${doctorId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(response => {
      console.log('[ADMIN_API] getDoctor response received: Success')
      return response
    }).catch(error => {
      console.error('[ADMIN_API] getDoctor error:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.message
      })
      throw error
    })
  },

  // Update doctor information
  updateDoctor: (token, doctorId, doctorData) => {
    console.log('[ADMIN_API] Calling updateDoctor endpoint:', { doctorId })
    return axios.put(`${API_BASE_URL}/admin/doctors/${doctorId}`, doctorData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(response => {
      console.log('[ADMIN_API] updateDoctor response received: Success')
      return response
    }).catch(error => {
      console.error('[ADMIN_API] updateDoctor error:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.message
      })
      throw error
    })
  },

  // Toggle doctor status (activate/deactivate)
  updateDoctorStatus: (token, doctorId, isActive) => {
    console.log('[ADMIN_API] Calling updateDoctorStatus endpoint:', { doctorId, isActive })
    return axios.patch(`${API_BASE_URL}/admin/doctors/${doctorId}/status`, { is_active: isActive }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(response => {
      console.log('[ADMIN_API] updateDoctorStatus response received: Success')
      return response
    }).catch(error => {
      console.error('[ADMIN_API] updateDoctorStatus error:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.message
      })
      throw error
    })
  },

  // List all departments
  listDepartments: (token) => {
    console.log('[ADMIN_API] Calling listDepartments endpoint')
    return axios.get(`${API_BASE_URL}/admin/departments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(response => {
      console.log('[ADMIN_API] listDepartments response received: Success')
      return response
    }).catch(error => {
      console.error('[ADMIN_API] listDepartments error:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.message
      })
      throw error
    })
  },
}

export default adminAPI
