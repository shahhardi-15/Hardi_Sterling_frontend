<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import adminAPI from '@/api/admin'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import AddDoctorModal from '@/components/admin/doctors/AddDoctorModal.vue'
import ViewDoctorModal from '@/components/admin/doctors/ViewDoctorModal.vue'
import EditDoctorModal from '@/components/admin/doctors/EditDoctorModal.vue'
import ConfirmDoctorStatusModal from '@/components/admin/doctors/ConfirmDoctorStatusModal.vue'

const router = useRouter()
const authStore = useAuthStore()

// State
const doctors = ref([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const currentPage = ref(1)
const totalDoctors = ref(0)
const itemsPerPage = 10

// Modal states
const showAddModal = ref(false)
const showViewModal = ref(false)
const showEditModal = ref(false)
const showToggleStatusModal = ref(false)
const selectedDoctor = ref(null)

// Debounce search timer
let searchTimeout = null

// Computed properties
const totalPages = computed(() => Math.ceil(totalDoctors.value / itemsPerPage))

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
  
  await fetchDoctors()
})

// Methods
const fetchDoctors = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await adminAPI.listDoctors(
      authStore.token,
      currentPage.value,
      itemsPerPage,
      searchQuery.value
    )
    
    doctors.value = response.data.data || []
    totalDoctors.value = response.data.total || 0
  } catch (err) {
    console.error('Error fetching doctors:', err)
    if (err.response?.status === 401) {
      error.value = 'Session expired. Please login again.'
      setTimeout(() => router.push('/admin/login'), 2000)
    } else {
      error.value = 'Failed to load doctors. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

const handleSearch = (event) => {
  searchQuery.value = event.target.value
  currentPage.value = 1
  
  // Debounce search
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchDoctors()
  }, 500)
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchDoctors()
}

const onAddSuccess = () => {
  showAddModal.value = false
  currentPage.value = 1
  fetchDoctors()
}

const openViewModal = async (doctor) => {
  selectedDoctor.value = doctor
  showViewModal.value = true
}

const openEditModal = (doctor) => {
  selectedDoctor.value = doctor
  showEditModal.value = true
}

const onEditSuccess = () => {
  showEditModal.value = false
  selectedDoctor.value = null
  fetchDoctors()
}

const openToggleStatusModal = (doctor) => {
  selectedDoctor.value = doctor
  showToggleStatusModal.value = true
}

const onToggleStatusSuccess = () => {
  showToggleStatusModal.value = false
  selectedDoctor.value = null
  fetchDoctors()
}

const goToFirstPage = () => {
  if (currentPage.value > 1) {
    currentPage.value = 1
    fetchDoctors()
  }
}

const goToLastPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value = totalPages.value
    fetchDoctors()
  }
}

// Helper methods
const getInitials = (name) => {
  if (!name) return 'DR'
  const parts = name.split(' ')
  return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2)
}

const getSpecializationClass = (specialization) => {
  if (!specialization) return 'default'
  const spec = specialization.toLowerCase()
  if (spec.includes('cardio')) return 'cardiology'
  if (spec.includes('neuro')) return 'neurology'
  if (spec.includes('pediatric')) return 'pediatrics'
  if (spec.includes('ortho')) return 'orthopedics'
  return 'default'
}

const formatNumber = (num) => {
  if (!num) return 0
  return num.toLocaleString('en-IN')
}

const goToPreviousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchDoctors()
  }
}

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchDoctors()
  }
}
</script>

