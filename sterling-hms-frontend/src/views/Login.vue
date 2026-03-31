<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useReceptionistStore } from '@/stores/receptionist'
import { useDoctorStore } from '@/stores/doctor'
import { BriefcaseIcon } from '@heroicons/vue/24/solid'
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

    // Patient/Admin login
    console.log('[HANDLER] Trying patient/admin login')
    try {
      const response = await authStore.signin(email.value, password.value)
      console.log('[HANDLER] Login success:', response)
      console.log('[HANDLER] authStore.token:', authStore.token)
      console.log('[HANDLER] authStore.userType:', authStore.userType)
      console.log('[HANDLER] authStore.isAuthenticated:', authStore.isAuthenticated)
      authStore.loading = false
      
      // Check user type and redirect accordingly
      if (authStore.userType === 'admin') {
        console.log('[HANDLER] Redirecting to /admin/dashboard')
        await router.push('/admin/dashboard')
        console.log('[HANDLER] Admin redirect completed')
      } else {
        console.log('[HANDLER] Redirecting to /dashboard')
        await router.push('/dashboard')
        console.log('[HANDLER] Patient redirect completed')
      }
      return
    } catch (err) {
      console.error('[HANDLER] Patient/Admin login failed:', err.message)
    }

    // Admin login (removed - handled by authStore.signin())
    // The admin login is now handled in authStore.signin() method

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
    <!-- SECTION 1: TOP NAVBAR -->
    <nav class="navbar">
      <div class="navbar-content">
        <span class="navbar-title">Sterling Hospital Management System</span>
      </div>
    </nav>

    <!-- SECTION 2: MAIN CONTENT -->
    <main class="main-content">
      <div class="main-card">
        <!-- LEFT PANEL -->
        <div class="card-left">
          <!-- TOP AREA -->
          <div class="left-top">
            <!-- Medical Icon -->
            <div class="medical-icon-box">
              <BriefcaseIcon class="medical-icon" />
            </div>

            <!-- Heading -->
            <h1 class="left-heading">
              Clinical Excellence<br />at Your Fingertips.
            </h1>

            <!-- Description -->
            <p class="left-description">
              Access the Sterling ecosystem with secure, high-performance administrative tools designed for modern healthcare professionals.
            </p>
          </div>

          <!-- BOTTOM AREA -->
          <div class="left-bottom">
            <div class="divider-line"></div>
            <div class="system-status">
              <svg class="status-icon" viewBox="0 0 24 24" fill="currentColor">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              <span class="status-text">SYSTEM STATUS: OPTIMAL</span>
            </div>
          </div>
        </div>

        <!-- RIGHT PANEL -->
        <div class="card-right">
          <!-- Heading -->
          <h2 class="right-heading">Welcome Back</h2>

          <!-- Subtitle -->
          <p class="right-subtitle">
            Please enter your credentials to access your dashboard.
          </p>

          <!-- Error Message -->
          <div v-if="localError" class="alert alert-danger">
            <svg class="alert-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <span>{{ localError }}</span>
          </div>

          <!-- Login Form -->
          <form @submit.prevent="handleLogin" class="login-form">
            <!-- EMAIL ID FIELD -->
            <div class="form-field">
              <div class="label-row">
                <label for="email" class="form-label">EMAIL ID</label>
              </div>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  autocomplete="email"
                  required
                  :disabled="authStore.loading"
                  class="form-input"
                  placeholder="doctor.name@sterling.com"
                  @keypress="handleKeyPress"
                />
              </div>
            </div>

            <!-- PASSWORD FIELD -->
            <div class="form-field">
              <div class="label-row">
                <label for="password" class="form-label">PASSWORD</label>
                <button
                  type="button"
                  @click="router.push('/forgot-password')"
                  class="forgot-password-link"
                >
                  Forgot Password?
                </button>
              </div>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
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
                  {{ showPassword ? 'Hide' : 'Show' }}
                </button>
              </div>
            </div>

            <!-- REMEMBER ME CHECKBOX -->
            <div class="remember-me-row">
              <label class="checkbox-label">
                <input
                  v-model="rememberMe"
                  type="checkbox"
                  :disabled="authStore.loading"
                  class="checkbox-input"
                />
                <span>Remember me</span>
              </label>
            </div>

            <!-- SIGN IN BUTTON -->
            <button
              type="submit"
              :disabled="authStore.loading"
              class="btn-sign-in"
            >
              <span v-if="!authStore.loading">Sign In to Sterling →</span>
              <span v-else class="loading-state">
                <svg class="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Signing in...</span>
              </span>
            </button>
          </form>

          <!-- CREATE ACCOUNT LINK -->
          <button
            type="button"
            @click="router.push('/signup')"
            class="create-account-link"
          >
            Create Account !
          </button>
        </div>
      </div>
    </main>

    <!-- SECTION 3: BOTTOM FOOTER -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-left">
          <p>© 2026 Sterling Clinical Excellence. All rights reserved.</p>
        </div>
        <div class="footer-right">
          <a href="#" class="footer-link">Privacy Policy</a>
          <a href="#" class="footer-link">Terms of Service</a>
          <a href="#" class="footer-link">Help Center</a>
          <a href="#" class="footer-link">Contact</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* ================================================================
   PAGE LAYOUT & BACKGROUND
   ================================================================ */

