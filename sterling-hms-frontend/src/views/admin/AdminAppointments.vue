<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import adminAPI from '@/api/admin'
import AdminLayout from '@/components/admin/AdminLayout.vue'

const router = useRouter()
const authStore = useAuthStore()

// State
const appointments = ref([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const filterStatus = ref('all')
const currentPage = ref(1)
const totalAppointments = ref(0)
const itemsPerPage = 10

// Debounce search timer
let searchTimeout = null

// Computed properties
const totalPages = computed(() => Math.ceil(totalAppointments.value / itemsPerPage))

const displayPages = computed(() => {
  const arr = []
  const maxPagesToShow = 5
  let startPage = Math.max(1, currentPage.value - Math.floor(maxPagesToShow / 2))
  let endPage = Math.min(totalPages.value, startPage + maxPagesToShow - 1)
  
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1)
  }
  
  for (let i = startPage; i <= endPage; i++) {
    arr.push(i)
  }
  return arr
})

// Lifecycle
onMounted(async () => {
  authStore.initializeAuth()
  
  if (!authStore.isAdmin) {
    router.push('/login')
    return
  }
  
  if (!authStore.token) {
    error.value = 'Session expired. Please login again.'
    setTimeout(() => router.push('/admin/login'), 2000)
    return
  }
  
  await fetchAppointments()
})

// Methods
const fetchAppointments = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await adminAPI.listAppointments(
      authStore.token,
      currentPage.value,
      itemsPerPage,
      searchQuery.value,
      filterStatus.value
    )
    
    appointments.value = response.data.data || []
    totalAppointments.value = response.data.total || 0
  } catch (err) {
    console.error('Error fetching appointments:', err)
    if (err.response?.status === 401) {
      error.value = 'Session expired. Please login again.'
      setTimeout(() => router.push('/admin/login'), 2000)
    } else {
      error.value = 'Failed to load appointments. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

const handleSearch = (event) => {
  searchQuery.value = event.target.value
  currentPage.value = 1
  
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchAppointments()
  }, 500)
}

const handleStatusFilter = (status) => {
  filterStatus.value = status
  currentPage.value = 1
  fetchAppointments()
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchAppointments()
}

const goToFirstPage = () => {
  if (currentPage.value > 1) {
    currentPage.value = 1
    fetchAppointments()
  }
}

const goToLastPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value = totalPages.value
    fetchAppointments()
  }
}

const goToPreviousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchAppointments()
  }
}

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchAppointments()
  }
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusBadgeClass = (status) => {
  const statusMap = {
    'scheduled': 'status-scheduled',
    'completed': 'status-completed',
    'cancelled': 'status-cancelled',
    'pending': 'status-pending'
  }
  return statusMap[status?.toLowerCase()] || 'status-default'
}
</script>

<template>
  <AdminLayout>
    <div class="appointments-container">
      <!-- Error Alert -->
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <!-- Page Header Section -->
      <div class="page-header-section">
        <div class="header-left">
          <h1 class="page-title">View Appointments</h1>
          <p class="page-subtitle">Monitor and manage all hospital appointments.</p>
        </div>
      </div>

      <!-- Filter and Search Section -->
      <div class="filter-section">
        <div class="search-container">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            class="search-input"
            placeholder="Search by patient, doctor, or appointment ID..."
            :value="searchQuery"
            @input="handleSearch"
          />
        </div>

        <div class="status-filters">
          <button
            :class="['filter-btn', { active: filterStatus === 'all' }]"
            @click="handleStatusFilter('all')"
          >
            All
          </button>
          <button
            :class="['filter-btn', { active: filterStatus === 'scheduled' }]"
            @click="handleStatusFilter('scheduled')"
          >
            Scheduled
          </button>
          <button
            :class="['filter-btn', { active: filterStatus === 'completed' }]"
            @click="handleStatusFilter('completed')"
          >
            Completed
          </button>
          <button
            :class="['filter-btn', { active: filterStatus === 'cancelled' }]"
            @click="handleStatusFilter('cancelled')"
          >
            Cancelled
          </button>
        </div>
      </div>

      <!-- Appointments Table Container -->
      <div class="appointments-table-container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
          <p>Loading appointments...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="appointments.length === 0" class="empty-state">
          <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <p class="empty-message">No appointments found.</p>
        </div>

        <!-- Appointments Table -->
        <table v-else class="appointments-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Department</th>
              <th>Date & Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="appointment in appointments" :key="appointment.id">
              <td>{{ appointment.patient_name || '-' }}</td>
              <td>{{ appointment.doctor_name || '-' }}</td>
              <td>{{ appointment.department_name || '-' }}</td>
              <td>{{ formatDateTime(appointment.appointment_date) }}</td>
              <td>
                <span :class="['status-badge', getStatusBadgeClass(appointment.status)]">
                  {{ appointment.status || '-' }}
                </span>
              </td>
              <td class="actions-cell">
                <button class="action-btn" title="View details">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div v-if="!loading && appointments.length > 0" class="pagination">
          <button
            @click="goToFirstPage"
            class="pagination-btn"
            :disabled="currentPage === 1"
          >
            First
          </button>
          <button
            @click="goToPreviousPage"
            class="pagination-btn"
            :disabled="currentPage === 1"
          >
            Previous
          </button>

          <span class="pagination-info">
            Page {{ currentPage }} of {{ totalPages }}
          </span>

          <button
            @click="goToNextPage"
            class="pagination-btn"
            :disabled="currentPage === totalPages"
          >
            Next
          </button>
          <button
            @click="goToLastPage"
            class="pagination-btn"
            :disabled="currentPage === totalPages"
          >
            Last
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.appointments-container {
  min-height: 100%;
}