<template>
  <AdminLayout>
    <div class="manage-doctors-container">
      <!-- Error Alert -->
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <!-- Page Header -->
      <header class="page-header">
        <div class="header-left">
          <h1 class="page-title">Manage Doctors</h1>
          <p class="page-subtitle">Oversee clinical staff, schedules, and professional credentials.</p>
        </div>
        <button @click="showAddModal = true" class="btn-add-doctor">
          <svg class="icon-plus" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"></path>
          </svg>
          Add New Doctor
        </button>
      </header>

      <!-- Active Practitioners Stats Card -->
      <div class="stats-card">
        <h3 class="stats-title">Active Practitioners</h3>
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-number">{{ totalDoctors }}</div>
            <div class="stat-label">Total Doctors</div>
          </div>
          <div class="stat-divider"></div>
          
          <div class="stat-item">
            <div class="stat-number">{{ doctors.filter(d => d.is_active).length }}</div>
            <div class="stat-label">On Duty</div>
          </div>
          <div class="stat-divider"></div>
          
          <div class="stat-item">
            <div class="stat-number">98%</div>
            <div class="stat-label">Patient Satisfaction</div>
          </div>
        </div>
      </div>

      <!-- Doctors Table Section -->
      <div class="table-container">
        <div v-if="loading" class="loading-spinner">
          <div class="spinner"></div>
          <p>Loading doctors...</p>
        </div>

        <div v-else-if="doctors.length === 0" class="empty-state">
          <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p class="empty-message">No doctors registered yet.</p>
          <p class="empty-submessage">Click "Add New Doctor" to add one.</p>
        </div>

        <template v-else>
          <div class="table-wrapper">
            <table class="doctors-table">
              <thead>
                <tr>
                  <th class="th-doctor-name">Doctor Name</th>
                  <th class="th-specialization">Specialization</th>
                  <th class="th-qualification">Qualification</th>
                  <th class="th-experience">Experience</th>
                  <th class="th-fee">Fee</th>
                  <th class="th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="doctor in doctors" :key="doctor.id" class="doctor-row">
                  <!-- Doctor Name Column -->
                  <td class="td-doctor-name">
                    <div class="doctor-info">
                      <div v-if="doctor.photo_url" class="doctor-avatar">
                        <img :src="doctor.photo_url" :alt="doctor.full_name" />
                      </div>
                      <div v-else class="doctor-avatar-initials">
                        {{ getInitials(doctor.full_name) }}
                      </div>
                      <div class="doctor-text">
                        <div class="doctor-name">{{ doctor.full_name || '-' }}</div>
                        <div class="doctor-id">ID: {{ doctor.doctor_id || 'N/A' }}</div>
                      </div>
                    </div>
                  </td>

                  <!-- Specialization Column -->
                  <td class="td-specialization">
                    <span :class="['specialization-badge', getSpecializationClass(doctor.specialization)]">
                      {{ doctor.specialization || '-' }}
                    </span>
                  </td>

                  <!-- Qualification Column -->
                  <td class="td-qualification">
                    {{ doctor.qualification || '-' }}
                  </td>

                  <!-- Experience Column -->
                  <td class="td-experience">
                    {{ doctor.experience_years || 0 }} Yrs
                  </td>

                  <!-- Fee Column -->
                  <td class="td-fee">
                    ₹{{ formatNumber(doctor.consultation_fee) || 0 }}
                  </td>

                  <!-- Actions Column -->
                  <td class="td-actions">
                    <button
                      @click="openViewModal(doctor)"
                      class="action-link view-link"
                      title="View doctor details"
                    >
                      View
                    </button>
                    <span class="action-separator">|</span>
                    <button
                      @click="openEditModal(doctor)"
                      class="action-link edit-link"
                      title="Edit doctor details"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Showing X of Y doctors -->
          <div class="table-footer">
            Showing {{ doctors.length }} of {{ totalDoctors }} doctors
          </div>
        </template>
      </div>

      <!-- Pagination -->
      <div v-if="!loading && doctors.length > 0" class="pagination">
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

    <!-- Modals -->
    <AddDoctorModal
      v-if="showAddModal"
      @close="showAddModal = false"
      @success="onAddSuccess"
    />

    <ViewDoctorModal
      v-if="showViewModal"
      :doctor="selectedDoctor"
      @close="showViewModal = false"
    />

    <EditDoctorModal
      v-if="showEditModal"
      :doctor="selectedDoctor"
      @close="showEditModal = false"
      @success="onEditSuccess"
    />

    <ConfirmDoctorStatusModal
      v-if="showToggleStatusModal"
      :doctor="selectedDoctor"
      @close="showToggleStatusModal = false"
      @success="onToggleStatusSuccess"
    />
  </AdminLayout>
</template>

<style scoped>
.manage-doctors-container {
  background: #F5F7FA;
  padding: 32px 28px;
  min-height: 100vh;
}

/* Error Alert */
.alert {
  padding: 12px 20px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
}

.alert-danger {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.header-left {
  text-align: left;
}

.header-left h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #1A2B4A;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #1A2B4A;
  text-align: left;
}

.page-subtitle {
  margin: 0;
  font-size: 14px;
  color: #718096;
  line-height: 1.6;
  text-align: left;
}

.btn-add-doctor {
  background: #1B3A6B;
  color: white;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-add-doctor:hover {
  background: #152D54;
  transform: translateY(-1px);
}

.icon-plus {
  width: 18px;
  height: 18px;
}

/* Stats Card */
.stats-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  padding: 24px 28px;
  margin-bottom: 28px;
}

.stats-title {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 700;
  color: #1A2B4A;
}

.stats-row {
  display: flex;
  align-items: center;
  gap: 0;
}

.stat-item {
  flex: 1;
}

.stat-number {
  font-size: 36px;
  font-weight: 700;
  color: #1A2B4A;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 11px;
  font-weight: 600;
  color: #A0AEC0;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.stat-divider {
  width: 1px;
  height: 48px;
  background: #E2E8F0;
  margin: 0 32px;
}

/* Table Container */
.table-container {
  background: white;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
  margin-bottom: 16px;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1B3A6B;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: #ccc;
  margin-bottom: 12px;
}

