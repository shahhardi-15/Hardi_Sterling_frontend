<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useReceptionistStore } from '@/stores/receptionist'
import { useDoctorStore } from '@/stores/doctor'
import adminAPI from '@/api/admin'

console.log('[LOGIN.VUE] Initializing...')

const router = useRouter()
const authStore = useAuthStore()
const receptionistStore = useReceptionistStore()
const doctorStore = useDoctorStore()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const localError = ref('')
const showPassword = ref(false)

console.log('[LOGIN.VUE] Setup complete')

const handleLogin = async (e) => {
  console.log('[HANDLER] handleLogin called!')
  console.log('[HANDLER] Event:', e)
  
  e?.preventDefault?.()
  
  localError.value = ''
  
  if (!email.value || !password.value) {
    localError.value = 'Please fill in all fields'
    console.log('[HANDLER] Missing fields')
    return
  }

  console.log('[HANDLER] Attempting login for:', email.value)
  authStore.loading = true

  try {
    // Receptionist login
    if (email.value === 'receptionist@sterling.com' || email.value.includes('receptionist')) {
      console.log('[HANDLER] Trying receptionist login')
      try {
        const response = await receptionistStore.login(email.value, password.value)
        console.log('[HANDLER] Receptionist login success:', response)
        console.log('[HANDLER] receptionistStore.token:', receptionistStore.token)
        console.log('[HANDLER] receptionistStore.isAuthenticated:', receptionistStore.isAuthenticated)
        authStore.loading = false
        console.log('[HANDLER] Redirecting to /receptionist/dashboard')
        await router.push('/receptionist/dashboard')
        console.log('[HANDLER] Receptionist redirect completed')
        return
      } catch (err) {
        console.error('[HANDLER] Receptionist login failed:', err.message)
      }
    }

    // Doctor login attempt
    console.log('[HANDLER] Trying doctor login')
    try {
      const response = await doctorStore.login(email.value, password.value)
      console.log('[HANDLER] Doctor API response received')
      console.log('[HANDLER] Response data:', response)
      
      // Check the response object returned from doctorStore.login()
      if (response && response.success === true) {
        console.log('[HANDLER] Doctor login success! Token:', !!response.token)
        console.log('[HANDLER] Doctor data:', response.doctor?.name)
        console.log('[HANDLER] doctorStore.token after login:', doctorStore.token)
        console.log('[HANDLER] doctorStore.isAuthenticated after login:', doctorStore.isAuthenticated)
        
        authStore.loading = false
        console.log('[HANDLER] About to redirect to /doctor/dashboard')
        
        try {
          await router.push('/doctor/dashboard')
          console.log('[HANDLER] Doctor redirect completed')
          return
        } catch (pushErr) {
          console.error('[HANDLER] Router push failed:', pushErr.message)
          // Fallback redirect
          window.location.href = '/doctor/dashboard'
          return
        }
      } else {
        console.log('[HANDLER] Doctor login response incomplete:', response)
        console.log('[HANDLER] response.success:', response?.success)
        console.log('[HANDLER] response.token:', !!response?.token)
        console.log('[HANDLER] response.doctor:', !!response?.doctor)
      }
    } catch (err) {
      console.error('[HANDLER] Doctor login failed:', err.message)
      console.error('[HANDLER] Error status:', err.response?.status)
      console.error('[HANDLER] Error data:', err.response?.data)
      // Continue to try other login methods
    }

    // Patient login
    console.log('[HANDLER] Trying patient login')
    try {
      const response = await authStore.signin(email.value, password.value)
      console.log('[HANDLER] Patient login success:', response)
      console.log('[HANDLER] authStore.token:', authStore.token)
      console.log('[HANDLER] authStore.isAuthenticated:', authStore.isAuthenticated)
      authStore.loading = false
      console.log('[HANDLER] Redirecting to /dashboard')
      await router.push('/dashboard')
      console.log('[HANDLER] Patient redirect completed')
      return
    } catch (err) {
      console.error('[HANDLER] Patient login failed:', err.message)
    }

    // Admin login
    console.log('[HANDLER] Trying admin login')
    try {
      console.log('[HANDLER] Calling adminAPI.login()')
      const adminResponse = await adminAPI.login(email.value, password.value)
      console.log('[HANDLER] Admin API response received:', adminResponse)
      console.log('[HANDLER] Response data:', adminResponse.data)
      
      console.log('[HANDLER] Setting authStore values')
      authStore.token = adminResponse.data.token
      authStore.admin = adminResponse.data.admin
      authStore.userType = 'admin'
      
      console.log('[HANDLER] Saving to localStorage')
      localStorage.setItem('authToken', adminResponse.data.token)
      localStorage.setItem('admin', JSON.stringify(adminResponse.data.admin))
      localStorage.setItem('userType', 'admin')
      
      console.log('[HANDLER] AuthStore state after setting:')
      console.log('  token:', !!authStore.token)
      console.log('  isAdmin:', authStore.isAdmin)
      console.log('  isAuthenticated:', authStore.isAuthenticated)
      console.log('  userType:', authStore.userType)
      
      authStore.loading = false
      
      console.log('[HANDLER] About to redirect to /admin/dashboard')
      try {
        await router.push('/admin/dashboard')
        console.log('[HANDLER] Admin redirect completed successfully')
      } catch (pushErr) {
        console.error('[HANDLER] Router.push error:', pushErr)
        // Fallback: try location redirect
        console.log('[HANDLER] Trying fallback location redirect')
        window.location.href = '/admin/dashboard'
      }
      return
    } catch (err) {
      console.error('[HANDLER] Admin login failed:', err.message)
      console.error('[HANDLER] Admin error details:', err)
    }

    localError.value = 'Invalid email or password'
  } catch (err) {
    console.error('[HANDLER] Unexpected error:', err)
    localError.value = err.message || 'Login failed'
  } finally {
    authStore.loading = false
  }
}

