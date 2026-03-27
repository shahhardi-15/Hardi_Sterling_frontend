import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import adminAPI from '@/api/admin'

export const useAdminStore = defineStore('admin', () => {
  const admin = ref(null)
  const token = ref(localStorage.getItem('adminToken') || null)
  const loading = ref(false)
  const error = ref('')
  const stats = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  const loginAdmin = async (email, password) => {
    loading.value = true
    error.value = ''
    try {
      const response = await adminAPI.login(email, password)
      token.value = response.data.token
      admin.value = response.data.admin
      localStorage.setItem('adminToken', token.value)
      localStorage.setItem('admin', JSON.stringify(admin.value))
      return response.data
    } catch (err) {
      // Check for specific error messages
      if (err.response?.data?.message) {
        if (err.response.status === 401) {
          error.value = 'Invalid credentials'
        } else {
          error.value = err.response.data.message
        }
      } else {
        error.value = 'Login failed. Please try again.'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  const getDashboardStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats(token.value)
      stats.value = response.data.stats
      return response.data
    } catch (err) {
      error.value = 'Failed to fetch statistics'
      throw err
    }
  }

  const logout = async () => {
    try {
      await adminAPI.logout(token.value)
    } catch (err) {
      console.error('Error during logout:', err)
    } finally {
      token.value = null
      admin.value = null
      stats.value = null
      localStorage.removeItem('adminToken')
      localStorage.removeItem('admin')
    }
  }

  // Initialize admin data from localStorage if available
  const initializeFromStorage = () => {
    const storedAdmin = localStorage.getItem('admin')
    if (storedAdmin) {
      try {
        admin.value = JSON.parse(storedAdmin)
      } catch (err) {
        console.error('Error parsing stored admin:', err)
      }
    }
  }

  return {
    admin,
    token,
    loading,
    error,
    stats,
    isAuthenticated,
    loginAdmin,
    getDashboardStats,
    logout,
    initializeFromStorage,
  }
})
