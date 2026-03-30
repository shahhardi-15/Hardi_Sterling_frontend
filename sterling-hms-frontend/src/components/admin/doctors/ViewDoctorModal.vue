<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import adminAPI from '@/api/admin'

const authStore = useAuthStore()
const props = defineProps({
  doctor: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

const loading = ref(false)
const docData = ref(null)
const error = ref('')

onMounted(async () => {
  if (props.doctor?.id) {
    await fetchDoctor()
  }
})

const fetchDoctor = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await adminAPI.getDoctor(authStore.token, props.doctor.id)
    docData.value = response.data.data
  } catch (err) {
    console.error('Error fetching doctor:', err)
    if (err.response?.status === 404) {
      error.value = 'Doctor not found'
    } else {
      error.value = 'Failed to load doctor details'
    }
  } finally {
    loading.value = false
  }
}

const formatAvailableDays = (daysString) => {
  if (!daysString) return '-'
  if (Array.isArray(daysString)) {
    return daysString.join(', ')
  }
  return daysString.split(',').map(d => d.trim()).join(', ')
}

const formatTime = (time) => {
  if (!time) return '-'
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${String(displayHour).padStart(2, '0')}:${minutes} ${ampm}`
}
</script>

<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <!-- Modal Header -->
      <div class="modal-header">
        <h2>View Doctor Details</h2>
        <button @click="$emit('close')" class="close-btn">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <!-- Loading -->
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
          <p>Loading doctor details...</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="error-message">
          {{ error }}
        </div>

        <!-- Content -->
        <template v-else-if="docData">
          <!-- Section 1: Personal Details -->
          <div class="form-section">
            <h3 class="section-title">Personal Details</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Full Name</span>
                <span class="detail-value">{{ docData.full_name || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Email</span>
                <span class="detail-value">{{ docData.email || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Phone</span>
                <span class="detail-value">{{ docData.phone || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Status</span>
                <span :class="['status-badge', docData.is_active ? 'active' : 'inactive']">
                  {{ docData.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Section 2: Professional Details -->
          <div class="form-section">
            <h3 class="section-title">Professional Details</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Specialization</span>
                <span class="detail-value">{{ docData.specialization || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Qualification</span>
                <span class="detail-value">{{ docData.qualification || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Registration No.</span>
                <span class="detail-value">{{ docData.registration_number || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Experience</span>
                <span class="detail-value">{{ docData.experience_years || 0 }} years</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Consultation Fee</span>
                <span class="detail-value">₹{{ docData.consultation_fee || 0 }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Department</span>
                <span class="detail-value">{{ docData.department_name || '-' }}</span>
              </div>
              <div class="detail-item-full">
                <span class="detail-label">Available Days</span>
                <div class="day-chips">
                  <span
                    v-for="day in (Array.isArray(docData.available_days) ? docData.available_days : (docData.available_days || '').split(',').map(d => d.trim()))"
                    :key="day"
                    class="day-chip"
                  >
                    {{ day }}
                  </span>
                </div>
              </div>
              <div class="detail-item-full">
                <span class="detail-label">Working Hours</span>
                <span class="detail-value">
                  {{ formatTime(docData.start_time) }} — {{ formatTime(docData.end_time) }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Slot Duration</span>
                <span class="detail-value">{{ docData.slot_duration_minutes }} min</span>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-primary">
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
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  border-bottom: 1px solid #eee;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: #666;
  transition: all 0.3s;
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
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
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

.error-message {
  padding: 16px;
  background-color: #ffebee;
  border: 1px solid #ffcdd2;
  border-radius: 6px;
  color: #c62828;
  font-size: 14px;
  text-align: center;
}

.form-section {
  margin-bottom: 32px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.detail-item,
.detail-item-full {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-item-full {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: 12px;
  font-weight: 700;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 14px;
  color: #333;
  word-break: break-word;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

.day-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.day-chip {
  display: inline-block;
  padding: 6px 12px;
  background-color: #e3f2fd;
  color: #1976D2;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.modal-footer {
  border-top: 1px solid #eee;
  padding: 20px 24px;
  display: flex;
  justify-content: flex-end;
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
  transition: all 0.3s;
}

.btn-primary:hover {
  background-color: #1976D2;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
}
</style>
