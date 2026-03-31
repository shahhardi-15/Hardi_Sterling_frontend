<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import adminAPI from '@/api/admin'

const authStore = useAuthStore()

const emit = defineEmits(['close', 'success'])

const loading = ref(false)
const departments = ref([])
const departmentsLoading = ref(false)
const showSuccessToast = ref(false)
const toastMessage = ref('')

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const formData = reactive({
  full_name: '',
  email: '',
  password: '',
  phone: '',
  specialization: '',
  qualification: '',
  registration_number: '',
  experience_years: 0,
  consultation_fee: 0,
  department_id: '',
  available_days: [],
  start_time: '09:00',
  end_time: '17:00',
  slot_duration_minutes: 15
})

const errors = reactive({
  full_name: '',
  email: '',
  password: '',
  phone: '',
  specialization: '',
  qualification: '',
  registration_number: '',
  experience_years: '',
  consultation_fee: '',
  department_id: '',
  available_days: '',
  start_time: '',
  end_time: '',
  slot_duration_minutes: ''
})

onMounted(async () => {
  await fetchDepartments()
})

const fetchDepartments = async () => {
  departmentsLoading.value = true
  try {
    const response = await adminAPI.listDepartments(authStore.token)
    departments.value = response.data.data || []
  } catch (err) {
    console.error('Error fetching departments:', err)
  } finally {
    departmentsLoading.value = false
  }
}

const validateForm = () => {
  // Clear previous errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  let isValid = true

  // Full Name
  if (!formData.full_name.trim()) {
    errors.full_name = 'Full Name is required'
    isValid = false
  }

  // Email
  if (!formData.email.trim()) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email'
    isValid = false
  }

  // Password
  if (!formData.password) {
    errors.password = 'Password is required'
    isValid = false
  } else if (formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
    isValid = false
  }

  // Phone
  if (!formData.phone) {
    errors.phone = 'Phone Number is required'
    isValid = false
  } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
    errors.phone = 'Phone must be exactly 10 digits'
    isValid = false
  }

  // Specialization
  if (!formData.specialization.trim()) {
    errors.specialization = 'Specialization is required'
    isValid = false
  }

  // Qualification
  if (!formData.qualification.trim()) {
    errors.qualification = 'Qualification is required'
    isValid = false
  }

  // Registration Number
  if (!formData.registration_number.trim()) {
    errors.registration_number = 'Registration Number is required'
    isValid = false
  }

  // Experience Years
  if (formData.experience_years === null || formData.experience_years === '') {
    errors.experience_years = 'Experience is required'
    isValid = false
  } else if (formData.experience_years < 0) {
    errors.experience_years = 'Experience cannot be negative'
    isValid = false
  }

  // Consultation Fee
  if (formData.consultation_fee === null || formData.consultation_fee === '') {
    errors.consultation_fee = 'Consultation Fee is required'
    isValid = false
  } else if (formData.consultation_fee < 0) {
    errors.consultation_fee = 'Consultation Fee cannot be negative'
    isValid = false
  }

  // Department
  if (!formData.department_id) {
    errors.department_id = 'Department is required'
    isValid = false
  }

  // Available Days
  if (formData.available_days.length === 0) {
    errors.available_days = 'Select at least one available day'
    isValid = false
  }

  // Times
  if (!formData.start_time) {
    errors.start_time = 'Start Time is required'
    isValid = false
  }

  if (!formData.end_time) {
    errors.end_time = 'End Time is required'
    isValid = false
  }

  if (formData.start_time && formData.end_time) {
    if (formData.end_time <= formData.start_time) {
      errors.end_time = 'End Time must be after Start Time'
      isValid = false
    }
  }

  // Slot Duration
  if (!formData.slot_duration_minutes) {
    errors.slot_duration_minutes = 'Slot Duration is required'
    isValid = false
  }

  return isValid
}

