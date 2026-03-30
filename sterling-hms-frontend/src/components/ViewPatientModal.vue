<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import adminAPI from '@/api/admin'

const props = defineProps({
  patientId: {
    type: Number,
    required: true
  }
})

const authStore = useAuthStore()
const emit = defineEmits(['close'])

const patient = ref(null)
const loading = ref(false)
const error = ref('')

onMounted(async () => {
  await fetchPatient()
})

const fetchPatient = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await adminAPI.getPatient(authStore.token, props.patientId)
    patient.value = response.data.data || response.data
  } catch (err) {
    console.error('Error fetching patient:', err)
    error.value = 'Failed to load patient details'
  } finally {
    loading.value = false
  }
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

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <div class="modal-overlay" @click="handleClose">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Patient Details</h2>
        <button @click="handleClose" class="close-btn">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Loading patient details...</p>
        </div>

        <div v-else-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-else-if="patient" class="patient-details">
          <div class="details-row">
            <div class="detail-item">
              <span class="detail-label">UHID</span>
              <span class="detail-value">{{ patient.uhid || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Full Name</span>
              <span class="detail-value">{{ patient.full_name || '-' }}</span>
            </div>
          </div>

          <div class="details-row">
            <div class="detail-item">
              <span class="detail-label">Email</span>
              <span class="detail-value">{{ patient.email || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Phone</span>
              <span class="detail-value">{{ patient.phone || '-' }}</span>
            </div>
          </div>

          <div class="details-row">
            <div class="detail-item">
              <span class="detail-label">Gender</span>
              <span class="detail-value">{{ patient.gender || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Date of Birth</span>
              <span class="detail-value">{{ formatDate(patient.date_of_birth) }}</span>
            </div>
          </div>

          <div class="details-row">
            <div class="detail-item">
              <span class="detail-label">Age</span>
              <span class="detail-value">{{ calculateAge(patient.date_of_birth) }} years</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Status</span>
              <span :class="['status-badge', patient.is_active ? 'active' : 'inactive']">
                {{ patient.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>

          <div class="details-full-width">
            <span class="detail-label">Address</span>
            <span class="detail-value">{{ patient.address || '-' }}</span>
          </div>

          <div class="details-row">
            <div class="detail-item">
              <span class="detail-label">Registration Date</span>
              <span class="detail-value">{{ formatDate(patient.registration_date) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Last Updated</span>
              <span class="detail-value">{{ formatDate(patient.updated_at) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="handleClose" class="btn-primary">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background-color: #f0f0f0;
  color: #333;
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
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

.loading p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.error-message {
  padding: 16px;
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef5350;
  border-radius: 6px;
  font-size: 14px;
}

.patient-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.details-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.details-full-width {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  width: fit-content;
}

.status-badge.active {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-badge.inactive {
  background-color: #ffebee;
  color: #c62828;
}

.modal-footer {
  padding: 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  padding: 10px 24px;
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.btn-primary:hover {
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
  transform: translateY(-2px);
}

.btn-primary:active {
  transform: translateY(0);
}

@media (max-width: 600px) {
  .modal-content {
    width: 95%;
    max-height: 95vh;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }

  .modal-header h2 {
    font-size: 18px;
  }

  .details-row {
    grid-template-columns: 1fr;
  }
}
</style>
