<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import adminAPI from '@/api/admin'

const authStore = useAuthStore()

const emit = defineEmits(['close', 'success'])

const loading = ref(false)
const showSuccessToast = ref(false)
const toastMessage = ref('')

const formData = reactive({
  full_name: '',
  email: '',
  password: '',
  gender: '',
  date_of_birth: '',
  phone: '',
  address: ''
})

const errors = reactive({
  full_name: '',
  email: '',
  password: '',
  gender: '',
  date_of_birth: '',
  phone: '',
  address: ''
})

const validateForm = () => {
  // Clear previous errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  let isValid = true

  // Full Name validation
  if (!formData.full_name.trim()) {
    errors.full_name = 'Full Name is required'
    isValid = false
  }

  // Email validation
  if (!formData.email.trim()) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email'
    isValid = false
  }

  // Password validation
  if (!formData.password) {
    errors.password = 'Password is required'
    isValid = false
  } else if (formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
    isValid = false
  }

  // Gender validation
  if (!formData.gender) {
    errors.gender = 'Gender is required'
    isValid = false
  }

  // Date of Birth validation
  if (!formData.date_of_birth) {
    errors.date_of_birth = 'Date of Birth is required'
    isValid = false
  }

  // Phone validation
  if (!formData.phone) {
    errors.phone = 'Phone Number is required'
    isValid = false
  } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
    errors.phone = 'Phone must be exactly 10 digits'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    // Prepare the payload
    const payload = {
      full_name: formData.full_name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      gender: formData.gender,
      date_of_birth: formData.date_of_birth,
      phone: formData.phone.replace(/\D/g, ''),
      address: formData.address.trim()
    }

    const response = await adminAPI.createPatient(authStore.token, payload)

    toastMessage.value = 'Patient registered successfully!'
    showSuccessToast.value = true

    setTimeout(() => {
      showSuccessToast.value = false
      emit('success')
    }, 2000)
  } catch (err) {
    console.error('Error registering patient:', err)

    if (err.response?.status === 409) {
      errors.email = 'This email is already registered'
    } else if (err.response?.status === 422) {
      // Handle validation errors from backend
      const backendErrors = err.response?.data?.errors || {}
      Object.keys(backendErrors).forEach(key => {
        if (errors.hasOwnProperty(key)) {
          errors[key] = backendErrors[key]
        }
      })
    } else {
      toastMessage.value = err.response?.data?.message || 'Something went wrong. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  emit('close')
}

const handlePhoneInput = (event) => {
  const value = event.target.value
  formData.phone = value.replace(/\D/g, '').slice(0, 10)
  if (formData.phone && formData.phone.length === 10) {
    errors.phone = ''
  }
}
</script>

<template>
  <div class="slide-panel-overlay" @click="handleCancel"></div>
  
  <div class="slide-panel" :class="{ 'slide-panel-open': true }">
    <!-- Panel Header -->
    <div class="panel-header">
      <div class="header-content">
        <h2 class="panel-title">Register New Patient</h2>
        <p class="panel-subtitle">Initialize a new medical file for entry.</p>
      </div>
      <button @click="handleCancel" class="close-btn">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <!-- Panel Body -->
    <div class="panel-body">
      <!-- Success Toast -->
      <div v-if="showSuccessToast" class="toast success-toast">
        {{ toastMessage }}
      </div>

      <!-- Full Name (Full Width) -->
      <div class="form-group full-width">
        <label class="form-label">FULL LEGAL NAME</label>
        <input
          v-model="formData.full_name"
          type="text"
          class="form-input"
          :class="{ 'input-error': errors.full_name }"
          placeholder="e.g. John Doe"
        />
        <p v-if="errors.full_name" class="error-message">{{ errors.full_name }}</p>
      </div>

      <!-- Gender + Date of Birth (Side by Side) -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">GENDER</label>
          <div class="select-wrapper">
            <select
              v-model="formData.gender"
              class="form-input"
              :class="{ 'input-error': errors.gender }"
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <svg class="select-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
          <p v-if="errors.gender" class="error-message">{{ errors.gender }}</p>
        </div>

        <div class="form-group">
          <label class="form-label">DATE OF BIRTH</label>
          <input
            v-model="formData.date_of_birth"
            type="date"
            class="form-input"
            :class="{ 'input-error': errors.date_of_birth }"
            placeholder="mm/dd/yyyy"
          />
          <p v-if="errors.date_of_birth" class="error-message">{{ errors.date_of_birth }}</p>
        </div>
      </div>

      <!-- Email (Full Width) -->
      <div class="form-group full-width">
        <label class="form-label">EMAIL ADDRESS</label>
        <input
          v-model="formData.email"
          type="email"
          class="form-input"
          :class="{ 'input-error': errors.email }"
          placeholder="john@example.com"
        />
        <p v-if="errors.email" class="error-message">{{ errors.email }}</p>
      </div>

      <!-- Phone Number + Access Password (Side by Side) -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">PHONE NUMBER</label>
          <input
            :value="formData.phone"
            type="tel"
            class="form-input"
            :class="{ 'input-error': errors.phone }"
            placeholder="+1 (555) 000-0000"
            maxlength="10"
            @input="handlePhoneInput"
          />
          <p v-if="errors.phone" class="error-message">{{ errors.phone }}</p>
        </div>

        <div class="form-group">
          <label class="form-label">ACCESS PASSWORD</label>
          <input
            v-model="formData.password"
            type="password"
            class="form-input"
            :class="{ 'input-error': errors.password }"
            placeholder="••••••••"
          />
          <p v-if="errors.password" class="error-message">{{ errors.password }}</p>
        </div>
      </div>

      <!-- Residential Address (Full Width) -->
      <div class="form-group full-width">
        <label class="form-label">RESIDENTIAL ADDRESS</label>
        <input
          v-model="formData.address"
          type="text"
          class="form-input"
          :class="{ 'input-error': errors.address }"
          placeholder="123 Medical Dr, Clinical Heights"
        />
      </div>

      <!-- Confirm Enrollment Button -->
      <button @click="handleSubmit" class="btn-confirm-enrollment" :disabled="loading">
        <span v-if="!loading">Confirm Enrollment →</span>
        <span v-else>Enrolling...</span>
      </button>

      <!-- Disclaimer Text -->
      <p class="disclaimer-text">
        By registering, you confirm clinical consent and data privacy standards.
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Slide Panel Overlay */
.slide-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 49;
  opacity: 1;
  transition: opacity 0.3s ease;
}