const handleKeyPress = (e) => {
  if (e.key === 'Enter') {
    console.log('[HANDLER] Enter key pressed')
    handleLogin(e)
  }
}

console.log('[LOGIN.VUE] Script setup complete')
</script>

<template>
  <div class="login-page">
    <!-- Header -->
    <header class="login-header">
      <div class="header-content">
        <div class="logo-section">
          <span class="logo-icon">🏥</span>
          <div>
            <h1>Sterling HMS</h1>
            <p class="subtitle">Hospital Management System</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="login-content">
      <div class="login-card">
        <h2 class="card-title">Welcome Back</h2>
        <p class="card-subtitle">Sign in to your account</p>

        <!-- Error Message -->
        <div v-if="localError" class="alert alert-danger">
          <svg class="alert-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <span>{{ localError }}</span>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="form-group">
          <!-- Email Input -->
          <div class="form-field">
            <label for="email" class="form-label">Email Address</label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              required
              :disabled="authStore.loading"
              class="form-input"
              placeholder="you@example.com"
              @keypress="handleKeyPress"
            />
          </div>

          <!-- Password Input -->
          <div class="form-field">
            <label for="password" class="form-label">Password</label>
            <div class="password-input-wrapper">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                :disabled="authStore.loading"
                class="form-input"
                placeholder="••••••••"
                @keypress="handleKeyPress"
              />
              <button
                type="button"
                class="password-toggle-btn"
                @click="showPassword = !showPassword"
                :disabled="authStore.loading"
                :title="showPassword ? 'Hide password' : 'Show password'"
              >
                <svg v-if="showPassword" class="toggle-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path>
                </svg>
                <svg v-else class="toggle-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd"></path>
                  <path d="M15.171 13.576l1.414 1.414A10.025 10.025 0 0020 10c-1.274-4.057-5.064-7-9.542-7a9.97 9.97 0 00-3.516.618l2.049 2.049a4 4 0 015.514 5.515z"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="form-options">
            <label class="checkbox-label">
              <input
                v-model="rememberMe"
                type="checkbox"
                :disabled="authStore.loading"
                class="checkbox-input"
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              @click="router.push('/forgot-password')"
              class="forgot-password-link"
            >
              Forgot password?
            </button>
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="authStore.loading"
            class="btn btn-primary btn-block"
          >
            <span v-if="!authStore.loading">Sign In</span>
            <span v-else class="flex items-center justify-center space-x-2">
              <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Signing in...</span>
            </span>
          </button>
        </form>

        <!-- Demo Credentials Info -->
        <div class="demo-credentials">
          <p class="demo-title">📋 Demo Credentials - Try all roles:</p>
          <div class="credentials-list">
            <div class="credential-item">
              <strong>👤 Patient</strong>
              <span>Email: patient1@example.com | Password: password123</span>
            </div>
            <div class="credential-item">
              <strong>🩺 Doctor</strong>
              <span>Email: testpat@example.com | Password: TestPass@123</span>
            </div>
            <div class="credential-item">
              <strong>👨‍⚕️ Receptionist</strong>
              <span>Email: receptionist@sterling.com | Password: Receptionist@Sterling2026</span>
            </div>
            <div class="credential-item">
              <strong>🔐 Admin</strong>
              <span>Email: adminsterling@gmail.com | Password: admin@123</span>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="divider">
          <span>Need an account?</span>
        </div>

        <!-- Sign Up Link -->
        <router-link to="/signup" class="btn btn-secondary btn-block">
          Create Account
        </router-link>
      </div>
    </main>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.login-header {
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  color: white;
  padding: 30px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo-icon {
  font-size: 32px;
}

.logo-section h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: white;
}

