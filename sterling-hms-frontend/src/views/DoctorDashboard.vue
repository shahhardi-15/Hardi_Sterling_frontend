<template>
  <div class="dashboard">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <div class="header-top">
          <div>
            <h1>Doctor Dashboard</h1>
            <p class="header-subtitle">Welcome, {{ doctorStore.doctor?.name || 'Doctor' }}</p>
          </div>
          <button @click="handleLogout" class="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="dashboard-content">
      <div v-if="loading" class="loading-container">
        <p>Loading dashboard...</p>
      </div>

      <div v-else class="dashboard-grid">
        <!-- Doctor Profile Section -->
        <section class="dashboard-section full-width">
          <DoctorProfile />
        </section>

        <!-- Two-column layout for appointments and patients -->
        <div class="two-column-layout">
          <!-- Doctor Appointments Section -->
          <section class="dashboard-section">
            <DoctorAppointments />
          </section>

          <!-- Doctor Patients Section -->
          <section class="dashboard-section">
            <DoctorPatients />
          </section>
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDoctorStore } from '@/stores/doctor'
import DoctorProfile from '@/components/DoctorProfile.vue'
import DoctorAppointments from '@/components/DoctorAppointments.vue'
import DoctorPatients from '@/components/DoctorPatients.vue'

const router = useRouter()
const doctorStore = useDoctorStore()

const loading = ref(false)
const error = ref('')

const handleLogout = async () => {
  try {
    await doctorStore.logout()
    router.push('/login')
  } catch (err) {
    console.error('Logout error:', err)
    router.push('/login')
  }
}

onMounted(() => {
  // Initialize auth from storage
  doctorStore.initializeAuth()

  // Check if user is authenticated and is a doctor
  if (!doctorStore.token || !doctorStore.doctor) {
    router.push('/login')
    return
  }

  loading.value = true
  error.value = ''
  loading.value = false
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.dashboard-header {
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  color: white;
  padding: 40px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.dashboard-header h1 {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.header-subtitle {
  font-size: 16px;
  margin: 0;
  opacity: 0.95;
}

.logout-btn {
  background-color: #ff5252;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.logout-btn:hover {
  background-color: #ff1744;
  box-shadow: 0 4px 12px rgba(255, 82, 82, 0.4);
}

.logout-btn:active {
  transform: scale(0.98);
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.loading-container {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 18px;
}

.dashboard-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dashboard-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.full-width {
  width: 100%;
}

.two-column-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 1024px) {
  .two-column-layout {
    grid-template-columns: 1fr;
  }
}

.alert {
  padding: 16px;
  border-radius: 8px;
  margin-top: 24px;
}

.alert-danger {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef5350;
}
</style>
