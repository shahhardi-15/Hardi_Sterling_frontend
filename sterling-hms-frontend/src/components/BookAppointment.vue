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
                :key="slot"
                type="button"
                :class="['slot-btn', { 'selected': form.timeSlot === slot }]"
                @click.prevent="form.timeSlot = slot"
              >
                {{ slot }}
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
  // availableTimeSlots.value now contains just the time strings (e.g., "09:00", "10:30")
  return availableTimeSlots.value
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
    await fetchAvailableSlots()
  }
}

const fetchAvailableSlots = async () => {
  try {
    loading.value = true
    const doctorId = parseInt(form.value.doctorId)
    const selectedDate = form.value.appointmentDate
    
    console.log('🔍 Fetching slots for:', { doctorId, selectedDate })
    
    // Fetch all available slots for the doctor from backend API
    await appointmentStore.getAvailableSlots(doctorId)
    
    console.log('📊 All slots from backend:', appointmentStore.availableSlots.length, 'slots')
    if (appointmentStore.availableSlots.length > 0) {
      console.log('Sample slot:', appointmentStore.availableSlots[0])
    }
    
    // Filter slots for the selected date and extract time slots only
    // Handle date format: backend returns ISO 8601 (2026-03-30T00:00:00Z) but we need YYYY-MM-DD
    const filteredByDate = appointmentStore.availableSlots
      .filter(slot => {
        // Normalize slot date to YYYY-MM-DD format
        let slotDateStr = slot.slotDate
        if (slotDateStr && slotDateStr.includes('T')) {
          // If it's ISO 8601 format, extract just the date part
          slotDateStr = slotDateStr.split('T')[0]
        }
        const matches = slotDateStr === selectedDate && slot.isAvailable
        return matches
      })
      .map(slot => slot.timeSlot)
    
    console.log('✅ Filtered slots for date:', { selectedDate, count: filteredByDate.length, slots: filteredByDate })
    availableTimeSlots.value = filteredByDate
    
    if (filteredByDate.length === 0) {
      console.warn(`⚠️ No available slots for doctor ${doctorId} on ${selectedDate}`)
      console.log('Debug: First 5 slots from backend:', appointmentStore.availableSlots.slice(0, 5).map(s => {
        const dateNormalized = s.slotDate && s.slotDate.includes('T') ? s.slotDate.split('T')[0] : s.slotDate
        return { date: dateNormalized, time: s.timeSlot, available: s.isAvailable }
      }))
    }
  } catch (err) {
    console.error('❌ Failed to fetch available slots:', err)
    error.value = 'Failed to fetch available slots'
    availableTimeSlots.value = []
  } finally {
    loading.value = false
  }
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
    const bookingData = {
      doctorId: parseInt(form.value.doctorId),
      appointmentDate: form.value.appointmentDate,
      timeSlot: form.value.timeSlot,
      reason: form.value.reason,
      notes: form.value.notes || ''
    }
    console.log('📅 Booking appointment:', bookingData)
    
    await appointmentStore.bookAppointment(bookingData)

    successMessage.value = 'Your appointment request has been submitted. Please wait for admin approval before your appointment is confirmed.'
    console.log('✅ Booking successful')
    
    // Refresh appointment history so newly booked appointment appears immediately
    await appointmentStore.getHistory(1, 10)
    
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
    console.error('❌ Booking failed:', err)
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
  border-bottom: 3px solid #2196F3;
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
  border-left: 4px solid #2196F3;
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
  border-color: #2196F3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
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
  border-color: #2196F3;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);
  transform: translateY(-2px);
}

.doctor-card.selected {
  border-color: #2196F3;
  background: #e3f2fd;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.doctor-card-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.doctor-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #2196F3, #1976D2);
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
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  border-left-color: #1565c0;
}

.doctor-details-card {
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 2px solid #2196F3;
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
  background: linear-gradient(135deg, #2196F3, #1976D2);
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
  color: #2196F3;
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
  border-color: #2196F3;
  color: #2196F3;
}

.slot-btn.selected {
  background: #2196F3;
  border-color: #2196F3;
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
  background: #2196F3;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1976D2;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
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
  border-color: #2196F3;
}

.custom-select-input.active {
  border-color: #2196F3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
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
  color: #2196F3;
  font-weight: 500;
}
</style>
