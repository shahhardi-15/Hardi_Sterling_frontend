<template>
  <div class="dashboard">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <h1>Patient Dashboard</h1>
        <p class="header-subtitle">Welcome, {{ authStore.user?.firstName || 'Patient' }}</p>
      </div>
    </header>

    <!-- Main Content -->
    <main class="dashboard-content">
      <div v-if="loading" class="loading-container">
        <p>Loading dashboard...</p>
      </div>

      <div v-else class="dashboard-grid">
        <!-- Book Appointment Section -->
        <section class="dashboard-section full-width">
          <BookAppointment />
        </section>

        <!-- Two-column layout for history and profile -->
        <div class="two-column-layout">
          <!-- Appointment History Section -->
          <section class="dashboard-section">
            <AppointmentHistory />
          </section>

          <!-- Patient Profile Section -->
          <section class="dashboard-section">
            <PatientProfile />
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
import { useAuthStore } from '@/stores/auth'
import { useAppointmentStore } from '@/stores/appointment'
import BookAppointment from '@/components/BookAppointment.vue'
import AppointmentHistory from '@/components/AppointmentHistory.vue'
import PatientProfile from '@/components/PatientProfile.vue'

const router = useRouter()
const authStore = useAuthStore()
const appointmentStore = useAppointmentStore()

const loading = ref(false)
const error = ref('')

onMounted(() => {
  // Initialize auth from storage
  authStore.initializeAuth()

  // Check if user is authenticated and is a patient
  if (!authStore.token || authStore.isAdmin) {
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

.dashboard-header h1 {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.header-subtitle {
  font-size: 16px;
  opacity: 0.95;
  margin: 0;
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
  font-size: 16px;
}

.dashboard-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.full-width {
  width: 100%;
}

.two-column-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.dashboard-section {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alert {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

.alert-danger {
  background: #fee;
  border: 1px solid #fcc;
  color: #c33;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .two-column-layout {
    grid-template-columns: 1fr;
  }

  .dashboard-content {
    padding: 30px 16px;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    padding: 30px 16px;
  }

  .dashboard-header h1 {
    font-size: 24px;
  }

  .dashboard-content {
    padding: 20px 16px;
  }

  .dashboard-grid {
    gap: 16px;
  }

  .two-column-layout {
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .dashboard-header {
    padding: 20px 12px;
  }

  .dashboard-header h1 {
    font-size: 20px;
  }

  .header-subtitle {
    font-size: 14px;
  }

  .dashboard-content {
    padding: 16px 12px;
  }
}
</style>