.subtitle {
  font-size: 14px;
  margin: 5px 0 0 0;
  opacity: 0.9;
}

.login-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 110px);
  padding: 40px 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 40px;
  width: 100%;
  max-width: 420px;
}

.card-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  text-align: center;
}

.card-subtitle {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin: 0 0 24px 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-input {
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  outline: none;
}

.form-input:focus {
  border-color: #2196F3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.form-input:disabled {
  background-color: #f5f5f5;
  color: #999;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  margin-top: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #666;
  user-select: none;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #2196F3;
}

.forgot-password-link {
  background: none;
  border: none;
  color: #2196F3;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.3s ease;
  padding: 0;
}

.forgot-password-link:hover {
  color: #1976D2;
  text-decoration: underline;
}

.btn {
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  outline: none;
  box-sizing: border-box;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  color: white;
  margin-top: 20px;
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
  transform: translateY(-2px);
}

.btn-secondary {
  background: white;
  color: #2196F3;
  border: 2px solid #2196F3;
  margin-top: 16px;
}

.btn-secondary:hover:not(:disabled) {
  background: #f0f7ff;
}

.btn-block {
  width: 100%;
}

.alert {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
}

.alert-danger {
  background-color: #fee;
  border: 1px solid #fcc;
  color: #c33;
}

.alert-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.demo-credentials {
  background: #f0f7ff;
  border: 1px solid #d0e8ff;
  border-radius: 8px;
  padding: 16px;
  margin-top: 24px;
  font-size: 13px;
}

.demo-title {
  font-weight: 600;
  color: #2196F3;
  margin: 0 0 12px 0;
}

.credentials-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.credential-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #555;
}

.credential-item strong {
  color: #333;
}

.divider {
  position: relative;
  text-align: center;
  margin: 24px 0 16px;
  font-size: 14px;
  color: #999;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #ddd;
}

.divider span {
  position: relative;
  background: white;
  padding: 0 12px;
  display: inline-block;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}

.password-input-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.password-input-wrapper .form-input {
  width: 100%;
  padding-right: 44px;
  box-sizing: border-box;
}

.password-toggle-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: color 0.3s ease;
  pointer-events: auto;
}

.password-toggle-btn:hover:not(:disabled) {
  color: #2196F3;
}

.password-toggle-btn:disabled {
  cursor: not-allowed;
  color: #ccc;
}

.toggle-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
</style>
