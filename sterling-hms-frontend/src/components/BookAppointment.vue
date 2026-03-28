<template>
  <div class="book-appointment-section">
    <h2 class="section-title">Book Appointment</h2>
    
    <div v-if="loading" class="loading">
      <p>Loading...</p>
    </div>

    <form v-else @submit.prevent="submitBooking" class="appointment-form">
      <!-- Step 1: Specialization Selection -->
      <div class="form-section">
        <h3 class="step-title">Step 1: Select Specialization</h3>
        <div class="form-group">
          <label for="specialization">Specialization *</label>
          <div class="custom-select-wrapper">
            <div 
              class="custom-select-input"
              @click="toggleDropdown"
              :class="{ active: showDropdown }"
            >
              {{ form.specialization || '-- Choose a specialization --' }}
              <span class="dropdown-arrow">▼</span>
            </div>
            <div v-if="showDropdown" class="custom-dropdown-menu">
              <div 
                v-for="spec in appointmentStore.specializations" 
                :key="spec.name"
                class="custom-option"
                @click="selectSpecialization(spec.name)"
              >
                {{ spec.name }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Doctor Selection (Doctor Cards) -->
      <div v-if="form.specialization" class="form-section">
        <h3 class="step-title">Step 2: Select Doctor</h3>
        <div v-if="appointmentStore.doctorsBySpecialization.length === 0" class="no-results">
          <p>No doctors available for this specialization</p>
        </div>
        <div v-else class="doctors-grid">
          <div 
            v-for="doctor in appointmentStore.doctorsBySpecialization" 
            :key="doctor.id"
            :class="['doctor-card', { 'selected': form.doctorId === doctor.id }]"
            @click="selectDoctor(doctor)"
          >
            <div class="doctor-card-header">
              <div class="doctor-avatar">{{ doctor.name.charAt(0) }}</div>
              <div class="doctor-basic-info">
                <h4 class="doctor-name">{{ doctor.name }}</h4>
                <p class="doctor-spec">{{ doctor.specialization }}</p>
              </div>
            </div>
            <div class="doctor-quick-info">
              <span v-if="doctor.experienceYears" class="badge">{{ doctor.experienceYears }} yrs</span>
              <span class="availability-badge" :class="doctor.isAvailable ? 'available' : 'unavailable'">
                {{ doctor.isAvailable ? 'Available' : 'Not Available' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Doctor Details (when doctor is selected) -->
      <div v-if="form.doctorId && appointmentStore.selectedDoctor" class="form-section doctor-details-section">
        <h3 class="step-title">Step 3: Doctor Information</h3>
        <div class="doctor-details-card">
          <div class="details-header">
            <div class="details-avatar">{{ appointmentStore.selectedDoctor.name.charAt(0) }}</div>
            <div class="details-main">
              <h3 class="details-name">{{ appointmentStore.selectedDoctor.name }}</h3>
              <p class="details-spec">{{ appointmentStore.selectedDoctor.specialization }}</p>
            </div>
          </div>
          
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">Experience</span>
              <span class="detail-value">{{ appointmentStore.selectedDoctor.experienceYears }} years</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Qualification</span>
              <span class="detail-value">{{ appointmentStore.selectedDoctor.qualification }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Phone</span>
              <span class="detail-value">{{ appointmentStore.selectedDoctor.phone }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Available</span>
              <span class="detail-value" :class="appointmentStore.selectedDoctor.isAvailable ? 'available-text' : 'unavailable-text'">
                {{ appointmentStore.selectedDoctor.isAvailable ? 'Yes' : 'No' }}
              </span>
            </div>
          </div>

          <div v-if="appointmentStore.selectedDoctor.address" class="detail-full-width">
            <span class="detail-label">Address</span>
            <p class="detail-value address">{{ appointmentStore.selectedDoctor.address }}</p>
          </div>
        </div>
      </div>

      <!-- Step 4: Appointment Details -->
      <div v-if="form.doctorId" class="form-section">
        <h3 class="step-title">Step 4: Appointment Details</h3>

        <!-- Date Selection -->
        <div class="form-group">
          <label for="date">Appointment Date *</label>
          <input 
            v-model="form.appointmentDate" 
            type="date" 
            id="date" 
            required
            :min="today"
            class="form-control"
            @change="onDateChange"
          />
        </div>

        <!-- Time Slot Selection -->
        <div class="form-group">
          <label for="time">Time Slot *</label>
          <div v-if="form.doctorId && form.appointmentDate" class="time-slots">
            <div v-if="filteredSlots.length === 0" class="no-slots">
              <p>No available slots for this date</p>
            </div>
            <div v-else class="slots-grid">
              <button 
                v-for="slot in filteredSlots" 
                :key="`${slot.doctorId}-${slot.slotDate}-${slot.time}`"
                type="button"
                :class="['slot-btn', { 'selected': form.timeSlot === slot.time }]"
                @click.prevent="form.timeSlot = slot.time"
              >
                {{ slot.time }}
              </button>
            </div>
          </div>
          <p v-else class="text-muted">Select a doctor and date first</p>
        </div>

        <!-- Reason for Visit -->
        <div class="form-group">
          <label for="reason">Reason for Visit *</label>
          <textarea 
            v-model="form.reason" 
            id="reason" 
            rows="3" 
            required
            placeholder="Describe your symptoms or reason for the appointment"
            class="form-control"
          ></textarea>
        </div>

        <!-- Additional Notes -->
        <div class="form-group">
          <label for="notes">Additional Notes</label>
          <textarea 
            v-model="form.notes" 
            id="notes" 
            rows="2" 
            placeholder="Any additional information for the doctor (optional)"
            class="form-control"
          ></textarea>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <!-- Submit Button -->
      <button 
        v-if="form.doctorId" 
        type="submit" 
        :disabled="submitting || !isFormValid" 
        class="btn btn-primary btn-large"
      >
        {{ submitting ? 'Booking...' : 'Book Appointment' }}
      </button>

      <!-- Success Message -->
      <div v-if="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAppointmentStore } from '@/stores/appointment'

const appointmentStore = useAppointmentStore()

const form = ref({
  specialization: '',
  doctorId: '',
  appointmentDate: '',
  timeSlot: '',
  reason: '',
  notes: ''
})

const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const successMessage = ref('')
const showDropdown = ref(false)
const availableTimeSlots = ref([])

const today = computed(() => {
  const date = new Date()
  return date.toISOString().split('T')[0]
})

const filteredSlots = computed(() => {
  return availableTimeSlots.value.map((slot) => ({
    time: slot,
    doctorId: parseInt(form.value.doctorId),
    slotDate: form.value.appointmentDate
  }))
})

const isFormValid = computed(() => {
  return form.value.doctorId && 
         form.value.appointmentDate && 
         form.value.timeSlot && 
         form.value.reason
})

onMounted(async () => {
  try {
    loading.value = true
    await appointmentStore.getSpecializations()
  } catch (err) {
    error.value = 'Failed to load specializations'
  } finally {
    loading.value = false
  }
  
  // Add click outside listener
  document.addEventListener('click', closeDropdownOnClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdownOnClickOutside)
})

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const closeDropdownOnClickOutside = (event) => {
  const wrapper = document.querySelector('.custom-select-wrapper')
  if (wrapper && !wrapper.contains(event.target)) {
    showDropdown.value = false
  }
}

const selectDoctor = (doctor) => {
  form.value.doctorId = doctor.id
  appointmentStore.setSelectedDoctor(doctor)
  form.value.appointmentDate = ''
  form.value.timeSlot = ''
}

const selectSpecialization = async (specialization) => {
  form.value.specialization = specialization
  showDropdown.value = false
  
  // Clear doctor selection when specialization changes
  form.value.doctorId = ''
  form.value.appointmentDate = ''
  form.value.timeSlot = ''
  appointmentStore.clearSelectedDoctor()

  if (specialization) {
    try {
      loading.value = true
      await appointmentStore.getDoctorsBySpecialization(specialization)
    } catch (err) {
      error.value = 'Failed to load doctors for this specialization'
    } finally {
      loading.value = false
    }
  } else {
    appointmentStore.doctorsBySpecialization = []
  }
}

const onDateChange = async () => {
  form.value.timeSlot = ''
  if (form.value.doctorId && form.value.appointmentDate) {
    generateRandomTimeSlots()
  }
}

const generateRandomTimeSlots = () => {
  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM',
    '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
    '04:30 PM', '05:00 PM', '05:30 PM'
  ]
  
  // Randomly select 3-4 time slots
  const numSlots = Math.floor(Math.random() * 2) + 3 // 3 or 4
  const shuffled = [...timeSlots].sort(() => 0.5 - Math.random())
  availableTimeSlots.value = shuffled.slice(0, numSlots)
}

const submitBooking = async () => {
  error.value = ''
  successMessage.value = ''

  if (!isFormValid.value) {
    error.value = 'Please fill all required fields'
    return
  }

  try {
    submitting.value = true
    await appointmentStore.bookAppointment({
      doctorId: parseInt(form.value.doctorId),
      appointmentDate: form.value.appointmentDate,
      timeSlot: form.value.timeSlot,
      reason: form.value.reason,
      notes: form.value.notes || ''
    })

    successMessage.value = 'Appointment booked successfully!'
    // Reset form
    form.value = {
      specialization: '',
      doctorId: '',
      appointmentDate: '',
      timeSlot: '',
      reason: '',
      notes: ''
    }
    appointmentStore.clearSelectedDoctor()

    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to book appointment'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.book-appointment-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;
  color: #333;
  border-bottom: 3px solid #4CAF50;
  padding-bottom: 12px;
}

.appointment-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid #4CAF50;
  overflow: visible;
}

.step-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 500;
  margin-bottom: 8px;
  color: #555;
  font-size: 14px;
}

.form-control {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.form-control:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
  overflow: visible;
}

/* Doctor Cards Grid */
.doctors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.doctor-card {
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.doctor-card:hover {
  border-color: #4CAF50;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
  transform: translateY(-2px);
}

.doctor-card.selected {
  border-color: #4CAF50;
  background: #f0f8f3;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.doctor-card-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.doctor-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 20px;
  flex-shrink: 0;
}

.doctor-basic-info {
  flex: 1;
}

.doctor-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.doctor-spec {
  font-size: 13px;
  color: #666;
  margin: 0;
}

.doctor-quick-info {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.availability-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.availability-badge.available {
  background: #e8f5e9;
  color: #2e7d32;
}

.availability-badge.unavailable {
  background: #ffebee;
  color: #c62828;
}

.no-results {
  padding: 24px;
  text-align: center;
  color: #999;
  background: #f5f5f5;
  border-radius: 8px;
}

/* Doctor Details Card */
.doctor-details-section {
  background: linear-gradient(135deg, #f0f8f3, #e8f5e9);
  border-left-color: #2e7d32;
}

.doctor-details-card {
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 2px solid #4CAF50;
}

.details-header {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e0e0e0;
}

.details-avatar {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 28px;
  flex-shrink: 0;
}

.details-main {
  flex: 1;
}

.details-name {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0 0 4px 0;
}

.details-spec {
  font-size: 14px;
  color: #4CAF50;
  font-weight: 600;
  margin: 0;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 12px;
  color: #888;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.available-text {
  color: #2e7d32;
  font-weight: 600;
}

.unavailable-text {
  color: #c62828;
  font-weight: 600;
}

.detail-full-width {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 2px solid #e0e0e0;
}

.address {
  line-height: 1.6;
  color: #555;
  margin: 8px 0 0 0;
}

/* Time Slots */
.time-slots {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
}

.slot-btn {
  padding: 8px;
  border: 2px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  font-weight: 500;
}

.slot-btn:hover {
  border-color: #4CAF50;
  color: #4CAF50;
}

.slot-btn.selected {
  background: #4CAF50;
  border-color: #4CAF50;
  color: white;
  font-weight: 600;
}

.no-slots {
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;
  text-align: center;
  color: #999;
}

.text-muted {
  color: #999;
  font-size: 13px;
}

/* Buttons */
.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #4CAF50;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #45a049;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.btn-large {
  padding: 12px 24px;
  font-size: 16px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Alerts */
.alert {
  padding: 12px;
  border-radius: 4px;
  font-size: 13px;
}

.alert-danger {
  background: #fee;
  border: 1px solid #fcc;
  color: #c33;
}

.alert-success {
  background: #efe;
  border: 1px solid #cfc;
  color: #3c3;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #999;
}

/* Custom Dropdown */
.custom-select-wrapper {
  position: relative;
  width: 100%;
}

.custom-select-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  min-height: 20px;
}

.custom-select-input:hover {
  border-color: #4CAF50;
}

.custom-select-input.active {
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.dropdown-arrow {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
  transition: transform 0.2s;
}

.custom-select-input.active .dropdown-arrow {
  transform: rotate(180deg);
}

.custom-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 4px 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  margin-top: -1px;
}

.custom-option {
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}

.custom-option:last-child {
  border-bottom: none;
}

.custom-option:hover {
  background: #f5f5f5;
  padding-left: 16px;
  color: #4CAF50;
  font-weight: 500;
}
</style>
