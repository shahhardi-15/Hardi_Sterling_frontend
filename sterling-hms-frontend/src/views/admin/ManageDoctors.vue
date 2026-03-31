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
      <!-- Header -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-top">
            <h1>Manage Doctors</h1>
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
            placeholder="Search by name, specialization, or registration number..."
            @input="handleSearch"
          />
        </div>
        <button @click="showAddModal = true" class="btn-primary">
          Add New Doctor
        </button>
      </div>

      <!-- Doctor Table Section -->
      <div class="table-section">
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

        <table v-else class="doctors-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Specialization</th>
              <th>Qualification</th>
              <th>Experience</th>
              <th>Consultation Fee</th>
              <th>Department</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="doctor in doctors" :key="doctor.id">
              <td>{{ doctor.full_name || '-' }}</td>
              <td>{{ doctor.specialization || '-' }}</td>
              <td>{{ doctor.qualification || '-' }}</td>
              <td>{{ doctor.experience_years || 0 }} years</td>
              <td>₹{{ doctor.consultation_fee || 0 }}</td>
              <td>{{ doctor.department_name || '-' }}</td>
              <td>
                <span :class="['status-badge', doctor.is_active ? 'active' : 'inactive']">
                  {{ doctor.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="actions-cell">
                <button
                  @click="openViewModal(doctor)"
                  class="action-btn view-btn"
                  title="View doctor details"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
                <button
                  @click="openEditModal(doctor)"
                  class="action-btn edit-btn"
                  title="Edit doctor details"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button
                  @click="openToggleStatusModal(doctor)"
                  class="action-btn toggle-btn"
                  :title="doctor.is_active ? 'Deactivate doctor' : 'Activate doctor'"
                >
                  <svg v-if="doctor.is_active" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M13 13h3v3h-3v-3zm0-8h3v3h-3V5zm1.5-2a10.5 10.5 0 1 0 0 21 10.5 10.5 0 0 0 0-21z"></path>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

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
    </main>

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
    </div>
  </AdminLayout>
</template>

<style scoped>
.manage-doctors-container {
  min-height: 100%;
}

.page-header {
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  color: white;
  padding: 24px 0;
  margin: -32px -28px 24px -28px;
  padding: 24px 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: none;
  margin: 0;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
}

.page-content {
  max-width: none;
  margin: 0;
  padding: 0;
}

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

.search-actions-row {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  background: white;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.search-container {
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
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
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-primary:hover {
  background-color: #1976D2;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
}

.btn-primary:active {
  transform: scale(0.98);
}

.table-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
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
  border-top: 4px solid #2196F3;
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
