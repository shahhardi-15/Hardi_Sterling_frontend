<template>
  <div class="doctor-profile-section">
    <h2 class="section-title">Your Profile</h2>

    <div v-if="loading" class="loading">
      <p>Loading profile...</p>
    </div>

    <div v-else-if="doctorStore.doctor" class="profile-card">
      <div class="profile-header">
        <div class="avatar">
          {{ initials }}
        </div>
        <div class="profile-info">
          <h3 class="profile-name">{{ doctorStore.doctor.name }}</h3>
          <p class="profile-subtitle">{{ doctorStore.doctor.specialization }}</p>
        </div>
      </div>

      <div class="profile-details">
        <div class="detail-row">
          <span class="detail-label">Email</span>
          <span class="detail-value">{{ doctorStore.doctor.email }}</span>
        </div>
        <div v-if="doctorStore.doctor.phone" class="detail-row">
          <span class="detail-label">Phone</span>
          <span class="detail-value">{{ doctorStore.doctor.phone }}</span>
        </div>
        <div v-if="doctorStore.doctor.licenseNumber" class="detail-row">
          <span class="detail-label">License Number</span>
          <span class="detail-value">{{ doctorStore.doctor.licenseNumber }}</span>
        </div>
        <div v-if="doctorStore.doctor.qualifications" class="detail-row">
          <span class="detail-label">Qualifications</span>
          <span class="detail-value">{{ doctorStore.doctor.qualifications }}</span>
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
          <div class="stat-value">{{ doctorStore.patients.length }}</div>
          <div class="stat-label">Total Patients</div>
        </div>
        <div class="stat">
          <div class="stat-value">{{ upcomingCount }}</div>
          <div class="stat-label">Upcoming Appointments</div>
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
import { useDoctorStore } from '@/stores/doctor'

const router = useRouter()
const doctorStore = useDoctorStore()

const loading = ref(false)
const error = ref('')

const initials = computed(() => {
  const doctor = doctorStore.doctor
  if (!doctor) return 'D'
  const first = doctor.name?.split(' ')[0]?.[0] || ''
  const last = doctor.name?.split(' ')[1]?.[0] || ''
  return (first + last).toUpperCase() || 'D'
})

const upcomingCount = computed(() => {
  return doctorStore.appointments.filter(apt => apt.status === 'upcoming').length
})

const completedCount = computed(() => {
  return doctorStore.appointments.filter(apt => apt.status === 'completed').length
})

onMounted(async () => {
  try {
    loading.value = true
    // Load patients if not already loaded
    if (doctorStore.patients.length === 0) {
      await doctorStore.getAssignedPatients()
    }
    // Load appointments if not already loaded
    if (doctorStore.appointments.length === 0) {
      await doctorStore.getAppointments()
    }
  } catch (err) {
    error.value = 'Failed to load profile data'
  } finally {
    loading.value = false
  }
})

const logout = async () => {
  if (confirm('Are you sure you want to logout?')) {
    doctorStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.doctor-profile-section {
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
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);
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
  grid-template-columns: 120px 1fr;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-label {
  font-weight: 600;
  color: #666;
  font-size: 13px;
}

.detail-value {
  color: #333;
  font-size: 14px;
}

.profile-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-logout {
  background-color: #f44336;
  color: white;
  flex: 1;
}

.btn-logout:hover {
  background-color: #d32f2f;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.2);
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #f0f0f0;
}

.stat {
  text-align: center;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 6px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #2196F3;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.alert {
  padding: 12px 16px;
  border-radius: 6px;
  margin-top: 16px;
}

.alert-danger {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef5350;
}
</style>
