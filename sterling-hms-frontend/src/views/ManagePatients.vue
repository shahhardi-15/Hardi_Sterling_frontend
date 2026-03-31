<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import adminAPI from '@/api/admin'
import AdminLayout from '@/components/admin/AdminLayout.vue'
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

const getInitials = (fullName) => {
  if (!fullName) return '?'
  return fullName
    .split(' ')
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('')
}

const getAvatarClass = (fullName) => {
  if (!fullName) return 'avatar-default'
  
  const initials = getInitials(fullName)
  
  switch (initials) {
    case 'EM': return 'avatar-em'
    case 'JC': return 'avatar-jc'
    case 'SA': return 'avatar-sa'
    case 'MK': return 'avatar-mk'
    default: return 'avatar-default'
  }
}

const getStatusClass = (isActive) => {
  return isActive ? 'status-stable' : 'status-in-treatment'
}
</script>

<template>
  <AdminLayout>
    <div class="manage-patients-container">
      <!-- Error Alert -->
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <!-- Page Header Section -->
      <div class="page-header-section">
      <div class="header-left">
        <h1 class="page-title">Manage Patients</h1>
        <p class="page-subtitle">
          Oversee clinical records, registration status, and contact information for the hospital's patient database.
        </p>
      </div>
      <button @click="showRegisterModal = true" class="btn-register-new-patient">
        <svg class="icon-person-plus" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
        </svg>
        Register New Patient
      </button>
    </div>

    <!-- Active Patient Directory Table Section -->
    <div class="patients-table-container">
      <!-- Table Header -->
      <div class="table-header">
        <div class="table-header-left">
          <h2 class="table-title">Active Patient Directory</h2>
        </div>
        <div class="total-badge">
          TOTAL: {{ totalPatients }}
        </div>
      </div>

      <!-- Column Headers -->
      <div class="table-column-headers">
        <div class="col-header col-patient-identity">PATIENT IDENTITY</div>
        <div class="col-header col-contact-info">CONTACT INFO</div>
        <div class="col-header col-clinical-status">CLINICAL STATUS</div>
        <div class="col-header col-actions">ACTIONS</div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Loading patients...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="patients.length === 0" class="empty-state">
        <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p class="empty-message">No patients found.</p>
      </div>

      <!-- Patient Rows -->
      <template v-else>
        <div v-for="patient in patients" :key="patient.id" class="table-row">
          <!-- Patient Identity Column -->
          <div class="table-cell col-patient-identity">
            <div class="patient-identity-wrapper">
              <div :class="['avatar', getAvatarClass(patient.full_name)]">
                {{ getInitials(patient.full_name) }}
              </div>
              <div class="patient-info">
                <div class="patient-name">{{ patient.full_name || '-' }}</div>
                <div class="patient-id">ID: #{{ patient.uhid || '-' }}</div>
              </div>
            </div>
          </div>

          <!-- Contact Info Column -->
          <div class="table-cell col-contact-info">
            <div class="phone-number">{{ patient.phone || '-' }}</div>
          </div>

          <!-- Clinical Status Column -->
          <div class="table-cell col-clinical-status">
            <span :class="['status-badge', getStatusClass(patient.is_active)]">
              {{ patient.is_active ? 'Stable' : 'In Treatment' }}
            </span>
          </div>

          <!-- Actions Column -->
          <div class="table-cell col-actions">
            <button class="action-link" @click="openViewModal(patient)">
              <span>View</span>
              <span>Chart</span>
            </button>
          </div>
        </div>
      </template>

      <!-- View All Patient Records Link -->
      <div v-if="patients.length > 0" class="view-all-footer">
        VIEW ALL PATIENT RECORDS
      </div>
    </div>

    <!-- Bottom Stats Row -->
    <div class="stats-row">
      <!-- Admissions Card -->
      <div class="stats-card">
        <div class="stats-card-top">
          <svg class="stats-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          <div class="stats-badge">+12% vs LW</div>
        </div>
        <div class="stats-label">ADMISSIONS</div>
        <div class="stats-number">42</div>
        <div class="stats-underline"></div>
      </div>

      <!-- Pending Results Card -->
      <div class="stats-card">
        <div class="stats-card-top">
          <svg class="stats-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <div class="stats-badge badge-active">Active Lab</div>
        </div>
        <div class="stats-label">PENDING RESULTS</div>
        <div class="stats-number">156</div>
        <div class="stats-underline"></div>
      </div>

      <!-- Clinical Support Card -->
      <div class="stats-card">
        <div class="stats-card-top">
          <svg class="stats-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M18.364 5.636l-3.14 3.14a6 6 0 00-8.49 8.49l-3.14 3.14M9 9a6 6 0 018.49 8.49m0 0l3.14 3.14M9 9l3 3m-3-3L6 6"></path>
          </svg>
        </div>
        <div class="stats-label">CLINICAL SUPPORT</div>
        <div class="stats-support-text">Emergency Hotline</div>
        <div class="stats-support-ext">Ext. 991</div>
      </div>
    </div>

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
  </AdminLayout>
