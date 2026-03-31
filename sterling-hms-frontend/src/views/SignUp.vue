<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { BriefcaseIcon } from '@heroicons/vue/24/solid'

const router = useRouter()
const authStore = useAuthStore()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const agreeToTerms = ref(false)
const localError = ref('')
const success = ref(false)

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

const navigateToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="signup-page">
    <!-- Main Container -->
    <div class="main-container">
      <!-- Left Column - Marketing Content -->
      <div class="left-column">
        <!-- Logo Row -->
        <div class="logo-row">
          <div class="logo-icon-square">
            <BriefcaseIcon class="medical-icon" />
          </div>
          <div class="logo-text">Sterling</div>
        </div>

        <!-- Main Heading -->
        <div class="main-heading">
          <div class="heading-line-1">Begin Your Journey in</div>
          <div class="heading-line-2">Clinical Excellence.</div>
        </div>

        <!-- Description Text -->
        <p class="description-text">
          Join the premier network of healthcare professionals utilizing the most intuitive hospital management ecosystem.
        </p>

        <!-- Feature Cards -->
        <div class="feature-cards">
          <!-- Card 1 -->
          <div class="feature-card">
            <div class="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.72-7 8.77V12H5V6.3l7-3.11v8.8z"></path>
              </svg>
            </div>
            <div class="card-title">HIPAA Compliant</div>
            <div class="card-subtitle">Enterprise grade security standards.</div>
          </div>

          <!-- Card 2 -->
          <div class="feature-card">
            <div class="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"></path>
              </svg>
            </div>
            <div class="card-title">Real-time Data</div>
            <div class="card-subtitle">Instant clinical insights at scale.</div>
          </div>
        </div>
      </div>

      <!-- Right Column - Registration Form -->
      <div class="right-column">
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

        <!-- Heading -->
        <h1 class="form-heading">Create Account</h1>
        <p class="form-subtitle">Register to start managing your facility.</p>

        <!-- Registration Form -->
        <form @submit.prevent="handleSignUp" class="registration-form">
          <!-- First Name + Last Name Row -->
          <div class="form-row">
            <div class="form-field">
              <label for="firstName" class="field-label">FIRST NAME</label>
              <input
                id="firstName"
                v-model="firstName"
                type="text"
                :disabled="authStore.loading"
                required
                @keypress="handleKeyPress"
                class="field-input"
                placeholder="John"
              />
            </div>

            <div class="form-field">
              <label for="lastName" class="field-label">LAST NAME</label>
              <input
                id="lastName"
                v-model="lastName"
                type="text"
                :disabled="authStore.loading"
                required
                @keypress="handleKeyPress"
                class="field-input"
                placeholder="Doe"
              />
            </div>
          </div>

          <!-- Email Field -->
          <div class="form-field">
            <label for="email" class="field-label">EMAIL ID</label>
            <div class="input-with-icon">
              <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                id="email"
                v-model="email"
                type="email"
                autocomplete="email"
                :disabled="authStore.loading"
                required
                @keypress="handleKeyPress"
                class="field-input email-input"
                placeholder="doctor@sterling.hospital"
              />
            </div>
          </div>

          <!-- Password Field -->
          <div class="form-field">
            <label for="password" class="field-label">PASSWORD</label>
            <div class="input-with-icon">
              <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                :disabled="authStore.loading"
                required
                @keypress="handleKeyPress"
                class="field-input password-input"
                placeholder="••••••••••••"
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

          <!-- Confirm Password Field -->
          <div class="form-field">
            <label for="confirmPassword" class="field-label">CONFIRM PASSWORD</label>
            <div class="input-with-icon">
              <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                autocomplete="new-password"
                :disabled="authStore.loading"
                required
                @keypress="handleKeyPress"
                class="field-input password-input"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                class="password-toggle-btn"
                @click="showConfirmPassword = !showConfirmPassword"
                :disabled="authStore.loading"
                :title="showConfirmPassword ? 'Hide password' : 'Show password'"
              >
                {{ showConfirmPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
          </div>

          <!-- Terms Checkbox -->
          <div class="terms-checkbox-row">
            <input
              id="agreeToTerms"
              v-model="agreeToTerms"
              type="checkbox"
              :disabled="authStore.loading"
              class="checkbox-input"
            />
            <label for="agreeToTerms" class="checkbox-label">
              I agree to the
              <a href="#" class="term-link">Terms of Service</a>
              and
              <a href="#" class="term-link">Privacy Policy.</a>
            </label>
          </div>

          <!-- Register Button -->
          <button
            type="submit"
            :disabled="authStore.loading"
            class="btn-register"
          >
            <span v-if="!authStore.loading">Register Now →</span>
            <span v-else class="btn-loading">
              <svg class="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating account...
            </span>
          </button>

          <!-- Already Have Account -->
          <p class="already-have-account">Already have an account?</p>

          <!-- Sign In Button -->
          <button
            type="button"
            @click="navigateToLogin"
            class="btn-signin"
          >
            Sign In to Sterling
          </button>
        </form>
      </div>
    </div>

    <!-- Footer -->
    <footer class="page-footer">
      <div class="footer-left">
        © 2026 Sterling Clinical Excellence. All rights reserved.
      </div>
      <div class="footer-right">
        <a href="#" class="footer-link">Privacy Policy</a>
        <span class="footer-separator">|</span>
        <a href="#" class="footer-link">Terms of Service</a>
        <span class="footer-separator">|</span>
        <a href="#" class="footer-link">Help Center</a>
        <span class="footer-separator">|</span>
        <a href="#" class="footer-link">Contact</a>
      </div>
    </footer>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.signup-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F5F5F5;
}

.main-container {
  display: flex;
  flex: 1;
  min-height: calc(100vh - 64px);
}

/* Left Column */
.left-column {
  width: 55%;
  background-color: #EEF2F7;
  padding: 48px 56px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.logo-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 48px;
  margin-top: 0;
  padding-top: 0;
}

.logo-icon-square {
  width: 40px;
  height: 40px;
  background-color: #1B5E8F;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.medical-icon {
  width: 20px;
  height: 20px;
  color: white;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #1A2B4A;
}

.main-heading {
  margin-bottom: 20px;
  text-align: left;
}

.heading-line-1 {
  font-size: 42px;
  font-weight: 800;
  color: #1A2B4A;
  line-height: 1.15;
  margin-bottom: 0;
}

.heading-line-2 {
  font-size: 42px;
  font-weight: 800;
  color: #1B5E8F;
  line-height: 1.15;
}

.description-text {
  font-size: 15px;
  color: #4A5568;
  line-height: 1.7;
  margin: 0 0 48px 0;
  max-width: 85%;
  text-align: left;
}

.feature-cards {
  display: flex;
  gap: 16px;
}

.feature-card {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 20px;
  width: calc(50% - 8px);
  flex: 1;
}

.card-icon {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.card-icon svg {
  width: 22px;
  height: 22px;
  color: #1B5E8F;
}

.card-title {
  font-size: 14px;
  font-weight: 700;
  color: #1A2B4A;
  margin-bottom: 6px;
}

.card-subtitle {
  font-size: 12px;
  color: #718096;
  line-height: 1.5;
}

/* Right Column */
.right-column {
  width: 45%;
  background-color: #FFFFFF;
  padding: 56px 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
}

.form-heading {
  font-size: 32px;
  font-weight: 700;
  color: #1A2B4A;
  margin: 0 0 8px 0;
  text-align: left;
}

.form-subtitle {
  font-size: 14px;
  color: #718096;
  margin: 0 0 32px 0;
  text-align: left;
}

.registration-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: flex;
  flex-direction: row;
  gap: 16px;
  width: 100%;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
  width: 100%;
}

.field-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: #4A5568;
  margin: 0;
  text-align: left;
}

