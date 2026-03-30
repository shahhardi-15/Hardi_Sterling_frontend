<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import adminAPI from '@/api/admin'
import RegisterPatientModal from '@/components/RegisterPatientModal.vue'
import ViewPatientModal from '@/components/ViewPatientModal.vue'
import EditPatientModal from '@/components/EditPatientModal.vue'
import ToggleStatusConfirmation from '@/components/ToggleStatusConfirmation.vue'

const router = useRouter()
const authStore = useAuthStore()

// State
const patients = ref([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const currentPage = ref(1)
const totalPatients = ref(0)
const itemsPerPage = 10

// Modal states
const showRegisterModal = ref(false)
const showViewModal = ref(false)
const showEditModal = ref(false)
const showToggleStatusConfirmation = ref(false)
const selectedPatient = ref(null)

// Debounce search timer
let searchTimeout = null

// Computed properties
const totalPages = computed(() => Math.ceil(totalPatients.value / itemsPerPage))

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
  
  await fetchPatients()
})

// Methods
const fetchPatients = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await adminAPI.listPatients(
      authStore.token,
      currentPage.value,
      itemsPerPage,
      searchQuery.value
    )
    
    patients.value = response.data.data || []
    totalPatients.value = response.data.total || 0
  } catch (err) {
    console.error('Error fetching patients:', err)
    if (err.response?.status === 401) {
      error.value = 'Session expired. Please login again.'
      setTimeout(() => router.push('/admin/login'), 2000)
    } else {
      error.value = 'Failed to load patients. Please try again.'
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
    fetchPatients()
  }, 500)
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchPatients()
}

const onRegisterSuccess = () => {
  showRegisterModal.value = false
  currentPage.value = 1
  fetchPatients()
}

const openViewModal = async (patient) => {
  selectedPatient.value = patient
  showViewModal.value = true
}

const openEditModal = (patient) => {
  selectedPatient.value = patient
  showEditModal.value = true
}

const onEditSuccess = () => {
  showEditModal.value = false
  selectedPatient.value = null
  fetchPatients()
}

const openToggleStatusConfirmation = (patient) => {
  selectedPatient.value = patient
  showToggleStatusConfirmation.value = true
}

const onToggleStatusSuccess = () => {
  showToggleStatusConfirmation.value = false
  selectedPatient.value = null
  fetchPatients()
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const calculateAge = (dateString) => {
  if (!dateString) return '-'
  const today = new Date()
  const birthDate = new Date(dateString)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

const goToFirstPage = () => {
  if (currentPage.value > 1) {
    currentPage.value = 1
    fetchPatients()
  }
}

const goToLastPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value = totalPages.value
    fetchPatients()
  }
}

const goToPreviousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchPatients()
  }
}

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchPatients()
  }
}
</script>

