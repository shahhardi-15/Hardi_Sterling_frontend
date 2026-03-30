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
  <div class="modal-overlay" @click="handleCancel">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Register New Patient</h2>
        <button @click="handleCancel" class="close-btn">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- Success Toast -->
        <div v-if="showSuccessToast" class="toast success-toast">
          {{ toastMessage }}
        </div>

        <!-- Full Name -->
        <div class="form-group">
          <label>Full Name<span class="required">*</span></label>
          <input
            v-model="formData.full_name"
            type="text"
            class="form-input"
            :class="errors.full_name && 'input-error'"
            placeholder="Enter full name"
          />
          <p v-if="errors.full_name" class="error-message">{{ errors.full_name }}</p>
        </div>

        <!-- Email -->
        <div class="form-group">
          <label>Email<span class="required">*</span></label>
          <input
            v-model="formData.email"
            type="email"
            class="form-input"
            :class="errors.email && 'input-error'"
            placeholder="Enter email address"
          />
          <p v-if="errors.email" class="error-message">{{ errors.email }}</p>
        </div>

        <!-- Password -->
        <div class="form-group">
          <label>Password<span class="required">*</span></label>
          <input
            v-model="formData.password"
            type="password"
            class="form-input"
            :class="errors.password && 'input-error'"
            placeholder="Min 8 characters"
          />
          <p v-if="errors.password" class="error-message">{{ errors.password }}</p>
        </div>

        <!-- Gender -->
        <div class="form-group">
          <label>Gender<span class="required">*</span></label>
          <select
            v-model="formData.gender"
            class="form-input"
            :class="errors.gender && 'input-error'"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <p v-if="errors.gender" class="error-message">{{ errors.gender }}</p>
        </div>

        <!-- Date of Birth -->
        <div class="form-group">
          <label>Date of Birth<span class="required">*</span></label>
          <input
            v-model="formData.date_of_birth"
            type="date"
            class="form-input"
            :class="errors.date_of_birth && 'input-error'"
          />
          <p v-if="errors.date_of_birth" class="error-message">{{ errors.date_of_birth }}</p>
        </div>

        <!-- Phone Number -->
        <div class="form-group">
          <label>Phone Number<span class="required">*</span></label>
          <input
            :value="formData.phone"
            type="tel"
            class="form-input"
            :class="errors.phone && 'input-error'"
            placeholder="10 digit phone number"
            maxlength="10"
            @input="handlePhoneInput"
          />
          <p v-if="errors.phone" class="error-message">{{ errors.phone }}</p>
        </div>

        <!-- Address -->
        <div class="form-group">
          <label>Address</label>
          <textarea
            v-model="formData.address"
            class="form-textarea"
            placeholder="Enter address (optional)"
            rows="3"
          ></textarea>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="handleCancel" class="btn-secondary" :disabled="loading">
          Cancel
        </button>
        <button @click="handleSubmit" class="btn-primary" :disabled="loading">
          <span v-if="!loading">Register Patient</span>
          <span v-else>Registering...</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background-color: #f0f0f0;
  color: #333;
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.toast {
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 500;
  animation: slideIn 0.3s ease-out;
}

.success-toast {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #4caf50;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.required {
  color: #f44336;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #2196F3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.form-input.input-error,
.form-textarea.input-error {
  border-color: #f44336;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.error-message {
  color: #f44336;
  font-size: 12px;
  margin: 6px 0 0 0;
}

.modal-footer {
  padding: 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-secondary,
.btn-primary {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.btn-primary {
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
  transform: translateY(-2px);
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@animationslideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 600px) {
  .modal-content {
    width: 95%;
    max-height: 95vh;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }

  .modal-header h2 {
    font-size: 18px;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .btn-secondary,
  .btn-primary {
    width: 100%;
  }
}
</style>
