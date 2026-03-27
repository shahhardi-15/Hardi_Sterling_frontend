<template>
  <div class="patient-profile-section">
    <h2 class="section-title">Your Profile</h2>

    <div v-if="loading" class="loading">
      <p>Loading profile...</p>
    </div>

    <div v-else-if="appointmentStore.profile" class="profile-card">
      <div class="profile-header">
        <div class="avatar">
          {{ initials }}
        </div>
        <div class="profile-info">
          <h3 class="profile-name">{{ fullName }}</h3>
          <p class="profile-subtitle">Patient</p>
        </div>
      </div>

      <div class="profile-details">
        <div class="detail-row">
          <span class="detail-label">Email</span>
          <span class="detail-value">{{ appointmentStore.profile.email }}</span>
        </div>
        <div v-if="appointmentStore.profile.phone" class="detail-row">
          <span class="detail-label">Phone</span>
          <span class="detail-value">{{ appointmentStore.profile.phone }}</span>
        </div>
        <div v-if="appointmentStore.profile.address" class="detail-row">
          <span class="detail-label">Address</span>
          <span class="detail-value">{{ appointmentStore.profile.address }}</span>
        </div>
        <div v-if="appointmentStore.profile.medicalHistory" class="detail-row">
          <span class="detail-label">Medical History</span>
          <span class="detail-value">{{ appointmentStore.profile.medicalHistory }}</span>
        </div>
      </div>

      <div class="profile-actions">
        <button @click="logout" class="btn btn-logout">
          Logout
        </button>
      </div>

      <!-- Stats -->
      <div class="profile-stats">
        <div class="stat">
          <div class="stat-value">{{ appointmentStore.totalAppointments }}</div>
          <div class="stat-label">Total Appointments</div>
        </div>
        <div class="stat">
          <div class="stat-value">{{ scheduledCount }}</div>
          <div class="stat-label">Upcoming</div>
        </div>
        <div class="stat">
          <div class="stat-value">{{ completedCount }}</div>
          <div class="stat-label">Completed</div>
        </div>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppointmentStore } from '@/stores/appointment'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const appointmentStore = useAppointmentStore()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')

const fullName = computed(() => {
  const profile = appointmentStore.profile
  if (!profile) return ''
  return `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
})

const initials = computed(() => {
  const profile = appointmentStore.profile
  if (!profile) return 'U'
  const first = profile.firstName?.[0] || ''
  const last = profile.lastName?.[0] || ''
  return (first + last).toUpperCase() || 'U'
})

const scheduledCount = computed(() => {
  return appointmentStore.appointments.filter(apt => apt.status === 'scheduled').length
})

const completedCount = computed(() => {
  return appointmentStore.appointments.filter(apt => apt.status === 'completed').length
})

onMounted(async () => {
  try {
    loading.value = true
    await appointmentStore.getProfile()
    // Also load appointments to show stats
    if (appointmentStore.appointments.length === 0) {
      await appointmentStore.getHistory(1, 100)
    }
  } catch (err) {
    error.value = 'Failed to load profile'
  } finally {
    loading.value = false
  }
})

const logout = async () => {
  if (confirm('Are you sure you want to logout?')) {
    authStore.logout()
    appointmentStore.clearStore()
    router.push('/login')
  }
}
</script>

<style scoped>
.patient-profile-section {
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

.profile-card {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 22px;
  font-weight: 700;
  color: #333;
  margin: 0 0 4px 0;
}

.profile-subtitle {
  color: #999;
  font-size: 13px;
  margin: 0;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #555;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  color: #333;
  font-size: 14px;
}

.profile-actions {
  display: flex;
  gap: 12px;
  padding-top: 12px;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout {
  background: #dc3545;
  color: white;
}

.btn-logout:hover {
  background: #c82333;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  padding-top: 12px;
  border-top: 2px solid #f0f0f0;
}

.stat {
  text-align: center;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 6px;
  transition: all 0.2s;
}

.stat:hover {
  background: #f0f0f0;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #4CAF50;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.alert {
  padding: 12px;
  border-radius: 4px;
  font-size: 13px;
}

.alert-danger {
  background: #fee;
  border: 1px solid #fcc;
  color: #c33;
}

@media (max-width: 768px) {
  .detail-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .detail-label {
    font-size: 12px;
  }

  .profile-stats {
    grid-template-columns: 1fr;
  }
}
</style>