.empty-message {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.empty-submessage {
  font-size: 14px;
  color: #999;
  margin: 0;
}

/* Table Wrapper */
.table-wrapper {
  overflow-x: auto;
}

.doctors-table {
  width: 100%;
  border-collapse: collapse;
}

/* Table Header */
.doctors-table thead {
  background: #F7F9FC;
  border-bottom: 1px solid #E2E8F0;
}

.doctors-table thead tr {
  display: grid;
  grid-template-columns: 2.5fr 1.5fr 1.5fr 1fr 1fr 1fr;
  gap: 16px;
  align-items: center;
  padding: 12px 24px;
}

.doctors-table th {
  font-size: 11px;
  font-weight: 600;
  color: #A0AEC0;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-align: left;
  padding: 0;
  border: none;
  margin: 0;
}

/* Table Body */
.doctor-row {
  display: grid;
  grid-template-columns: 2.5fr 1.5fr 1.5fr 1fr 1fr 1fr;
  gap: 16px;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #F0F4F8;
  transition: background-color 0.2s ease;
}

.doctor-row:hover {
  background-color: #F7F9FC;
}

.doctor-row td {
  padding: 0;
  margin: 0;
  border: none;
}

.doctor-row:last-child {
  border-bottom: none;
}

/* Doctor Name Column */
.td-doctor-name {
  display: contents;
}

.doctor-info {
  display: flex;
  align-items: center;
  gap: 14px;
  grid-column: 1;
}

.doctor-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.doctor-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.doctor-avatar-initials {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #DBEAFE;
  color: #1B5E8F;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.doctor-text {
  display: flex;
  flex-direction: column;
}

.doctor-name {
  font-size: 14px;
  font-weight: 600;
  color: #1A2B4A;
  margin-bottom: 2px;
}

.doctor-id {
  font-size: 12px;
  color: #A0AEC0;
}

/* Specialization Column */
.td-specialization {
  grid-column: 2;
}

.specialization-badge {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
}

.specialization-badge.default {
  background: #DBEAFE;
  color: #1E40AF;
}

.specialization-badge.cardiology {
  background: #FFE4E6;
  color: #9F1239;
}

.specialization-badge.neurology {
  background: #DCFCE7;
  color: #166534;
}

.specialization-badge.pediatrics {
  background: #FEF9C3;
  color: #854D0E;
}

.specialization-badge.orthopedics {
  background: #F3E8FF;
  color: #6B21A8;
}

/* Qualification Column */
.td-qualification {
  grid-column: 3;
  font-size: 14px;
  color: #2D3748;
}

/* Experience Column */
.td-experience {
  grid-column: 4;
  font-size: 14px;
  color: #2D3748;
}

/* Fee Column */
.td-fee {
  grid-column: 5;
  font-size: 14px;
  color: #2D3748;
}

/* Actions Column */
.td-actions {
  grid-column: 6;
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-link {
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 600;
  color: #1B5E8F;
  cursor: pointer;
  padding: 0;
  text-decoration: none;
  transition: text-decoration 0.2s ease;
}

.action-link:hover {
  text-decoration: underline;
}

.action-link.view-link {
  color: #1B5E8F;
}

.action-link.edit-link {
  color: #1B5E8F;
}

.action-separator {
  color: #E2E8F0;
  margin: 0 4px;
}

/* Table Footer */
.table-footer {
  padding: 14px 24px;
  font-size: 13px;
  color: #A0AEC0;
  border-top: 1px solid #F0F4F8;
  background: white;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
}

.pagination-btn {
  padding: 8px 16px;
  background-color: white;
  border: 1px solid #E2E8F0;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #718096;
  font-weight: 500;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #1B3A6B;
  color: white;
  border-color: #1B3A6B;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #718096;
  font-weight: 600;
  min-width: 140px;
  text-align: center;
}
</style>
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: #ccc;
  margin-bottom: 12px;
}

.empty-message {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.empty-submessage {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.doctors-table {
  width: 100%;
  border-collapse: collapse;
}

.doctors-table thead {
  background-color: #f5f5f5;
  border-bottom: 2px solid #eee;
}

.doctors-table th {
  padding: 16px 20px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.doctors-table tbody tr {
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
}

.doctors-table tbody tr:hover {
  background-color: #f9f9f9;
}

.doctors-table td {
  padding: 16px 20px;
  font-size: 14px;
  color: #333;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.active {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-badge.inactive {
  background-color: #ffebee;
  color: #c62828;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.view-btn {
  color: #2196F3;
}

.view-btn:hover {
  background-color: rgba(33, 150, 243, 0.1);
  color: #1976D2;
}

.edit-btn {
  color: #ff9800;
}

.edit-btn:hover {
  background-color: rgba(255, 152, 0, 0.1);
  color: #f57c00;
}

.toggle-btn {
  color: #4caf50;
}

.toggle-btn:hover {
  background-color: rgba(76, 175, 80, 0.1);
  color: #388e3c;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  background-color: #f9f9f9;
  border-top: 1px solid #eee;
}

.pagination-btn {
  padding: 8px 16px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #2196F3;
  color: white;
  border-color: #2196F3;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #666;
  font-weight: 600;
  min-width: 140px;
  text-align: center;
}
</style>