const toggleDay = (day) => {
  const index = formData.available_days.indexOf(day)
  if (index > -1) {
    formData.available_days.splice(index, 1)
  } else {
    formData.available_days.push(day)
  }
  errors.available_days = ''
}

const isDaySelected = (day) => {
  return formData.available_days.includes(day)
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    const payload = {
      full_name: formData.full_name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      phone: formData.phone.replace(/\D/g, ''),
      specialization: formData.specialization.trim(),
      qualification: formData.qualification.trim(),
      registration_number: formData.registration_number.trim(),
      experience_years: parseInt(formData.experience_years) || 0,
      consultation_fee: parseFloat(formData.consultation_fee) || 0,
      department_id: formData.department_id,
      available_days: formData.available_days,
      start_time: formData.start_time,
      end_time: formData.end_time,
      slot_duration_minutes: parseInt(formData.slot_duration_minutes) || 15
    }

    const response = await adminAPI.createDoctor(authStore.token, payload)

    toastMessage.value = 'Doctor added successfully!'
    showSuccessToast.value = true

    setTimeout(() => {
      showSuccessToast.value = false
      emit('success')
    }, 2000)
  } catch (err) {
    console.error('Error creating doctor:', err)

    if (err.response?.status === 409) {
      if (err.response?.data?.message?.includes('email')) {
        errors.email = 'This email is already registered'
      } else if (err.response?.data?.message?.includes('registration')) {
        errors.registration_number = err.response?.data?.message || 'Registration number already exists'
      } else {
        errors.email = err.response?.data?.message || 'This email is already registered'
      }
    } else if (err.response?.status === 422) {
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
        <h2 class="panel-title">Add New Doctor</h2>
        <p class="panel-subtitle">Onboard a new medical professional to the system.</p>
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

      <!-- Section 1: Personal & Login Details -->
      <div class="form-section">
        <div class="section-header">
          <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          <h3 class="section-title">PERSONAL & LOGIN DETAILS</h3>
        </div>

        <!-- Full Name -->
        <div class="form-group full-width">
          <label class="form-label">FULL NAME<span class="required">*</span></label>
          <input
            id="full_name"
            v-model="formData.full_name"
            type="text"
            class="form-input"
            :class="{ 'input-error': errors.full_name }"
            placeholder="Dr. Jane Doe"
          />
          <p v-if="errors.full_name" class="error-message">{{ errors.full_name }}</p>
        </div>

        <!-- Email & Phone Number (Side by Side) -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">EMAIL<span class="required">*</span></label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              class="form-input"
              :class="{ 'input-error': errors.email }"
              placeholder="jane.doe@sterling.com"
            />
            <p v-if="errors.email" class="error-message">{{ errors.email }}</p>
          </div>

          <div class="form-group">
            <label class="form-label">PHONE NUMBER<span class="required">*</span></label>
            <input
              id="phone"
              type="tel"
              class="form-input"
              :class="{ 'input-error': errors.phone }"
              placeholder="+91 98765 43210"
              maxlength="10"
              @input="handlePhoneInput"
            />
            <p v-if="errors.phone" class="error-message">{{ errors.phone }}</p>
          </div>
        </div>

        <!-- Password -->
        <div class="form-group full-width">
          <label class="form-label">PASSWORD<span class="required">*</span></label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            class="form-input"
            :class="{ 'input-error': errors.password }"
            placeholder="••••••••••••"
          />
          <p v-if="errors.password" class="error-message">{{ errors.password }}</p>
        </div>
      </div>

      <!-- Section 2: Professional Details -->
      <div class="form-section">
        <div class="section-header">
          <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
          </svg>
          <h3 class="section-title">PROFESSIONAL DETAILS</h3>
        </div>

        <!-- Specialization & Qualification (Side by Side) -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">SPECIALIZATION<span class="required">*</span></label>
            <input
              id="specialization"
              v-model="formData.specialization"
              type="text"
              class="form-input"
              :class="{ 'input-error': errors.specialization }"
              placeholder="Select Specialist"
            />
            <p v-if="errors.specialization" class="error-message">{{ errors.specialization }}</p>
          </div>

          <div class="form-group">
            <label class="form-label">QUALIFICATION<span class="required">*</span></label>
            <input
              id="qualification"
              v-model="formData.qualification"
              type="text"
              class="form-input"
              :class="{ 'input-error': errors.qualification }"
              placeholder="MD, PhD"
            />
            <p v-if="errors.qualification" class="error-message">{{ errors.qualification }}</p>
          </div>
        </div>

        <!-- Registration Number & Experience (Side by Side) -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">REGISTRATION NO.<span class="required">*</span></label>
            <input
              id="registration_number"
              v-model="formData.registration_number"
              type="text"
              class="form-input"
              :class="{ 'input-error': errors.registration_number }"
              placeholder="MCI-123456"
            />
            <p v-if="errors.registration_number" class="error-message">{{ errors.registration_number }}</p>
          </div>

          <div class="form-group">
            <label class="form-label">EXPERIENCE (YEARS)<span class="required">*</span></label>
            <input
              id="experience_years"
              v-model.number="formData.experience_years"
              type="number"
              class="form-input"
              :class="{ 'input-error': errors.experience_years }"
              placeholder="10"
              min="0"
            />
            <p v-if="errors.experience_years" class="error-message">{{ errors.experience_years }}</p>
          </div>
        </div>

        <!-- Consultation Fee (Full Width) -->
        <div class="form-group full-width">
          <label class="form-label">CONSULTATION FEE (₹)<span class="required">*</span></label>
          <input
            id="consultation_fee"
            v-model.number="formData.consultation_fee"
            type="number"
            class="form-input"
            :class="{ 'input-error': errors.consultation_fee }"
            placeholder="1500"
            min="0"
            step="0.01"
          />
          <p v-if="errors.consultation_fee" class="error-message">{{ errors.consultation_fee }}</p>
        </div>

        <!-- Available Days -->
        <div class="form-group full-width">
          <label class="form-label">AVAILABLE DAYS<span class="required">*</span></label>
          <div class="days-grid">
            <button
              v-for="day in daysOfWeek"
              :key="day"
              type="button"
              class="day-button"
              :class="{ 'day-selected': isDaySelected(day) }"
              @click="toggleDay(day)"
            >
              {{ day }}
            </button>
          </div>
          <p v-if="errors.available_days" class="error-message">{{ errors.available_days }}</p>
        </div>

        <!-- Start Time & End Time (Side by Side) -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">START TIME<span class="required">*</span></label>
            <input
              id="start_time"
              v-model="formData.start_time"
              type="time"
              class="form-input"
              :class="{ 'input-error': errors.start_time }"
            />
            <p v-if="errors.start_time" class="error-message">{{ errors.start_time }}</p>
          </div>

          <div class="form-group">
            <label class="form-label">END TIME<span class="required">*</span></label>
            <input
              id="end_time"
              v-model="formData.end_time"
              type="time"
              class="form-input"
              :class="{ 'input-error': errors.end_time }"
            />
            <p v-if="errors.end_time" class="error-message">{{ errors.end_time }}</p>
          </div>
        </div>

        <!-- Department -->
        <div class="form-group full-width">
          <label class="form-label">DEPARTMENT<span class="required">*</span></label>
          <div class="select-wrapper">
            <select
              id="department_id"
              v-model="formData.department_id"
              class="form-input"
              :class="{ 'input-error': errors.department_id }"
            >
              <option value="">Select a department</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
            <svg class="select-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
          <p v-if="errors.department_id" class="error-message">{{ errors.department_id }}</p>
        </div>

        <!-- Slot Duration -->
        <div class="form-group full-width">
          <label class="form-label">SLOT DURATION<span class="required">*</span></label>
          <div class="select-wrapper">
            <select
              id="slot_duration_minutes"
              v-model.number="formData.slot_duration_minutes"
              class="form-input"
              :class="{ 'input-error': errors.slot_duration_minutes }"
            >
              <option :value="10">10 min</option>
              <option :value="15">15 min</option>
              <option :value="20">20 min</option>
              <option :value="30">30 min</option>
            </select>
            <svg class="select-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
          <p v-if="errors.slot_duration_minutes" class="error-message">{{ errors.slot_duration_minutes }}</p>
        </div>
      </div>
    </div>

    <!-- Panel Footer -->
    <div class="panel-footer">
      <button @click="handleCancel" class="btn-cancel" :disabled="loading">
        Cancel
      </button>
      <button @click="handleSubmit" class="btn-save" :disabled="loading">
        {{ loading ? 'Saving...' : 'Save Profile' }}
      </button>
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
  z-index: 9999;
  opacity: 1;
  transition: opacity 0.3s ease;
}

/* Slide Panel */
.slide-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 500px;
  height: 100vh;
  background: white;
  border-left: 1px solid #E2E8F0;
  border-radius: 12px 0 0 12px;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.08);
  z-index: 10000;
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
  padding: 28px;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-shrink: 0;
}

