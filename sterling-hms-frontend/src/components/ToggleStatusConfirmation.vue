<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import adminAPI from '@/api/admin'

const props = defineProps({
  patient: {
    type: Object,
    required: true
  }
})

const authStore = useAuthStore()
const emit = defineEmits(['close', 'success'])

const loading = ref(false)

const handleConfirm = async () => {
  loading.value = true

  try {
    const newStatus = !props.patient.is_active
    await adminAPI.updatePatientStatus(authStore.token, props.patient.id, newStatus)

    const message = newStatus 
      ? 'Patient activated successfully!'
      : 'Patient deactivated successfully!'

    // Show success in parent component
    emit('success')
  } catch (err) {
    console.error('Error toggling patient status:', err)
    alert(err.response?.data?.message || 'Failed to update patient status')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  emit('close')
}

const confirmationMessage = props.patient.is_active
  ? 'Are you sure you want to deactivate this patient? They will no longer be able to log in.'
  : 'Are you sure you want to activate this patient?'

const confirmButtonText = props.patient.is_active ? 'Deactivate' : 'Activate'
</script>

<template>
  <div class="modal-overlay" @click="handleCancel">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Confirm Action</h2>
      </div>

      <div class="modal-body">
        <div class="confirmation-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M12 9v2m0 4v2m0 4v2M9 3h6a2 2 0 012 2v18a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2z"></path>
          </svg>
        </div>
        <p class="confirmation-message">{{ confirmationMessage }}</p>
        <p class="patient-info">
          <strong>Patient:</strong> {{ patient.full_name || 'Unknown' }}
        </p>
      </div>

      <div class="modal-footer">
        <button @click="handleCancel" class="btn-secondary" :disabled="loading">
          Cancel
        </button>
        <button 
          @click="handleConfirm" 
          :class="['btn-danger', { 'btn-success': !patient.is_active }]"
          :disabled="loading"
        >
          <span v-if="!loading">{{ confirmButtonText }}</span>
          <span v-else>Processing...</span>
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
  max-width: 400px;
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
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.modal-body {
  padding: 24px;
  text-align: center;
}

.confirmation-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #fff3e0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.confirmation-icon svg {
  width: 36px;
  height: 36px;
  color: #f57c00;
}

.confirmation-message {
  font-size: 16px;
  color: #333;
  margin: 16px 0;
  line-height: 1.5;
  font-weight: 500;
}

.patient-info {
  font-size: 14px;
  color: #666;
  margin: 16px 0 0 0;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 6px;
}

.patient-info strong {
  color: #333;
}

.modal-footer {
  padding: 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-secondary,
.btn-danger,
.btn-success {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.btn-danger {
  background: linear-gradient(135deg, #f44336 0%, #e53935 100%);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
  transform: translateY(-2px);
}

.btn-success {
  background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  color: white;
}

.btn-success:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
  transform: translateY(-2px);
}

.btn-secondary:disabled,
.btn-danger:disabled,
.btn-success:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .modal-content {
    width: 95%;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }

  .modal-header h2 {
    font-size: 18px;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .btn-secondary,
  .btn-danger,
  .btn-success {
    width: 100%;
  }
}
</style>
