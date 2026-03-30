import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import doctorAPI from '@/api/doctor'

export const useDoctorStore = defineStore('doctor', () => {
  const doctor = ref(null)
  const token = ref(localStorage.getItem('doctorToken') || null)
  const loading = ref(false)
  const error = ref('')

  // Doctor dashboard data
  const patients = ref([])
  const appointments = ref([])
  const dashboardStats = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const isDoctor = computed(() => !!doctor.value)

  // Login
  const login = async (email, password) => {
    loading.value = true
    error.value = ''
    
    console.log('[DOCTOR STORE] Starting login for:', email)
    
    try {
      const response = await doctorAPI.login(email, password)
      console.log('[DOCTOR STORE] Login response received:', response.status)
      console.log('[DOCTOR STORE] Response data:', response.data)
      
      // response is axios response, so response.data has the actual data
      const data = response.data
      
      if (!data || !data.token) {
        throw new Error('Invalid response: missing token')
      }
      
      token.value = data.token
      doctor.value = data.doctor
      
      console.log('[DOCTOR STORE] Token set:', !!token.value)
      console.log('[DOCTOR STORE] Doctor set:', !!doctor.value)
      console.log('[DOCTOR STORE] Doctor ID:', doctor.value?.id)
      console.log('[DOCTOR STORE] isAuthenticated computed:', !!token.value)
      
      localStorage.setItem('doctorToken', token.value)
      localStorage.setItem('doctor', JSON.stringify(doctor.value))
      
      console.log('[DOCTOR STORE] LocalStorage updated')
      console.log('[DOCTOR STORE] Token in localStorage:', !!localStorage.getItem('doctorToken'))
      
      const result = {
        success: true,
        message: data.message || 'Login successful',
        ...data,
        token: token.value,
        doctor: doctor.value
      }
      
      console.log('[DOCTOR STORE] Returning result:', result.success)
      return result
    } catch (err) {
      console.error('[DOCTOR STORE] Login error:', err.message)
      console.error('[DOCTOR STORE] Error response:', err.response?.data)
      error.value = err.response?.data?.message || err.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Logout
  const logout = async () => {
    try {
      // Call the logout API endpoint
      await doctorAPI.logout()
    } catch (err) {
      console.error('[DOCTOR STORE] Logout API error:', err.message)
      // Continue with logout even if API call fails
    } finally {
      // Clear local state
      token.value = null
      doctor.value = null
      patients.value = []
      appointments.value = []
      dashboardStats.value = null
      localStorage.removeItem('doctorToken')
      localStorage.removeItem('doctor')
    }
  }

  // Get assigned patients
  const getAssignedPatients = async () => {
    loading.value = true
    error.value = ''
    try {
      const response = await doctorAPI.getAssignedPatients()
      patients.value = response.data.patients
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch patients'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get appointments
  const getAppointments = async () => {
    loading.value = true
    error.value = ''
    try {
      const response = await doctorAPI.getAppointments()
      appointments.value = response.data.appointments
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch appointments'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId, status, notes = '') => {
    loading.value = true
    error.value = ''
    try {
      const response = await doctorAPI.updateAppointmentStatus(appointmentId, { status, notes })
      
      // Update local appointments list
      const index = appointments.value.findIndex(a => a.id === appointmentId)
      if (index !== -1) {
        appointments.value[index] = response.data.appointment
      }
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update appointment status'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get dashboard stats
  const getDashboardStats = async () => {
    loading.value = true
    error.value = ''
    try {
      const response = await doctorAPI.getDashboardStats()
      dashboardStats.value = response.data.stats
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch statistics'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get doctor profile
  const getProfile = async () => {
    try {
      const response = await doctorAPI.getProfile()
      doctor.value = response.data.doctor
      localStorage.setItem('doctor', JSON.stringify(doctor.value))
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch profile'
      throw err
    }
  }

  // Initialize auth from localStorage
  const initializeAuth = () => {
    const storedToken = localStorage.getItem('doctorToken')
    const storedDoctor = localStorage.getItem('doctor')

    if (storedToken) {
      token.value = storedToken
    }

    if (storedDoctor) {
      try {
        doctor.value = JSON.parse(storedDoctor)
      } catch (e) {
        console.error('Failed to parse doctor data:', e)
      }
    }
  }

  return {
    doctor,
    token,
    loading,
    error,
    patients,
    appointments,
    dashboardStats,
    isAuthenticated,
    isDoctor,
    login,
    logout,
    getAssignedPatients,
    getAppointments,
    updateAppointmentStatus,
    getDashboardStats,
    getProfile,
    initializeAuth,
  }
})
