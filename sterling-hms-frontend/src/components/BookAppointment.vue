<template>
  <div class="book-appointment-section">
    <h2 class="section-title">Book Appointment</h2>
    
    <div v-if="loading" class="loading">
      <p>Loading doctors...</p>
    </div>

    <form v-else @submit.prevent="submitBooking" class="appointment-form">
      <!-- Doctor Selection -->
      <div class="form-group">
        <label for="doctor">Select Doctor *</label>
        <select v-model="form.doctorId" id="doctor" required class="form-control">
          <option value="">-- Choose a doctor --</option>
          <optgroup v-for="specialization in groupedDoctors" :key="specialization.name" :label="specialization.name">
            <option v-for="doctor in specialization.doctors" :key="doctor.id" :value="doctor.id">
              {{ doctor.name }} - {{ doctor.specialization }}
            </option>
          </optgroup>
        </select>
      </div>

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
            <p>No available slots for this doctor on this date</p>
          </div>
          <div v-else class="slots-grid">
            <button 
              v-for="slot in filteredSlots" 
              :key="`${slot.doctorId}-${slot.slotDate}-${slot.timeSlot}`"
              type="button"
              :class="['slot-btn', { 'selected': form.timeSlot === slot.timeSlot }]"
              @click="form.timeSlot = slot.timeSlot"
            >
              {{ slot.timeSlot }}
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

      <!-- Error Message -->
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <!-- Submit Button -->
      <button type="submit" :disabled="submitting" class="btn btn-primary">
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
import { ref, computed, onMounted } from 'vue'
import { useAppointmentStore } from '@/stores/appointment'

const appointmentStore = useAppointmentStore()

const form = ref({
  doctorId: '',
  appointmentDate: '',
  timeSlot: '',
  reason: ''
})

const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const successMessage = ref('')

const today = computed(() => {
  const date = new Date()
  return date.toISOString().split('T')[0]
})

const groupedDoctors = computed(() => {
  const grouped = {}
  appointmentStore.doctors.forEach(doctor => {
    if (!grouped[doctor.specialization]) {
      grouped[doctor.specialization] = {
        name: doctor.specialization,
        doctors: []
      }
    }
    grouped[doctor.specialization].doctors.push(doctor)
  })
  return Object.values(grouped)
})

const filteredSlots = computed(() => {
  return appointmentStore.availableSlots.filter(slot => {
    return slot.doctorId === parseInt(form.value.doctorId) && 
           slot.slotDate === form.value.appointmentDate
  })
})

onMounted(async () => {
  try {
    loading.value = true
    await appointmentStore.getDoctors()
  } catch (err) {
    error.value = 'Failed to load doctors'
  } finally {
    loading.value = false
  }
})

const onDateChange = async () => {
  form.value.timeSlot = ''
  if (form.value.doctorId && form.value.appointmentDate) {
    try {
      await appointmentStore.getAvailableSlots(parseInt(form.value.doctorId))
    } catch (err) {
      error.value = 'Failed to load available slots'
    }
  }
}

const submitBooking = async () => {
  error.value = ''
  successMessage.value = ''

  if (!form.value.doctorId || !form.value.appointmentDate || !form.value.timeSlot || !form.value.reason) {
    error.value = 'Please fill all required fields'
    return
  }

  try {
    submitting.value = true
    await appointmentStore.bookAppointment({
      doctorId: parseInt(form.value.doctorId),
      appointmentDate: form.value.appointmentDate,
      timeSlot: form.value.timeSlot,
      reason: form.value.reason
    })

    successMessage.value = 'Appointment booked successfully!'
    // Reset form
    form.value = {
      doctorId: '',
      appointmentDate: '',
      timeSlot: '',
      reason: ''
    }

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
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.appointment-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 500;
  margin-bottom: 8px;
  color: #555;
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
}

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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

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
</style>
