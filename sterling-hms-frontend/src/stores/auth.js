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
        console.log('[AUTH_STORE] Admin login detected')
        const response = await adminAPI.login(email, password)
        console.log('[AUTH_STORE] Admin login response:', {
          token: response.data.token ? response.data.token.substring(0, 20) + '...' : 'null',
          admin: response.data.admin
        })
        token.value = response.data.token
        admin.value = response.data.admin
        userType.value = 'admin'
        localStorage.setItem('authToken', token.value)
        localStorage.setItem('admin', JSON.stringify(admin.value))
        localStorage.setItem('userType', 'admin')
        console.log('[AUTH_STORE] Admin data saved to localStorage and state')
        return response.data
      } else {
        console.log('[AUTH_STORE] Patient login detected')
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
      console.error('[AUTH_STORE] Signin error:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        error: err.message
      })
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
    console.log('[AUTH] Initializing auth...')
    
    // Restore token
    const storedToken = localStorage.getItem('authToken')
    if (storedToken) {
      token.value = storedToken
      console.log('[AUTH] Token restored from localStorage')
    }
    
    // Restore userType
    const storedUserType = localStorage.getItem('userType')
    if (storedUserType) {
      userType.value = storedUserType
      console.log('[AUTH] UserType restored:', storedUserType)
    }

    // Restore user data based on type
    if (storedUserType === 'admin') {
      const storedAdmin = localStorage.getItem('admin')
      if (storedAdmin) {
        try {
          admin.value = JSON.parse(storedAdmin)
          console.log('[AUTH] Admin data restored')
        } catch (e) {
          console.error('[AUTH] Failed to parse admin data:', e)
        }
      }
    } else if (storedUserType === 'patient') {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          user.value = JSON.parse(storedUser)
          console.log('[AUTH] User data restored')
        } catch (e) {
          console.error('[AUTH] Failed to parse user data:', e)
        }
      }
    }
    
    console.log('[AUTH] Auth initialization complete. isAdmin:', userType.value === 'admin', 'isAuthenticated:', !!token.value)
  }

  const restoreSession = () => {
    initializeAuth()
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
    restoreSession,
  }
})
