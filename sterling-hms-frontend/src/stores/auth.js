import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authAPI from '@/api/auth'
import adminAPI from '@/api/admin'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const admin = ref(null)
  const token = ref(localStorage.getItem('authToken') || null)
  const userType = ref(localStorage.getItem('userType') || null) // 'patient' or 'admin'
  const loading = ref(false)
  const error = ref('')

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => userType.value === 'admin')

  const signup = async (firstName, lastName, email, password) => {
    loading.value = true
    error.value = ''
    try {
      const response = await authAPI.signup({
        firstName,
        lastName,
        email,
        password,
      })
      token.value = response.data.token
      user.value = response.data.user
      localStorage.setItem('authToken', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Sign up failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const signin = async (email, password) => {
    loading.value = true
    error.value = ''
    try {
      // Check if it's admin login
      if (email === 'adminsterling@gmail.com') {
        const response = await adminAPI.login(email, password)
        token.value = response.data.token
        admin.value = response.data.admin
        userType.value = 'admin'
        localStorage.setItem('authToken', token.value)
        localStorage.setItem('admin', JSON.stringify(admin.value))
        localStorage.setItem('userType', 'admin')
        return response.data
      } else {
        // Patient login
        const response = await authAPI.signin({ email, password })
        token.value = response.data.token
        user.value = response.data.user
        userType.value = 'patient'
        localStorage.setItem('authToken', token.value)
        localStorage.setItem('user', JSON.stringify(user.value))
        localStorage.setItem('userType', 'patient')
        return response.data
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Sign in failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    admin.value = null
    userType.value = null
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    localStorage.removeItem('admin')
    localStorage.removeItem('userType')
  }

  const getCurrentUser = async () => {
    try {
      const response = await authAPI.getCurrentUser()
      user.value = response.data.user
      return response.data.user
    } catch (err) {
      error.value = 'Failed to fetch user'
      throw err
    }
  }

  const initializeAuth = () => {
    const storedUserType = localStorage.getItem('userType')
    userType.value = storedUserType

    if (storedUserType === 'admin') {
      const storedAdmin = localStorage.getItem('admin')
      if (storedAdmin) {
        admin.value = JSON.parse(storedAdmin)
      }
    } else if (storedUserType === 'patient') {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        user.value = JSON.parse(storedUser)
      }
    }
  }

  return {
    user,
    admin,
    token,
    userType,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    signup,
    signin,
    logout,
    getCurrentUser,
    initializeAuth,
  }
})
