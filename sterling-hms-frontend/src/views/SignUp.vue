<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const agreeToTerms = ref(false)
const localError = ref('')
const success = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const validateForm = () => {
  if (!firstName.value.trim()) {
    localError.value = 'First name is required'
    return false
  }
  if (!lastName.value.trim()) {
    localError.value = 'Last name is required'
    return false
  }
  if (!email.value) {
    localError.value = 'Email is required'
    return false
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    localError.value = 'Please enter a valid email address'
    return false
  }
  if (!password.value) {
    localError.value = 'Password is required'
    return false
  }
  if (password.value.length < 8) {
    localError.value = 'Password must be at least 8 characters'
    return false
  }
  if (password.value !== confirmPassword.value) {
    localError.value = 'Passwords do not match'
    return false
  }
  if (!agreeToTerms.value) {
    localError.value = 'You must agree to the terms and conditions'
    return false
  }
  return true
}

const handleSignUp = async () => {
  localError.value = ''
  success.value = false

  if (!validateForm()) {
    return
  }

  try {
    await authStore.signup(
      firstName.value,
      lastName.value,
      email.value,
      password.value
    )
    
    success.value = true
    
    // Redirect to dashboard after successful signup
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  } catch (err) {
    localError.value = authStore.error || 'Sign up failed. Please try again.'
  }
}

const handleKeyPress = (e) => {
  if (e.key === 'Enter') {
    handleSignUp()
  }
}
</script>

<template>
  <div class="signup-page">
    <!-- Header -->
    <header class="signup-header">
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
    <main class="signup-content">
      <div class="signup-card">
        <h2 class="card-title">Create Account</h2>
        <p class="card-subtitle">Register as a patient to book appointments</p>

        <!-- Success Message -->
        <div v-if="success" class="alert alert-success">
          <svg class="alert-icon" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span>Account created successfully! Redirecting...</span>
        </div>

        <!-- Error Message -->
        <div v-if="localError" class="alert alert-danger">
          <svg class="alert-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <span>{{ localError }}</span>
        </div>

        <!-- Sign Up Form -->
        <form @submit.prevent="handleSignUp" class="form-group">
          <!-- Name Fields -->
          <div class="form-row">
            <!-- First Name -->
            <div class="form-field">
              <label for="firstName" class="form-label">First Name</label>
              <input
                id="firstName"
                v-model="firstName"
                type="text"
                :disabled="authStore.loading"
                required
                @keypress="handleKeyPress"
                class="form-input"
                placeholder="John"
              />
            </div>

            <!-- Last Name -->
            <div class="form-field">
              <label for="lastName" class="form-label">Last Name</label>
              <input
                id="lastName"
                v-model="lastName"
                type="text"
                :disabled="authStore.loading"
                required
                @keypress="handleKeyPress"
                class="form-input"
                placeholder="Doe"
              />
            </div>
          </div>

          <!-- Email Input -->
          <div class="form-field">
            <label for="email" class="form-label">Email Address</label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              :disabled="authStore.loading"
              required
              @keypress="handleKeyPress"
              class="form-input"
              placeholder="you@example.com"
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
                autocomplete="new-password"
                :disabled="authStore.loading"
                required
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
            <p class="form-hint">At least 8 characters</p>
          </div>

          <!-- Confirm Password Input -->
          <div class="form-field">
            <label for="confirmPassword" class="form-label">Confirm Password</label>
            <div class="password-input-wrapper">
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                autocomplete="new-password"
                :disabled="authStore.loading"
                required
                @keypress="handleKeyPress"
                class="form-input"
                placeholder="••••••••"
              />
              <button
                type="button"
                class="password-toggle-btn"
                @click="showConfirmPassword = !showConfirmPassword"
                :disabled="authStore.loading"
                :title="showConfirmPassword ? 'Hide password' : 'Show password'"
              >
                <svg v-if="showConfirmPassword" class="toggle-icon" fill="currentColor" viewBox="0 0 20 20">
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

          <!-- Terms & Conditions -->
          <div class="form-checkbox">
            <input
              id="agreeToTerms"
              v-model="agreeToTerms"
              type="checkbox"
              :disabled="authStore.loading"
              class="checkbox-input"
            />
            <label for="agreeToTerms" class="checkbox-label">
              I agree to the
              <a href="#" class="link">terms and conditions</a>
              and
              <a href="#" class="link">privacy policy</a>
            </label>
          </div>

          <!-- Sign Up Button -->
          <button
            type="submit"
            :disabled="authStore.loading"
            class="btn btn-primary btn-block"
          >
            <span v-if="!authStore.loading">Create Account</span>
            <span v-else class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Creating account...</span>
            </span>
          </button>
        </form>

        <!-- Divider -->
        <div class="divider">
          <span>Already have an account?</span>
        </div>

        <!-- Sign In Link -->
        <router-link to="/login" class="btn btn-secondary btn-block">
          Sign In
        </router-link>
      </div>
    </main>
  </div>
</template>

<style scoped>
.signup-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.signup-header {
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

.signup-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 110px);
  padding: 40px 20px;
}

.signup-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 40px;
  width: 100%;
  max-width: 480px;
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
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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

.form-checkbox {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-top: 10px;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #2196F3;
  flex-shrink: 0;
  margin-top: 4px;
}

.checkbox-label {
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.link {
  color: #2196F3;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.link:hover {
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
  margin-top: 12px;
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
  transform: translateY(-2px);
}

.btn-secondary {
  background: white;
  color: #2196F3;
  border: 2px solid #2196F3;
  margin-top: 12px;
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
  margin-bottom: 16px;
}

.alert-success {
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
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

.divider {
  position: relative;
  text-align: center;
  margin: 20px 0 16px;
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

/* Responsive Design */
@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .signup-card {
    padding: 24px;
  }

  .logo-section {
    justify-content: center;
  }
}
</style>