</template>

<style scoped>
.manage-patients-container {
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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
  max-width: 520px;
  text-align: left;
}

.btn-register-new-patient {
  background: #1B3A6B;
  color: white;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-register-new-patient:hover {
  background: #152D54;
  transform: translateY(-1px);
}

.icon-person-plus {
  width: 18px;
  height: 18px;
  color: white;
}

/* Patients Table Container */
.patients-table-container {
  background: white;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
  margin-bottom: 32px;
}

/* Table Header */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #E2E8F0;
}

.table-header-left {
  flex: 1;
}

.table-title {
  font-size: 16px;
  font-weight: 700;
  color: #1A2B4A;
  margin: 0;
  padding: 0;
  text-align: left;
}

.total-badge {
  background: #F0F4F8;
  color: #4A5568;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 5px 12px;
  border-radius: 6px;
  white-space: nowrap;
}

/* Column Headers */
.table-column-headers {
  background: #F7F9FC;
  border-bottom: 1px solid #E2E8F0;
  padding: 12px 24px;
  display: grid;
  grid-template-columns: 2.5fr 1.5fr 1.2fr 1fr;
  gap: 16px;
}

.col-header {
  font-size: 11px;
  font-weight: 600;
  color: #A0AEC0;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* Table Rows */
.table-row {
  padding: 16px 24px;
  display: grid;
  grid-template-columns: 2.5fr 1.5fr 1.2fr 1fr;
  gap: 16px;
  align-items: center;
  border-bottom: 1px solid #F0F4F8;
  transition: background 0.15s ease;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: #F7F9FC;
}

.table-cell {
  display: flex;
  align-items: center;
}

/* Patient Identity Column */
.col-patient-identity {
  display: flex;
}

.patient-identity-wrapper {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.avatar-em {
  background: #DBEAFE;
  color: #1B5E8F;
}

.avatar-jc {
  background: #DCFCE7;
  color: #166534;
}

.avatar-sa {
  background: #FEF9C3;
  color: #854D0E;
}

.avatar-mk {
  background: #FFE4E6;
  color: #9F1239;
}

.avatar-default {
  background: #E2E8F0;
  color: #4A5568;
}

.patient-info {
  flex: 1;
  min-width: 0;
}

.patient-name {
  font-size: 14px;
  font-weight: 600;
  color: #1A2B4A;
  margin-bottom: 2px;
}

.patient-id {
  font-size: 12px;
  color: #A0AEC0;
}

/* Contact Info Column */
.col-contact-info {
  justify-content: flex-start;
}

.phone-number {
  font-size: 14px;
  color: #2D3748;
}

/* Clinical Status Column */
.col-clinical-status {
  justify-content: flex-start;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}

.status-stable {
  background: #DCFCE7;
  color: #166534;
}

.status-in-treatment {
  background: #FEF9C3;
  color: #854D0E;
}

/* Actions Column */
.col-actions {
  justify-content: flex-start;
}

.action-link {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-size: 13px;
  font-weight: 600;
  color: #1B5E8F;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  line-height: 1.4;
  text-decoration: none;
  transition: text-decoration 0.15s ease;
}

.action-link:hover {
  text-decoration: underline;
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
  border-top: 4px solid #1B3A6B;
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

/* View All Footer */
.view-all-footer {
  display: block;
  text-align: center;
  padding: 16px;
  border-top: 1px solid #F0F4F8;
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
  color: #1B5E8F;
  letter-spacing: 0.1em;
  cursor: pointer;
  background: white;
  transition: background 0.15s ease;
}

.view-all-footer:hover {
  background: #F7F9FC;
}

/* Bottom Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 32px;
}

.stats-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  padding: 20px;
}

.stats-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.stats-icon {
  width: 22px;
  height: 22px;
  color: #1B5E8F;
}

.stats-badge {
  background: #DCFCE7;
  color: #166534;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
}

.stats-badge.badge-active {
  background: #DBEAFE;
  color: #1E40AF;
}

.stats-label {
  font-size: 11px;
  font-weight: 600;
  color: #A0AEC0;
  letter-spacing: 0.1em;
  margin-bottom: 6px;
}

.stats-number {
  font-size: 28px;
  font-weight: 700;
  color: #1A2B4A;
  margin-bottom: 12px;
}

.stats-underline {
  height: 3px;
  width: 60%;
  background: #1B5E8F;
  border-radius: 2px;
}

.stats-support-text {
  font-size: 18px;
  font-weight: 700;
  color: #1A2B4A;
  margin-bottom: 4px;
}

.stats-support-ext {
  font-size: 14px;
  font-weight: 600;
  color: #1B5E8F;
}
</style>
