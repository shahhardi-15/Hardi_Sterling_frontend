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
  <div class="modal-overlay">
    <div class="modal-content">
      <!-- Toast Notification -->
      <div v-if="showSuccessToast" class="toast-notification">
        {{ toastMessage }}
      </div>

      <!-- Modal Header -->
      <div class="modal-header">
        <h2>Add New Doctor</h2>
        <button @click="handleCancel" class="close-btn">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <!-- Section 1: Personal & Login Details -->
        <div class="form-section">
          <h3 class="section-title">Personal & Login Details</h3>
          <div class="form-grid">
            <!-- Full Name -->
            <div class="form-group">
              <label for="full_name">Full Name <span class="required">*</span></label>
              <input
                id="full_name"
                v-model="formData.full_name"
                type="text"
                class="form-input"
                :class="{ 'input-error': errors.full_name }"
                placeholder="Dr. John Doe"
              />
              <span v-if="errors.full_name" class="error-message">{{ errors.full_name }}</span>
            </div>

            <!-- Email -->
            <div class="form-group">
              <label for="email">Email <span class="required">*</span></label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                class="form-input"
                :class="{ 'input-error': errors.email }"
                placeholder="doctor@example.com"
              />
              <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
            </div>

            <!-- Password -->
            <div class="form-group">
              <label for="password">Password <span class="required">*</span></label>
              <input
                id="password"
                v-model="formData.password"
                type="password"
                class="form-input"
                :class="{ 'input-error': errors.password }"
                placeholder="Min. 8 characters"
              />
              <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
            </div>

            <!-- Phone -->
            <div class="form-group">
              <label for="phone">Phone Number <span class="required">*</span></label>
              <input
                id="phone"
                type="tel"
                class="form-input"
                :class="{ 'input-error': errors.phone }"
                placeholder="10-digit phone number"
                @input="handlePhoneInput"
              />
              <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
            </div>
          </div>
        </div>

        <!-- Section 2: Professional Details -->
        <div class="form-section">
          <h3 class="section-title">Professional Details</h3>
          <div class="form-grid">
            <!-- Specialization -->
            <div class="form-group">
              <label for="specialization">Specialization <span class="required">*</span></label>
              <input
                id="specialization"
                v-model="formData.specialization"
                type="text"
                class="form-input"
                :class="{ 'input-error': errors.specialization }"
                placeholder="e.g., Cardiology"
              />
              <span v-if="errors.specialization" class="error-message">{{ errors.specialization }}</span>
            </div>

            <!-- Qualification -->
            <div class="form-group">
              <label for="qualification">Qualification <span class="required">*</span></label>
              <input
                id="qualification"
                v-model="formData.qualification"
                type="text"
                class="form-input"
                :class="{ 'input-error': errors.qualification }"
                placeholder="e.g., MBBS, MD"
              />
              <span v-if="errors.qualification" class="error-message">{{ errors.qualification }}</span>
            </div>

            <!-- Registration Number -->
            <div class="form-group">
              <label for="registration_number">Registration No. <span class="required">*</span></label>
              <input
                id="registration_number"
                v-model="formData.registration_number"
                type="text"
                class="form-input"
                :class="{ 'input-error': errors.registration_number }"
                placeholder="Medical council number"
              />
              <span v-if="errors.registration_number" class="error-message">{{ errors.registration_number }}</span>
            </div>

            <!-- Experience Years -->
            <div class="form-group">
              <label for="experience_years">Experience (Years) <span class="required">*</span></label>
              <input
                id="experience_years"
                v-model.number="formData.experience_years"
                type="number"
                class="form-input"
                :class="{ 'input-error': errors.experience_years }"
                placeholder="0"
                min="0"
              />
              <span v-if="errors.experience_years" class="error-message">{{ errors.experience_years }}</span>
            </div>

            <!-- Consultation Fee -->
            <div class="form-group">
              <label for="consultation_fee">Consultation Fee (₹) <span class="required">*</span></label>
              <input
                id="consultation_fee"
                v-model.number="formData.consultation_fee"
                type="number"
                class="form-input"
                :class="{ 'input-error': errors.consultation_fee }"
                placeholder="0"
                min="0"
                step="0.01"
              />
              <span v-if="errors.consultation_fee" class="error-message">{{ errors.consultation_fee }}</span>
            </div>

            <!-- Department -->
            <div class="form-group">
              <label for="department_id">Department <span class="required">*</span></label>
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
              <span v-if="errors.department_id" class="error-message">{{ errors.department_id }}</span>
            </div>
          </div>

          <!-- Available Days -->
          <div class="form-group">
            <label>Available Days <span class="required">*</span></label>
            <div class="checkboxes-grid">
              <label v-for="day in daysOfWeek" :key="day" class="checkbox-label">
                <input
                  type="checkbox"
                  :checked="isDaySelected(day)"
                  @change="toggleDay(day)"
                  class="checkbox-input"
                />
                <span class="checkbox-text">{{ day }}</span>
              </label>
            </div>
            <span v-if="errors.available_days" class="error-message">{{ errors.available_days }}</span>
          </div>

          <!-- Working Hours -->
          <div class="form-grid">
            <!-- Start Time -->
            <div class="form-group">
              <label for="start_time">Start Time <span class="required">*</span></label>
              <input
                id="start_time"
                v-model="formData.start_time"
                type="time"
                class="form-input"
                :class="{ 'input-error': errors.start_time }"
              />
              <span v-if="errors.start_time" class="error-message">{{ errors.start_time }}</span>
            </div>

            <!-- End Time -->
            <div class="form-group">
              <label for="end_time">End Time <span class="required">*</span></label>
              <input
                id="end_time"
                v-model="formData.end_time"
                type="time"
                class="form-input"
                :class="{ 'input-error': errors.end_time }"
              />
              <span v-if="errors.end_time" class="error-message">{{ errors.end_time }}</span>
            </div>

            <!-- Slot Duration -->
            <div class="form-group">
              <label for="slot_duration_minutes">Slot Duration <span class="required">*</span></label>
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
              <span v-if="errors.slot_duration_minutes" class="error-message">{{ errors.slot_duration_minutes }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <button @click="handleCancel" class="btn-secondary" :disabled="loading">
          Cancel
        </button>
        <button @click="handleSubmit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Adding...' : 'Add Doctor' }}
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
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.toast-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #4caf50;
  color: white;
  padding: 16px 24px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  font-weight: 600;
  z-index: 2000;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.modal-header {
  border-bottom: 1px solid #eee;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: #666;
  transition: all 0.3s;
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
}

.form-section {
  margin-bottom: 32px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.required {
  color: #f44336;
}

.form-input,
select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s;
  background-color: white;
}

.form-input:focus,
select:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.input-error {
  border-color: #f44336 !important;
  background-color: #fff5f5;
}

.error-message {
  font-size: 12px;
  color: #f44336;
  margin-top: 4px;
}

.checkboxes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #2196F3;
}

.checkbox-text {
  user-select: none;
}

.modal-footer {
  border-top: 1px solid #eee;
  padding: 20px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-secondary {
  padding: 10px 24px;
  background-color: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  padding: 10px 24px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1976D2;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
