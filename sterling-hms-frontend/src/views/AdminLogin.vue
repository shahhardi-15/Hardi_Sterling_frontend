<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const localError = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
  localError.value = ''

  if (!email.value || !password.value) {
    localError.value = 'Please fill in all fields'
    return
  }

  // Validate that email matches admin email format
  if (email.value !== 'adminsterling@gmail.com') {
    localError.value = 'Invalid email. Only admin can login'
    return
  }

  try {
    console.log('[ADMIN_LOGIN] Attempting login with email:', email.value)
    const result = await authStore.signin(email.value, password.value)
    console.log('[ADMIN_LOGIN] Login successful')
    console.log('[ADMIN_LOGIN] Auth store state after login:', {
      token: authStore.token ? authStore.token.substring(0, 20) + '...' : 'null',
      userType: authStore.userType,
      isAdmin: authStore.isAdmin,
      isAuthenticated: authStore.isAuthenticated
    })
    console.log('[ADMIN_LOGIN] localStorage state:', {
      authToken: localStorage.getItem('authToken') ? localStorage.getItem('authToken').substring(0, 20) + '...' : 'null',
      userType: localStorage.getItem('userType'),
      admin: localStorage.getItem('admin') ? 'present' : 'null'
    })
    // Redirect to admin dashboard after successful login
    await router.push('/admin/dashboard')
  } catch (err) {
    console.error('[ADMIN_LOGIN] Login error:', err)
    localError.value = authStore.error || 'Incorrect password'
  }
}

const handleKeyPress = (e) => {
  if (e.key === 'Enter') {
    handleLogin()
  }
}
</script>

<template>
  <div class="admin-login-page">
    <!-- Header -->
    <header class="login-header">
      <div class="header-content">
        <div class="logo-section">
          <span class="logo-icon">🔐</span>
          <div>
            <h1>Sterling HMS</h1>
            <p class="subtitle">Admin Portal</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="login-content">
      <div class="login-card">
        <h2 class="card-title">Admin Login</h2>
        <p class="card-subtitle">Restricted to authorized administrators</p>

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
            <label for="email" class="form-label">Admin Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              required
              :disabled="authStore.loading"
              @keypress="handleKeyPress"
              class="form-input"
              placeholder="adminsterling@gmail.com"
            />
            <p class="form-hint">Admin access only</p>
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
                @keypress="handleKeyPress"
                class="form-input"
                placeholder="••••••••"
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

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="authStore.loading"
            class="btn btn-primary btn-block"
          >
            <span v-if="!authStore.loading">Sign In as Admin</span>
            <span v-else class="flex items-center justify-center space-x-2">
              <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Signing in...</span>
            </span>
          </button>
        </form>

        <!-- Security Info Box -->
        <div class="security-box">
          <p class="security-title">🔒 Security Notice</p>
          <ul class="security-list">
            <li>This portal is restricted to authorized administrators</li>
            <li>All admin actions are logged for audit purposes</li>
            <li>Session timeout after 24 hours of inactivity</li>
          </ul>
        </div>

        <!-- Divider -->
        <div class="divider">
          <span>Other access options</span>
        </div>

        <!-- Patient Login Link -->
        <router-link to="/login" class="btn btn-secondary btn-block">
          Back to Patient Login
        </router-link>
      </div>
    </main>
  </div>
</template>

<style scoped>
.admin-login-page {
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

.form-hint {
  font-size: 12px;
  color: #999;
  margin: 0;
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

.security-box {
  background: #f0f7ff;
  border: 1px solid #d0e8ff;
  border-radius: 8px;
  padding: 16px;
  margin-top: 24px;
  font-size: 13px;
}

.security-title {
  font-weight: 600;
  color: #2196F3;
  margin: 0 0 12px 0;
}

.security-list {
  list-style: disc;
  list-style-position: inside;
  color: #555;
  margin: 0;
  padding: 0;
}

.security-list li {
  margin-bottom: 8px;
}

.security-list li:last-child {
  margin-bottom: 0;
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
  overflow: visible;
}

.password-input-wrapper .form-input {
  width: 100%;
  padding-right: 44px;
  box-sizing: border-box;
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
  transition: color 0.3s ease;
  pointer-events: auto;
}

.password-toggle-btn:hover:not(:disabled) {
  color: #152D54;
}

.password-toggle-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.toggle-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
</style>