.header-content {
  flex: 1;
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
  width: 28px;
  height: 28px;
  background: #F7F9FC;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #4A5568;
  padding: 0;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.close-btn:hover {
  background: #FFE4E6;
  border-color: #FFE4E6;
  color: #9F1239;
}

.close-btn svg {
  width: 14px;
  height: 14px;
}

/* Panel Body */
.panel-body {
  padding: 28px;
  overflow-y: auto;
  flex: 1;
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

/* Form Section */
.form-section {
  margin-bottom: 24px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #F0F4F8;
}

.section-icon {
  width: 16px;
  height: 16px;
  color: #1B5E8F;
  flex-shrink: 0;
}

.section-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #1B5E8F;
  text-transform: uppercase;
  margin: 0;
  padding: 0;
}

/* Form Groups */
.form-group {
  margin-bottom: 16px;
  text-align: left;
}

.form-group.full-width {
  margin-bottom: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: #4A5568;
  text-transform: uppercase;
  margin-bottom: 6px;
  padding: 0;
  text-align: left;
}

.required {
  color: #E53E3E;
  margin-left: 2px;
}

/* Form Inputs */
.form-input {
  width: 100%;
  height: 42px;
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
  width: 16px;
  height: 16px;
  color: #A0AEC0;
  pointer-events: none;
  flex-shrink: 0;
}

select.form-input {
  padding-right: 40px;
  background-image: none;
}

select.form-input option {
  padding: 10px;
  background: white;
  color: #2D3748;
}

/* Days Grid/Buttons */
.days-grid {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.day-button {
  background: #F7F9FC;
  border: 1px solid #E2E8F0;
  color: #4A5568;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 40px;
  text-align: center;
}

.day-button:hover {
  border-color: #1B5E8F;
  color: #1B5E8F;
}

.day-button.day-selected {
  background: #1B3A6B;
  border-color: #1B3A6B;
  color: white;
  font-weight: 600;
}

/* Error Messages */
.error-message {
  color: #F56565;
  font-size: 12px;
  margin: 6px 0 0 0;
  padding: 0;
  text-align: left;
}

/* Panel Footer */
.panel-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #F0F4F8;
  margin-top: 8px;
  padding: 16px 28px;
  flex-shrink: 0;
  background: white;
}

.btn-cancel {
  background: white;
  color: #4A5568;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 10px 24px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover:not(:disabled) {
  background: #F7F9FC;
}

.btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-save {
  background: #1B3A6B;
  color: white;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  padding: 10px 28px;
  cursor: pointer;
  min-width: 140px;
  transition: all 0.2s ease;
}

.btn-save:hover:not(:disabled) {
  background: #152D54;
  transform: translateY(-1px);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .slide-panel {
    width: 100%;
    border-radius: 0;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