/* Slide Panel */
.slide-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 480px;
  height: 100vh;
  background: white;
  border-left: 1px solid #E2E8F0;
  border-radius: 12px 0 0 12px;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.08);
  z-index: 50;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  will-change: transform;
}

.slide-panel.slide-panel-open {
  transform: translateX(0);
}

/* Panel Header */
.panel-header {
  padding: 32px 28px;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-shrink: 0;
}

.header-content {
  flex: 1;
  margin-right: 16px;
  margin-bottom: 12px;
}

.panel-title {
  font-size: 22px;
  font-weight: 700;
  color: #1A2B4A;
  margin: 0 0 6px 0;
  padding: 0;
}

.panel-subtitle {
  font-size: 13px;
  color: #718096;
  margin: 0;
  padding: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #A0AEC0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
  flex-shrink: 0;
  padding: 0;
}

.close-btn:hover {
  background-color: #F7F9FC;
  color: #4A5568;
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

/* Panel Body */
.panel-body {
  padding: 40px 28px 32px 28px;
  overflow-y: auto;
  flex: 1;
  margin-top: 20px;
}

/* Toast */
.toast {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 500;
  animation: toastSlideIn 0.3s ease-out;
}

.success-toast {
  background-color: #DCFCE7;
  color: #166534;
  border: 1px solid #86EFAC;
}

@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Form Groups */
.form-group {
  margin-bottom: 20px;
  text-align: left;
}

.form-group.full-width {
  margin-bottom: 28px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #4A5568;
  text-transform: uppercase;
  margin-bottom: 8px;
  padding: 0;
  text-align: left;
}

/* Form Inputs */
.form-input {
  width: 100%;
  height: 44px;
  background: #F7F9FC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 0 14px;
  font-size: 14px;
  color: #2D3748;
  box-sizing: border-box;
  font-family: inherit;
  outline: none;
  transition: all 0.2s ease;
  appearance: none;
  text-align: left;
}

.form-input::placeholder {
  color: #A0AEC0;
}

.form-input:focus {
  border-color: #1B5E8F;
  box-shadow: 0 0 0 3px rgba(27, 94, 143, 0.12);
  background: white;
}

.form-input.input-error {
  border-color: #F56565;
}

.form-input.input-error:focus {
  box-shadow: 0 0 0 3px rgba(245, 101, 101, 0.12);
}

/* Select Wrapper for Chevron */
.select-wrapper {
  position: relative;
}

.select-chevron {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%) rotate(180deg);
  width: 18px;
  height: 18px;
  color: #A0AEC0;
  pointer-events: none;
  flex-shrink: 0;
}

select.form-input {
  padding-right: 40px;
}

/* Error Messages */
.error-message {
  color: #F56565;
  font-size: 12px;
  margin: 6px 0 0 0;
  padding: 0;
  text-align: left;
}

/* Confirm Enrollment Button */
.btn-confirm-enrollment {
  width: 100%;
  height: 52px;
  background: #1B3A6B;
  color: white;
  font-size: 15px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 16px;
  padding: 0;
}

.btn-confirm-enrollment:hover:not(:disabled) {
  background: #152D54;
  transform: translateY(-1px);
}

.btn-confirm-enrollment:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Disclaimer Text */
.disclaimer-text {
  font-size: 12px;
  color: #A0AEC0;
  text-align: center;
  line-height: 1.5;
  margin: 0;
  padding: 0;
}

@media (max-width: 768px) {
  .slide-panel {
    width: 100%;
  }
}

@media (max-width: 600px) {
  .slide-panel {
    width: 100%;
    border-radius: 0;
  }

  .panel-header {
    padding: 24px 20px;
  }

  .panel-body {
    padding: 0 20px 24px 20px;
  }

  .form-label {
    font-size: 10px;
  }

  .form-input {
    height: 40px;
    font-size: 13px;
    padding: 0 12px;
  }

  .btn-confirm-enrollment {
    height: 48px;
    font-size: 14px;
  }
}
</style>