/* Alert */
.alert {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-weight: 500;
}

.alert-danger {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef5350;
}

/* Page Header Section */
.page-header-section {
  margin-bottom: 32px;
}

.header-left {
  flex: 1;
  text-align: left;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1A2B4A;
  margin: 0 0 8px 0;
  padding: 0;
  text-align: left;
}

.page-subtitle {
  font-size: 14px;
  color: #718096;
  line-height: 1.6;
  margin: 0;
  text-align: left;
}

/* Filter Section */
.filter-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  align-items: center;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 0 14px;
  height: 40px;
  flex: 1;
  min-width: 200px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.search-icon {
  width: 16px;
  height: 16px;
  color: #A0AEC0;
  flex-shrink: 0;
}

.search-input {
  background: transparent;
  border: none;
  font-size: 14px;
  color: #2D3748;
  width: 100%;
  outline: none;
}

.search-input::placeholder {
  color: #A0AEC0;
}

.status-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  background: white;
  color: #4A5568;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  border-color: #1B5E8F;
  color: #1B5E8F;
}

.filter-btn.active {
  background: #1B5E8F;
  color: white;
  border-color: #1B5E8F;
}

/* Appointments Table Container */
.appointments-table-container {
  background: white;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* Appointments Table */
.appointments-table {
  width: 100%;
  border-collapse: collapse;
}

.appointments-table thead {
  background: #F7F9FC;
  border-bottom: 1px solid #E2E8F0;
}

.appointments-table th {
  padding: 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.appointments-table tbody tr {
  border-bottom: 1px solid #F0F4F8;
  transition: background 0.15s ease;
}

.appointments-table tbody tr:hover {
  background: #F7F9FC;
}

.appointments-table td {
  padding: 16px;
  font-size: 14px;
  color: #2D3748;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-scheduled {
  background: #DBEAFE;
  color: #1E40AF;
}

.status-completed {
  background: #DCFCE7;
  color: #166534;
}

.status-cancelled {
  background: #FEE2E2;
  color: #991B1B;
}

.status-pending {
  background: #FEF9C3;
  color: #854D0E;
}

.status-default {
  background: #F3F4F6;
  color: #6B7280;
}

.actions-cell {
  text-align: center;
}

.action-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #718096;
  transition: color 0.2s ease;
  border-radius: 6px;
}

.action-btn:hover {
  color: #1B5E8F;
  background: #F0F4F8;
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1B5E8F;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p {
  color: #718096;
  font-size: 14px;
  margin: 0;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: #cbd5e0;
  margin-bottom: 16px;
}

.empty-message {
  font-size: 16px;
  font-weight: 600;
  color: #718096;
  margin: 0;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 20px;
  border-top: 1px solid #E2E8F0;
}

.pagination-btn {
  padding: 8px 12px;
  background: white;
  color: #4A5568;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #1B5E8F;
  background: #F0F4F8;
  color: #1B5E8F;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 13px;
  color: #718096;
  padding: 0 8px;
}
</style>
