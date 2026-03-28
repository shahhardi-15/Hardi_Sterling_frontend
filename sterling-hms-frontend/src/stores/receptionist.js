import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import receptionistAPI from '../api/receptionist'

export const useReceptionistStore = defineStore('receptionist', () => {
  // State
  const receptionist = ref(null)
  const token = ref(localStorage.getItem('receptionistToken') || '')
  const isAuthenticated = computed(() => !!token.value)
  const loading = ref(false)
  const error = ref(null)

  // Dashboard data
  const dashboardStats = ref(null)
  const patients = ref([])
  const pendingAppointments = ref([])
  const totalPatients = ref(0)
  const totalPendingAppointments = ref(0)

  // Login
  async function login(email, password) {
    loading.value = true
    error.value = null
    try {
      console.log('[STORE] Login called with email:', email)
      const response = await receptionistAPI.login({ email, password })
      console.log('[STORE] API response received:', response)
      
      // Validate response structure
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response format from API')
      }
      
      if (!response.token) {
        throw new Error('No token in response: ' + JSON.stringify(response))
      }
      
      if (!response.receptionist) {
        throw new Error('No receptionist data in response: ' + JSON.stringify(response))
      }
      
      console.log('[STORE] Setting receptionist:', response.receptionist)
      console.log('[STORE] Setting token:', response.token.substring(0, 20) + '...')
      
      receptionist.value = response.receptionist
      token.value = response.token
      
      console.log('[STORE] Saving to localStorage')
      localStorage.setItem('receptionistToken', response.token)
      localStorage.setItem('receptionist', JSON.stringify(response.receptionist))
      
      console.log('[STORE] Login successful, isAuthenticated:', !!token.value)
      return response
    } catch (err) {
      console.error('[STORE] Login error:', err.message)
      error.value = err.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Logout
  function logout() {
    receptionist.value = null
    token.value = ''
    localStorage.removeItem('receptionistToken')
    localStorage.removeItem('receptionist')
    patients.value = []
    pendingAppointments.value = []
    dashboardStats.value = null
  }

  // Get dashboard stats
  async function getDashboardStats() {
    loading.value = true
    error.value = null
    try {
      const response = await receptionistAPI.getDashboardStats()
      dashboardStats.value = response.stats
      return response.stats
    } catch (err) {
      error.value = err.message || 'Failed to fetch dashboard stats'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Register patient
  async function registerPatient(patientData) {
    loading.value = true
    error.value = null
    try {
      const response = await receptionistAPI.registerPatient(patientData)
      return response
    } catch (err) {
      error.value = err.message || 'Failed to register patient'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get patient records
  async function getPatients(page = 1, limit = 10) {
    loading.value = true
    error.value = null
    try {
      const response = await receptionistAPI.getPatients(page, limit)
      patients.value = response.patients
      totalPatients.value = response.total
      return response
    } catch (err) {
      error.value = err.message || 'Failed to fetch patients'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Book appointment for patient
  async function bookAppointment(appointmentData) {
    loading.value = true
    error.value = null
    try {
      const response = await receptionistAPI.bookAppointment(appointmentData)
      return response
    } catch (err) {
      error.value = err.message || 'Failed to book appointment'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get pending appointments
  async function getPendingAppointments(page = 1, limit = 10) {
    loading.value = true
    error.value = null
    try {
      const response = await receptionistAPI.getPendingAppointments(page, limit)
      pendingAppointments.value = response.appointments
      totalPendingAppointments.value = response.total
      return response
    } catch (err) {
      error.value = err.message || 'Failed to fetch pending appointments'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Approve appointment
  async function approveAppointment(appointmentId) {
    loading.value = true
    error.value = null
    try {
      const response = await receptionistAPI.approveAppointment(appointmentId)
      // Refresh pending appointments
      await getPendingAppointments()
      return response
    } catch (err) {
      error.value = err.message || 'Failed to approve appointment'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Reject appointment
  async function rejectAppointment(appointmentId, reason) {
    loading.value = true
    error.value = null
    try {
      const response = await receptionistAPI.rejectAppointment(appointmentId, reason)
      // Refresh pending appointments
      await getPendingAppointments()
      return response
    } catch (err) {
      error.value = err.message || 'Failed to reject appointment'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Restore session from localStorage
  function restoreSession() {
    console.log('[RECEPTIONIST] Restoring session...')
    
    const storedToken = localStorage.getItem('receptionistToken')
    const storedReceptionist = localStorage.getItem('receptionist')

    if (storedToken) {
      token.value = storedToken
      console.log('[RECEPTIONIST] Token restored')
    }
    
    if (storedReceptionist) {
      try {
        receptionist.value = JSON.parse(storedReceptionist)
        console.log('[RECEPTIONIST] Receptionist data restored')
      } catch (e) {
        console.error('[RECEPTIONIST] Failed to parse receptionist data:', e)
        localStorage.removeItem('receptionist')
      }
    }
    
    console.log('[RECEPTIONIST] Session restored. isAuthenticated:', !!token.value)
  }

  // Clear error
  function clearError() {
    error.value = null
  }

  return {
    // State
    receptionist,
    token,
    isAuthenticated,
    loading,
    error,
    dashboardStats,
    patients,
    pendingAppointments,
    totalPatients,
    totalPendingAppointments,

    // Actions
    login,
    logout,
    getDashboardStats,
    registerPatient,
    getPatients,
    bookAppointment,
    getPendingAppointments,
    approveAppointment,
    rejectAppointment,
    restoreSession,
    clearError,
  }
})
