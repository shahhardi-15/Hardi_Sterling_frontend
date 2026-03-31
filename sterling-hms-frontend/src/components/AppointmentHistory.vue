<template>
  <div class="appointment-history-section">
    <h2 class="section-title">Appointment History</h2>

    <div v-if="loading" class="loading">
      <p>Loading appointments...</p>
    </div>

    <div v-else-if="appointmentStore.appointments.length === 0" class="no-data">
      <p>No appointments found. <router-link to="#" class="link">Book your first appointment</router-link></p>
    </div>

    <div v-else class="appointments-container">
      <!-- Filters -->
      <div class="filters">
        <select v-model="selectedStatus" class="filter-select">
          <option value="">All Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="pending">Pending Approval</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no-show">No Show</option>
        </select>
      </div>

      <!-- Table View (Desktop) -->
      <table v-if="filteredAppointments.length > 0" class="appointments-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Doctor</th>
            <th>Specialization</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="appointment in filteredAppointments" :key="appointment.id" :class="`status-${appointment.status}`">
            <td>{{ formatDate(appointment.appointmentDate) }}</td>
            <td>{{ formatTimeSlot(appointment.timeSlot) }}</td>
            <td>{{ appointment.doctor.name }}</td>
            <td>{{ appointment.doctor.specialization }}</td>
            <td>{{ appointment.reason }}</td>
            <td>
              <div class="status-with-tooltip">
                <span :class="['status-badge', `badge-${appointment.status}`]">
                  {{ formatStatus(appointment.status) }}
                </span>
                <span 
                  v-if="appointment.status === 'cancelled' && appointment.disapprovalReason"
                  class="info-icon"
                  :title="`Reason: ${appointment.disapprovalReason}`"
                >
                  ℹ
                </span>
              </div>
            </td>
            <td class="actions">
              <button 
                v-if="appointment.status === 'scheduled'"
                @click="cancelAppointment(appointment.id)"
                :disabled="cancelling === appointment.id"
                class="btn-cancel"
              >
                {{ cancelling === appointment.id ? 'Cancelling...' : 'Cancel' }}
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

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          :disabled="currentPage === 1"
          @click="currentPage = Math.max(1, currentPage - 1)"
          class="pagination-btn"
        >
          Previous
        </button>
        <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
        <button 
          :disabled="currentPage === totalPages"
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          class="pagination-btn"
        >
          Next
        </button>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAppointmentStore } from '@/stores/appointment'

const appointmentStore = useAppointmentStore()

const loading = ref(false)
const error = ref('')
const successMessage = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const cancelling = ref(null)

const filteredAppointments = computed(() => {
  let filtered = appointmentStore.appointments

  if (selectedStatus.value) {
    filtered = filtered.filter(apt => apt.status === selectedStatus.value)
  }

  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(appointmentStore.totalAppointments / itemsPerPage)
})

// Function to load appointment history
const loadAppointmentHistory = async () => {
  try {
    loading.value = true
    error.value = ''
    await appointmentStore.getHistory(currentPage.value, itemsPerPage)
  } catch (err) {
    error.value = 'Failed to load appointments'
    console.error('Error loading appointments:', err)
  } finally {
    loading.value = false
  }
}

// Load appointments on mount
onMounted(async () => {
  await loadAppointmentHistory()
})

// Watch for page changes and reload data
watch(currentPage, async () => {
  await loadAppointmentHistory()
})

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('en-US', options)
}

const formatStatus = (status) => {
  const statusMap = {
    'scheduled': 'Scheduled',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'no-show': 'No Show',
    'pending': 'Pending Approval'
  }
  return statusMap[status] || status
}

const formatTimeSlot = (time24h) => {
  const [hours, minutes] = time24h.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour)
  return `${displayHour}:${minutes} ${ampm}`
}

const cancelAppointment = async (appointmentId) => {
  if (!confirm('Are you sure you want to cancel this appointment?')) {
    return
  }

  try {
    cancelling.value = appointmentId
    error.value = ''
    await appointmentStore.cancelAppointment(appointmentId)
    successMessage.value = 'Appointment cancelled successfully'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to cancel appointment'
  } finally {
    cancelling.value = null
  }
}
</script>

<style scoped>
.appointment-history-section {
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

.no-data,
.no-results {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.link {
  color: #2196F3;
  text-decoration: none;
  font-weight: 600;
}

.link:hover {
  text-decoration: underline;
}

.filters {
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
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
  margin-bottom: 20px;
}

.appointments-table thead {
  background: #f9f9f9;
  border-bottom: 2px solid #eee;
}

.appointments-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #555;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.appointments-table td {
  padding: 14px 12px;
  border-bottom: 1px solid #eee;
  font-size: 13px;
}

.appointments-table tbody tr:hover {
  background: #f9f9f9;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge-scheduled {
  background: #e3f2fd;
  color: #1976d2;
}

.badge-completed {
  background: #e8f5e9;
  color: #388e3c;
}

.badge-pending {
  background: #fff3e0;
  color: #f57c00;
}

.badge-cancelled {
  background: #ffebee;
  color: #c62828;
}

.badge-no-show {
  background: #fff3e0;
  color: #f57c00;
}

.status-with-tooltip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #f0f0f0;
  color: #666;
  font-size: 12px;
  font-weight: bold;
  cursor: help;
  border: 1px solid #ddd;
  transition: all 0.2s;
}

.info-icon:hover {
  background: #e0e0e0;
  border-color: #999;
}

.actions {
  text-align: center;
}

.btn-cancel {
  padding: 6px 12px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover:not(:disabled) {
  background: #c82333;
}

.btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.text-muted {
  color: #999;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
}

.pagination-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #2196F3;
  color: #2196F3;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 13px;
  color: #666;
}

.alert {
  padding: 12px;
  border-radius: 4px;
  font-size: 13px;
  margin-top: 16px;
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
</style>
