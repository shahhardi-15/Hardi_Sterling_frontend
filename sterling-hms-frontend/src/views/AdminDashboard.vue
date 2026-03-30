<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import adminAPI from '@/api/admin'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const stats = ref({
  totalPatients: 0,
  totalDoctors: 0,
  totalReceptionists: 0,
  totalAppointments: 0,
  upcomingAppointments: 0,
  completedAppointments: 0
})

onMounted(async () => {
  // Initialize auth data from storage
  authStore.initializeAuth()

  // Check if admin is authenticated
  if (!authStore.isAdmin) {
    router.push('/login')
    return
  }

  // Verify token exists
  if (!authStore.token) {
    error.value = 'Session expired. Please login again.'
    setTimeout(() => router.push('/admin/login'), 2000)
    return
  }

  // Fetch dashboard statistics
  loading.value = true
  try {
    const response = await adminAPI.getDashboardStats(authStore.token)
    stats.value = response.data.stats || stats.value
  } catch (err) {
    error.value = 'Failed to load dashboard statistics'
    console.error('Error loading stats:', err)
    if (err.response?.status === 401) {
      setTimeout(() => router.push('/admin/login'), 2000)
    }
  } finally {
    loading.value = false
  }
})

const handleLogout = async () => {
  try {
    await adminAPI.logout(authStore.token)
  } catch (err) {
    console.error('Logout error:', err)
  } finally {
    authStore.logout()
    router.push('/login')
  }
}

const navigateTo = (route) => {
  router.push(route)
}
</script>

<template>
  <div class="dashboard">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <div class="header-top">
          <div>
            <h1>Admin Dashboard</h1>
            <p class="header-subtitle">Welcome, Administrator</p>
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
        <!-- Error Display -->
        <div v-if="error" class="alert alert-danger full-width">
          {{ error }}
        </div>

        <!-- Statistics Cards -->
        <section class="stats-section full-width">
          <div class="stats-grid">
            <!-- Total Patients Card -->
            <div class="stat-card">
              <div class="stat-icon patients-icon">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
                </svg>
              </div>
              <div class="stat-info">
                <h3 class="stat-value">{{ stats.totalPatients }}</h3>
                <p class="stat-label">Total Patients</p>
              </div>
            </div>

            <!-- Total Doctors Card -->
            <div class="stat-card">
              <div class="stat-icon doctors-icon">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
                </svg>
              </div>
              <div class="stat-info">
                <h3 class="stat-value">{{ stats.totalDoctors }}</h3>
                <p class="stat-label">Total Doctors</p>
              </div>
            </div>

            <!-- Total Receptionists Card -->
            <div class="stat-card">
              <div class="stat-icon receptionists-icon">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
                </svg>
              </div>
              <div class="stat-info">
                <h3 class="stat-value">{{ stats.totalReceptionists }}</h3>
                <p class="stat-label">Receptionists</p>
              </div>
            </div>

            <!-- Total Appointments Card -->
            <div class="stat-card">
              <div class="stat-icon appointments-icon">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v2H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v2H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div class="stat-info">
                <h3 class="stat-value">{{ stats.totalAppointments }}</h3>
                <p class="stat-label">Total Appointments</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Appointment Statistics -->
        <section class="dashboard-section">
          <h2 class="section-title">Appointment Overview</h2>
          <div class="appointment-stats">
            <div class="stat-item">
              <div class="stat-number upcoming">{{ stats.upcomingAppointments }}</div>
              <div class="stat-text">Upcoming Appointments</div>
            </div>
            <div class="stat-item">
              <div class="stat-number completed">{{ stats.completedAppointments }}</div>
              <div class="stat-text">Completed Appointments</div>
            </div>
          </div>
        </section>

        <!-- Management Actions -->
        <section class="dashboard-section">
          <h2 class="section-title">Management</h2>
          <div class="management-grid">
            <button @click="navigateTo('/admin/users')" class="management-btn">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              <span>Manage Patients</span>
            </button>

            <button @click="navigateTo('/admin/doctors')" class="management-btn">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
              </svg>
              <span>Manage Doctors</span>
            </button>

            <button @click="navigateTo('/admin/appointments')" class="management-btn">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span>View Appointments</span>
            </button>

            <button @click="navigateTo('/admin/settings')" class="management-btn">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span>Settings</span>
            </button>
          </div>
        </section>

        <!-- System Health Section -->
        <section class="dashboard-section full-width">
          <h2 class="section-title">System Status</h2>
          <div class="health-grid">
            <div class="health-item">
              <div class="health-status healthy"></div>
              <div>
                <p class="health-label">Database</p>
                <p class="health-value">Connected</p>
              </div>
            </div>
            <div class="health-item">
              <div class="health-status healthy"></div>
              <div>
                <p class="health-label">API Server</p>
                <p class="health-value">Running</p>
              </div>
            </div>
            <div class="health-item">
              <div class="health-status healthy"></div>
              <div>
                <p class="health-label">Authentication</p>
                <p class="health-value">Active</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

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

.dashboard-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: #333;
}

/* Alert Styles */
.alert {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-weight: 500;
}

.alert-danger {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef5350;
}

/* Stats Section */
.stats-section {
  padding: 0;
  background: transparent;
  box-shadow: none;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon svg {
  width: 28px;
  height: 28px;
}

.patients-icon {
  background-color: #e3f2fd;
  color: #1976d2;
}

.doctors-icon {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.receptionists-icon {
  background-color: #e8f5e9;
  color: #388e3c;
}

.appointments-icon {
  background-color: #fff3e0;
  color: #f57c00;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin: 4px 0 0 0;
}

/* Appointment Stats */
.appointment-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 6px;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-number.upcoming {
  color: #f57c00;
}

.stat-number.completed {
  color: #388e3c;
}

.stat-text {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

/* Management Grid */
.management-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.management-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.management-btn svg {
  width: 32px;
  height: 32px;
  color: #2196F3;
}

.management-btn:hover {
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  border-color: #1976d2;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);
}

.management-btn:hover svg {
  color: white;
}

.management-btn:active {
  transform: translateY(0);
}

/* Health Grid */
.health-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.health-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 6px;
}

.health-status {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.health-status.healthy {
  background-color: #4caf50;
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.3);
}

.health-label {
  font-size: 12px;
  color: #999;
  margin: 0;
  font-weight: 500;
}

.health-value {
  font-size: 14px;
  color: #333;
  margin: 4px 0 0 0;
  font-weight: 600;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-header {
    padding: 30px 16px;
  }

  .dashboard-header h1 {
    font-size: 24px;
  }

  .header-top {
    flex-direction: column;
    align-items: stretch;
  }

  .logout-btn {
    width: 100%;
    text-align: center;
  }

  .dashboard-content {
    padding: 20px;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .management-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .stats-grid,
  .management-grid,
  .health-grid,
  .appointment-stats {
    grid-template-columns: 1fr;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
  }

  .stat-icon {
    width: 56px;
    height: 56px;
  }
}
</style>
