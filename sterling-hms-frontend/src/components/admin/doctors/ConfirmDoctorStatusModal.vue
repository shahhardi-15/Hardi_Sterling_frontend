<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import adminAPI from '@/api/admin'

const authStore = useAuthStore()
const props = defineProps({
  doctor: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'success'])

const loading = ref(false)
const toastMessage = ref('')
const showSuccessToast = ref(false)

const handleConfirm = async () => {
  loading.value = true
  try {
    const newStatus = !props.doctor.is_active
    const response = await adminAPI.updateDoctorStatus(
      authStore.token,
      props.doctor.id,
      newStatus
    )

    toastMessage.value = newStatus
      ? `Dr. ${props.doctor.full_name} has been activated`
      : `Dr. ${props.doctor.full_name} has been deactivated`
    showSuccessToast.value = true

    setTimeout(() => {
      showSuccessToast.value = false
      emit('success')
    }, 2000)
  } catch (err) {
    console.error('Error updating doctor status:', err)
    toastMessage.value = err.response?.data?.message || 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <!-- Toast Notification -->
      <div v-if="showSuccessToast" class="toast-notification">
        {{ toastMessage }}
      </div>

      <!-- Modal Header -->
      <div class="modal-header">
        <h2>Confirm Action</h2>
        <button @click="$emit('close')" class="close-btn" :disabled="loading">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <p class="confirmation-text">
          <template v-if="doctor.is_active">
            Are you sure you want to deactivate <strong>Dr. {{ doctor.full_name }}</strong>?
            <br/>They will no longer be able to log in to the system.
          </template>
          <template v-else>
            Are you sure you want to activate <strong>Dr. {{ doctor.full_name }}</strong>?
          </template>
        </p>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-secondary" :disabled="loading">
          Cancel
        </button>
        <button @click="handleConfirm" class="btn-primary" :disabled="loading">
          {{ loading ? 'Processing...' : 'Confirm' }}
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
  max-width: 450px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.toast-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #4caf50;
  color: white;
  padding: 16px 24px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  font-weight: 600;
  z-index: 2000;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
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

.close-btn:hover:not(:disabled) {
  background-color: #f0f0f0;
  color: #333;
}

.close-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 24px;
}

.confirmation-text {
  margin: 0;
  font-size: 16px;
  color: #333;
  line-height: 1.5;
}

.confirmation-text strong {
  font-weight: 700;
  color: #1976D2;
}

.modal-footer {
  border-top: 1px solid #eee;
  padding: 20px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-secondary {
  padding: 10px 24px;
  background-color: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.btn-primary:hover:not(:disabled) {
  background-color: #1976D2;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