.field-input {
  height: 48px;
  background-color: #F7F9FC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 0 16px;
  font-size: 14px;
  color: #2D3748;
  transition: all 0.2s ease;
  outline: none;
}

.field-input::placeholder {
  color: #A0AEC0;
}

.field-input:focus {
  border-color: #1B5E8F;
  box-shadow: 0 0 0 3px rgba(27, 94, 143, 0.12);
  background-color: white;
}

.field-input:disabled {
  background-color: #F7F9FC;
  color: #A0AEC0;
  cursor: not-allowed;
}

.input-with-icon {
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
}

.email-input,
.password-input {
  padding-left: 44px;
  width: 100%;
}

.password-input {
  padding-right: 44px;
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

.terms-checkbox-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 20px 0 28px 0;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  border: 1px solid #CBD5E0;
  border-radius: 4px;
  cursor: pointer;
  appearance: none;
  background-color: white;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.checkbox-input:checked {
  background-color: #1B5E8F;
  border-color: #1B5E8F;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='white' d='M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 12px;
}

.checkbox-label {
  font-size: 13px;
  color: #4A5568;
  cursor: pointer;
  margin: 0;
}

.term-link {
  color: #1B5E8F;
  text-decoration: none;
  transition: text-decoration 0.2s ease;
}

.term-link:hover {
  text-decoration: underline;
}

.btn-register {
  width: 100%;
  height: 52px;
  background-color: #1B3A6B;
  color: white;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
}

.btn-register:hover:not(:disabled) {
  background-color: #152D54;
  transform: translateY(-1px);
}

.btn-register:active:not(:disabled) {
  transform: translateY(0px);
}

.btn-register:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.already-have-account {
  font-size: 13px;
  color: #718096;
  text-align: center;
  margin-bottom: 12px;
}

.btn-signin {
  width: fit-content;
  margin: 0 auto;
  display: block;
  height: 40px;
  padding: 0 28px;
  background-color: transparent;
  color: #1B3A6B;
  font-size: 14px;
  font-weight: 500;
  border: 1.5px solid #1B3A6B;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-signin:hover {
  background-color: #F0F4F8;
  transition: all 0.2s ease;
}

/* Alert Messages */
.alert {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
}

.alert-success {
  background-color: #F0FDF4;
  border: 1px solid #BBEF7D0;
  color: #166534;
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

/* Footer */
.page-footer {
  background-color: white;
  padding: 20px 40px;
  border-top: 1px solid #E0E6EE;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  flex-shrink: 0;
}

.footer-left {
  font-size: 13px;
  color: #718096;
  letter-spacing: 0.03em;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-link {
  font-size: 13px;
  color: #718096;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #1B5E8F;
}

.footer-separator {
  color: #E0E6EE;
  margin: 0 8px;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .left-column {
    padding: 48px 40px;
  }

  .right-column {
    padding: 48px 40px;
  }

  .description-text {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
  }

  .left-column {
    display: none;
    width: 100%;
  }

  .right-column {
    width: 100%;
    padding: 32px 24px;
    justify-content: flex-start;
    padding-top: 40px;
  }

  .form-heading {
    font-size: 28px;
  }

  .form-row {
    flex-direction: column;
  }

  .feature-cards {
    flex-direction: column;
  }

  .feature-card {
    width: 100%;
  }

  .page-footer {
    flex-direction: column;
    gap: 12px;
    padding: 16px 24px;
    height: auto;
  }

  .footer-right {
    flex-wrap: wrap;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .right-column {
    padding: 24px 16px;
  }

  .form-heading {
    font-size: 24px;
  }

  .form-subtitle {
    font-size: 13px;
  }

  .btn-register {
    height: 48px;
    font-size: 14px;
  }

  .page-footer {
    padding: 12px 16px;
  }

  .footer-left,
  .footer-right {
    font-size: 12px;
  }
}
</style>
