<template>
  <div class="doctor-appointments-section">
    <h2 class="section-title">Your Appointments</h2>

    <div v-if="loading" class="loading">
      <p>Loading appointments...</p>
    </div>

    <div v-else-if="doctorStore.appointments.length === 0" class="no-data">
      <p>No appointments found.</p>
    </div>

    <div v-else class="appointments-container">
      <!-- Filters -->
      <div class="filters">
        <select v-model="selectedStatus" class="filter-select">
          <option value="">All Statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no-show">No Show</option>
        </select>
      </div>

      <!-- Table View -->
      <table v-if="filteredAppointments.length > 0" class="appointments-table">
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>Date</th>
            <th>Time</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="appointment in filteredAppointments" :key="appointment.id" :class="`status-${appointment.status}`">
            <td>{{ appointment.patientName }}</td>
            <td>{{ formatDate(appointment.appointmentDate) }}</td>
            <td>{{ appointment.timeSlot }}</td>
            <td>{{ appointment.reason }}</td>
            <td>
              <span :class="['status-badge', `badge-${appointment.status}`]">
                {{ formatStatus(appointment.status) }}
              </span>
            </td>
            <td class="actions">
              <button 
                v-if="appointment.status === 'upcoming'"
                @click="selectAppointmentForUpdate(appointment)"
                class="btn-action"
              >
                Update
              </button>
              <span v-else class="text-muted">-</span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- No results after filtering -->
      <div v-else class="no-results">
        <p>No appointments match the selected filter</p>
      </div>

      <!-- Error -->
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <!-- Success -->
      <div v-if="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>
    </div>

    <!-- Update Modal -->
    <div v-if="selectedAppointment" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Update Appointment Status</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <div class="appointment-info">
            <p><strong>Patient:</strong> {{ selectedAppointment.patientName }}</p>
            <p><strong>Date:</strong> {{ formatDate(selectedAppointment.appointmentDate) }}</p>
            <p><strong>Time:</strong> {{ selectedAppointment.timeSlot }}</p>
            <p><strong>Reason:</strong> {{ selectedAppointment.reason }}</p>
            <p><strong>Current Status:</strong> 
              <span :class="['status-badge', `badge-${selectedAppointment.status}`]">
                {{ formatStatus(selectedAppointment.status) }}
              </span>
            </p>
          </div>

          <div class="form-group">
            <label>New Status</label>
            <select v-model="updateForm.status" class="form-input">
              <option value="">Select Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>
          </div>

          <div class="form-group">
            <label>Notes (Optional)</label>
            <textarea 
              v-model="updateForm.notes" 
              rows="3"
              placeholder="Add any notes about this appointment..."
              class="form-input"
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button 
            @click="handleUpdateStatus"
            :disabled="!updateForm.status || doctorStore.loading"
            class="btn btn-primary"
          >
            {{ doctorStore.loading ? 'Updating...' : 'Update Status' }}
          </button>
          <button @click="closeModal" class="btn btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDoctorStore } from '@/stores/doctor'

const doctorStore = useDoctorStore()

const loading = ref(false)
const error = ref('')
const successMessage = ref('')
const selectedStatus = ref('')
const selectedAppointment = ref(null)
const updateForm = ref({ status: '', notes: '' })

const filteredAppointments = computed(() => {
  let filtered = doctorStore.appointments

  if (selectedStatus.value) {
    filtered = filtered.filter(apt => apt.status === selectedStatus.value)
  }

  return filtered
})

const loadAppointments = async () => {
  try {
    loading.value = true
    error.value = ''
    await doctorStore.getAppointments()
  } catch (err) {
    error.value = 'Failed to load appointments'
    console.error('Error loading appointments:', err)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadAppointments()
})

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatStatus = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const selectAppointmentForUpdate = (appointment) => {
  selectedAppointment.value = { ...appointment }
  updateForm.value = { status: '', notes: '' }
}

const closeModal = () => {
  selectedAppointment.value = null
  updateForm.value = { status: '', notes: '' }
  error.value = ''
}

const handleUpdateStatus = async () => {
  if (!selectedAppointment.value || !updateForm.value.status) {
    error.value = 'Please select a status'
    return
  }

  try {
    error.value = ''
    successMessage.value = ''

    await doctorStore.updateAppointmentStatus(
      selectedAppointment.value.id,
      updateForm.value.status,
      updateForm.value.notes
    )

    successMessage.value = 'Appointment status updated successfully'
    setTimeout(() => {
      closeModal()
      successMessage.value = ''
      loadAppointments()
    }, 1500)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to update appointment'
  }
}
</script>

<style scoped>
.doctor-appointments-section {
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

.loading {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.no-data {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.appointments-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.appointments-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}

.appointments-table thead {
  background-color: #f5f5f5;
  border-bottom: 2px solid #ddd;
}

.appointments-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #333;
  font-size: 13px;
}

.appointments-table tbody tr {
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
}

.appointments-table tbody tr:hover {
  background-color: #f9f9f9;
}

.appointments-table td {
  padding: 12px;
  color: #666;
  font-size: 14px;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.badge-upcoming {
  background-color: #fff3e0;
  color: #e65100;
}

.badge-completed {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.badge-cancelled {
  background-color: #ffebee;
  color: #c62828;
}

.badge-no-show {
  background-color: #f3e5f5;
  color: #6a1b9a;
}

.actions {
  text-align: center;
}

.btn-action {
  padding: 6px 12px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-action:hover {
  background-color: #1976D2;
}

.text-muted {
  color: #ccc;
}

.no-results {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.alert {
  padding: 12px 16px;
  border-radius: 6px;
  margin-top: 16px;
}

.alert-danger {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef5350;
}

.alert-success {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #81c784;
}

/* Modal Styles */
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
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #999;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.appointment-info {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.appointment-info p {
  margin: 8px 0;
  font-size: 14px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #eee;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #2196F3;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1976D2;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background-color: #eee;
}
</style>