<template>
  <div class="manage-patients-container">
    <!-- Header -->
    <header class="page-header">
      <div class="header-content">
        <div class="header-top">
          <h1>Manage Patients</h1>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="page-content">
      <!-- Error Alert -->
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <!-- Search and Actions Row -->
      <div class="search-actions-row">
        <div class="search-container">
          <input
            type="text"
            class="search-input"
            placeholder="Search by name, phone, or UHID..."
            @input="handleSearch"
          />
        </div>
        <button @click="showRegisterModal = true" class="btn-primary">
          Register New Patient
        </button>
      </div>

      <!-- Patient Table Section -->
      <div class="table-section">
        <div v-if="loading" class="loading-spinner">
          <div class="spinner"></div>
          <p>Loading patients...</p>
        </div>

        <div v-else-if="patients.length === 0" class="empty-state">
          <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p class="empty-message">No patients found.</p>
          <p class="empty-submessage" v-if="searchQuery">Try a different search query.</p>
          <p class="empty-submessage" v-else>Click "Register New Patient" to add a patient.</p>
        </div>

        <table v-else class="patients-table">
          <thead>
            <tr>
              <th>UHID</th>
              <th>Full Name</th>
              <th>Gender</th>
              <th>Date of Birth</th>
              <th>Phone</th>
              <th>Registration Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="patient in patients" :key="patient.id">
              <td class="uhid-cell">{{ patient.uhid || '-' }}</td>
              <td>{{ patient.full_name || '-' }}</td>
              <td>{{ patient.gender || '-' }}</td>
              <td>{{ formatDate(patient.date_of_birth) }}</td>
              <td>{{ patient.phone || '-' }}</td>
              <td>{{ formatDate(patient.registration_date) }}</td>
              <td>
                <span :class="['status-badge', patient.is_active ? 'active' : 'inactive']">
                  {{ patient.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="actions-cell">
                <button
                  @click="openViewModal(patient)"
                  class="action-btn view-btn"
                  title="View patient details"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
                <button
                  @click="openEditModal(patient)"
                  class="action-btn edit-btn"
                  title="Edit patient details"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button
                  @click="openToggleStatusConfirmation(patient)"
                  class="action-btn toggle-btn"
                  :title="patient.is_active ? 'Deactivate patient' : 'Activate patient'"
                >
                  <svg v-if="patient.is_active" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M13 16H9v4H7v-4H3v-2h4v-4h2v4h4v2z"></path>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="patients.length > 0" class="pagination-section">
        <button
          @click="goToPreviousPage"
          :disabled="currentPage === 1"
          class="btn-pagination"
        >
          ← Previous
        </button>

        <div class="page-numbers">
          <button
            v-for="page in displayPages"
            :key="page"
            @click="handlePageChange(page)"
            :class="['page-btn', page === currentPage && 'active']"
          >
            {{ page }}
          </button>
        </div>

        <div class="pagination-info">
          Page {{ currentPage }} of {{ totalPages }}
        </div>

        <button
          @click="goToNextPage"
          :disabled="currentPage === totalPages"
          class="btn-pagination"
        >
          Next →
        </button>
      </div>
    </main>

    <!-- Modals -->
    <RegisterPatientModal
      v-if="showRegisterModal"
      @close="showRegisterModal = false"
      @success="onRegisterSuccess"
    />

    <ViewPatientModal
      v-if="showViewModal && selectedPatient"
      :patient-id="selectedPatient.id"
      @close="showViewModal = false"
    />

    <EditPatientModal
      v-if="showEditModal && selectedPatient"
      :patient="selectedPatient"
      @close="showEditModal = false"
      @success="onEditSuccess"
    />

    <ToggleStatusConfirmation
      v-if="showToggleStatusConfirmation && selectedPatient"
      :patient="selectedPatient"
      @close="showToggleStatusConfirmation = false"
      @success="onToggleStatusSuccess"
    />
  </div>
</template>

<style scoped>
.manage-patients-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.page-header {
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  color: white;
  padding: 30px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.page-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

.alert {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-weight: 500;
  animation: slideIn 0.3s ease-out;
}

.alert-danger {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef5350;
}

/* Search and Actions Row */
.search-actions-row {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
  flex-wrap: wrap;
}

.search-container {
  flex: 1;
  min-width: 300px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
  background: white;
}

.search-input:focus {
  border-color: #2196F3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.btn-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-primary:hover {
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
  transform: translateY(-2px);
}

.btn-primary:active {
  transform: translateY(0);
}

/* Table Section */
.table-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
  margin-bottom: 24px;
}

.loading-spinner {
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
  border-top: 4px solid #2196F3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-spinner p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

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
  color: #ccc;
  margin-bottom: 16px;
}

.empty-message {
  font-size: 16px;
  font-weight: 600;
  color: #666;
  margin: 0 0 8px 0;
}

.empty-submessage {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.patients-table {
  width: 100%;
  border-collapse: collapse;
}

.patients-table thead {
  background-color: #f5f5f5;
  border-bottom: 2px solid #e0e0e0;
}

.patients-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.patients-table td {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  font-size: 14px;
  color: #666;
}

.patients-table tbody tr {
  transition: background-color 0.2s ease;
}

.patients-table tbody tr:hover {
  background-color: #f9f9f9;
}

.uhid-cell {
  font-weight: 600;
  color: #333;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
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
  align-items: center;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  background-color: #f0f0f0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

.action-btn.view-btn {
  color: #1976d2;
}

.action-btn.view-btn:hover {
  background-color: #e3f2fd;
}

.action-btn.edit-btn {
  color: #f57c00;
}

.action-btn.edit-btn:hover {
  background-color: #fff3e0;
}

.action-btn.toggle-btn {
  color: #388e3c;
}

.action-btn.toggle-btn:hover {
  background-color: #e8f5e9;
}

/* Pagination */
.pagination-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 24px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-pagination {
  padding: 8px 16px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  color: #333;
}

.btn-pagination:hover:not(:disabled) {
  background-color: #e0e0e0;
  border-color: #999;
}

.btn-pagination:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  color: #333;
}

.page-btn:hover {
  background-color: #f0f0f0;
  border-color: #999;
}

.page-btn.active {
  background-color: #2196F3;
  color: white;
  border-color: #2196F3;
}

.pagination-info {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .search-actions-row {
    flex-direction: column;
  }

  .search-container {
    width: 100%;
    min-width: unset;
  }

  .btn-primary {
    width: 100%;
  }

  .patients-table {
    font-size: 12px;
  }

  .patients-table th,
  .patients-table td {
    padding: 8px 12px;
  }

  .actions-cell {
    gap: 4px;
  }

  .action-btn {
    width: 32px;
    height: 32px;
  }

  .action-btn svg {
    width: 16px;
    height: 16px;
  }

  .pagination-section {
    gap: 8px;
  }
}
</style>