.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #EEF2F7;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

/* ================================================================
   SECTION 1: TOP NAVBAR
   ================================================================ */

.navbar {
  height: 60px;
  width: 100%;
  background-color: white;
  border-bottom: 1px solid #E0E6EE;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.navbar-content {
  max-width: 1200px;
  width: 100%;
  padding: 0 40px;
  display: flex;
  align-items: center;
  margin: 0 auto;
}

.navbar-title {
  font-size: 16px;
  font-weight: 600;
  color: #1B5E8F;
  letter-spacing: 0.02em;
}

/* ================================================================
   SECTION 2: MAIN CONTENT AREA
   ================================================================ */

.main-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  min-height: 0;
}

.main-card {
  width: 100%;
  max-width: 1060px;
  height: auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: row;
  overflow: hidden;
}

/* ================================================================
   LEFT PANEL (45% width)
   ================================================================ */

.card-left {
  width: 45%;
  background-color: #DAE6F2;
  padding: 48px 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.left-top {
  display: flex;
  flex-direction: column;
}

.medical-icon-box {
  width: 44px;
  height: 44px;
  background-color: #1B3A6B;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  flex-shrink: 0;
}

.medical-icon-box svg {
  width: 22px;
  height: 22px;
  color: white;
}

.left-heading {
  font-size: 32px;
  font-weight: 700;
  color: #1A2B4A;
  line-height: 1.25;
  margin: 0 0 16px 0;
  letter-spacing: -0.01em;
  text-align: left;
}

.left-description {
  font-size: 14px;
  font-weight: 400;
  color: #4A5568;
  line-height: 1.6;
  margin: 0;
  text-align: left;
}

.left-bottom {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.divider-line {
  width: 120px;
  height: 1px;
  background-color: #A0B4C8;
  margin-bottom: 16px;
}

.system-status {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #4A5568;
  text-transform: uppercase;
}

.status-icon {
  width: 16px;
  height: 16px;
  color: #4A5568;
  flex-shrink: 0;
}

.status-text {
  display: block;
}

/* ================================================================
   RIGHT PANEL (55% width)
   ================================================================ */

.card-right {
  width: 55%;
  background-color: #FFFFFF;
  padding: 56px 48px;
  display: flex;
  flex-direction: column;
}

.right-heading {
  font-size: 28px;
  font-weight: 700;
  color: #1A2B4A;
  margin: 0 0 8px 0;
  letter-spacing: -0.01em;
  text-align: left;
}

.right-subtitle {
  font-size: 14px;
  color: #718096;
  margin: 0 0 36px 0;
  line-height: 1.5;
  text-align: left;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ================================================================
   FORM ELEMENTS
   ================================================================ */

.form-field {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: #4A5568;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.label-row .form-label {
  margin: 0;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  overflow: visible;
}

.input-icon {
  position: absolute;
  left: 14px;
  width: 16px;
  height: 16px;
  color: #A0AEC0;
  pointer-events: none;
  flex-shrink: 0;
}

.form-input {
  width: 100%;
  height: 48px;
  background-color: #F7F9FC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding-left: 44px;
  padding-right: 44px;
  font-size: 14px;
  color: #2D3748;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input::placeholder {
  color: #A0AEC0;
}

.form-input:focus {
  border-color: #1B5E8F;
  box-shadow: 0 0 0 3px rgba(27, 94, 143, 0.12);
  background-color: white;
}

.form-input:disabled {
  background-color: #F7F9FC;
  color: #A0AEC0;
  cursor: not-allowed;
}

.password-toggle-btn {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: auto;
  height: auto;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1B5E8F;
  font-size: 12px;
  font-weight: 600;
  user-select: none;
  z-index: 1;
  overflow: visible;
  transition: color 0.2s ease;
  pointer-events: auto;
}

.password-toggle-btn:hover:not(:disabled) {
  color: #152D54;
}

.password-toggle-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* ================================================================
   REMEMBER ME & FORGOT PASSWORD
   ================================================================ */

.remember-me-row {
  margin-bottom: 32px;
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #4A5568;
  user-select: none;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  border: 1px solid #CBD5E0;
  border-radius: 4px;
  accent-color: #1B5E8F;
  appearance: none;
  -webkit-appearance: none;
  background-color: white;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.checkbox-input:checked {
  background-color: #1B5E8F;
  border-color: #1B5E8F;
}

.checkbox-input:checked::after {
  content: '✓';
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.forgot-password-link {
  background: none;
  border: none;
  color: #1B5E8F;
  cursor: pointer;
  font-size: 12px;
  font-weight: 400;
  text-decoration: none;
  transition: all 0.2s ease;
  padding: 0;
  letter-spacing: 0.02em;
}

.forgot-password-link:hover {
  text-decoration: underline;
}

.forgot-password-link:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* ================================================================
   SIGN IN BUTTON
   ================================================================ */

.btn-sign-in {
  width: 100%;
  height: 52px;
  background-color: #1B3A6B;
  color: white;
  font-size: 15px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  outline: none;
}

.btn-sign-in:hover:not(:disabled) {
  background-color: #152D54;
  transform: translateY(-1px);
}

.btn-sign-in:active:not(:disabled) {
  transform: translateY(0px);
}

.btn-sign-in:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.create-account-link {
  display: block;
  width: 100%;
  margin-top: 16px;
  padding: 0;
  background: none;
  border: none;
  color: #1B5E8F;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.create-account-link:hover {
  text-decoration: underline;
  color: #1B5E8F;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ================================================================
   ERROR ALERT
   ================================================================ */

.alert {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 24px;
}

.alert-danger {
  background-color: #FEE;
  border: 1px solid #FCC;
  color: #C33;
}

.alert-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

/* ================================================================
   SECTION 3: BOTTOM FOOTER
   ================================================================ */

.footer {
  width: 100%;
  background-color: white;
  border-top: 1px solid #E0E6EE;
  padding: 20px 40px;
  flex-shrink: 0;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-left {
  font-size: 13px;
  color: #718096;
  letter-spacing: 0.03em;
  margin: 0;
}

.footer-left p {
  margin: 0;
}

.footer-right {
  display: flex;
  gap: 24px;
  align-items: center;
}

.footer-link {
  font-size: 13px;
  color: #718096;
  text-decoration: none;
  letter-spacing: 0.03em;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #1B5E8F;
}

/* ================================================================
   RESPONSIVE DESIGN
   ================================================================ */

/* Tablet: 768px to 1024px */
@media (max-width: 1024px) {
  .main-card {
    max-width: 100%;
    margin: 0 24px;
  }

  .card-left {
    padding: 40px 32px;
  }

  .card-right {
    padding: 40px 32px;
  }

  .left-heading {
    font-size: 28px;
  }

  .left-description {
    font-size: 13px;
  }

  .right-heading {
    font-size: 24px;
  }

  .navbar-content,
  .footer-content {
    padding: 0 24px;
  }
}

/* Mobile: less than 768px */
@media (max-width: 767px) {
  .main-card {
    flex-direction: column;
    border-radius: 12px;
  }

  .card-left {
    display: none;
  }

  .card-right {
    width: 100%;
    padding: 32px 24px;
  }

  .main-content {
    padding: 20px 16px;
  }

  .navbar {
    height: 56px;
  }

  .navbar-content {
    padding: 0 16px;
  }

  .navbar-title {
    font-size: 14px;
  }

  .right-heading {
    font-size: 24px;
  }

  .right-subtitle {
    margin-bottom: 24px;
  }

  .form-field {
    margin-bottom: 16px;
  }

  .remember-me-row {
    margin-bottom: 20px;
  }

  .footer {
    padding: 16px 16px;
  }

  .footer-content {
    flex-direction: column;
    gap: 12px;
    text-align: center;
    padding: 0 16px;
  }

  .footer-right {
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
  }

  .footer-link {
    font-size: 12px;
  }
}

/* ================================================================
   UTILITY CLASSES
   ================================================================ */

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}
</style>
