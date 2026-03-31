<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import adminAPI from '@/api/admin'
import AdminLayout from '@/components/admin/AdminLayout.vue'

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
  <AdminLayout>
    <div class="dashboard-content">
      <div v-if="loading" class="loading-container">
        <p>Loading dashboard...</p>
      </div>

      <div v-else>
        <!-- Error Display -->
        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>

        <!-- PAGE HEADER -->
        <div class="page-header">
          <div class="header-left">
            <h1 class="page-title">Hospital Command Center</h1>
            <p class="page-subtitle">Morning, Administrator. Here's the clinical status for today.</p>
          </div>
          <div class="view-toggle">
            <button class="toggle-btn active">Daily View</button>
            <button class="toggle-btn">Weekly</button>
          </div>
        </div>

        <!-- STAT CARDS ROW -->
        <div class="stats-grid">
          <!-- Total Doctors -->
          <div class="stat-card">
            <div class="stat-card-top">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2c-5.33 4.55-8 6.75-8 11 0 4.41 3.59 8 8 8s8-3.59 8-8c0-4.25-2.67-6.45-8-11z"></path>
                </svg>
              </div>
              <div class="stat-badge">+4 this month</div>
            </div>
            <div class="stat-label">Total Doctors</div>
            <div class="stat-value">{{ stats.totalDoctors }}</div>
            <div class="stat-underline"></div>
          </div>

          <!-- Total Patients -->
          <div class="stat-card">
            <div class="stat-card-top">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
                </svg>
              </div>
              <div class="stat-badge">Active Care</div>
            </div>
            <div class="stat-label">Total Patients</div>
            <div class="stat-value">{{ stats.totalPatients }}</div>
            <div class="stat-underline"></div>
          </div>

          <!-- Total Receptionists -->
          <div class="stat-card">
            <div class="stat-card-top">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"></path>
                </svg>
              </div>
              <div class="stat-badge">All Shifts</div>
            </div>
            <div class="stat-label">Total Receptionists</div>
            <div class="stat-value">{{ stats.totalReceptionists }}</div>
            <div class="stat-underline"></div>
          </div>

          <!-- Total Appointments -->
          <div class="stat-card">
            <div class="stat-card-top">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                  <path d="M16 2v4M8 2v4M3 10h18" fill="none" stroke="currentColor" stroke-width="2"></path>
                </svg>
              </div>
              <div class="stat-badge">High Volume</div>
            </div>
            <div class="stat-label">Total Appointments</div>
            <div class="stat-value">{{ stats.totalAppointments }}</div>
            <div class="stat-underline"></div>
          </div>
        </div>

        <!-- TWO COLUMN ROW: Appointments + Recent Completions -->
        <div class="two-column-row">
          <!-- LEFT COLUMN: Upcoming Appointments -->
          <div class="left-column">
            <div class="section-header">
              <h2 class="section-title">Upcoming Appointments</h2>
              <a href="#" class="view-all-link">View All →</a>
            </div>

            <div class="table-container">
              <table class="appointments-table">
                <thead>
                  <tr>
                    <th>PATIENT</th>
                    <th>PRACTITIONER</th>
                    <th>SCHEDULE</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="apt in (Array.isArray(stats.upcomingAppointments) ? stats.upcomingAppointments : [])" :key="apt.id">
                    <td class="patient-col">
                      <div class="patient-avatar">{{ apt.patientInitials || 'N/A' }}</div>
                      <div class="patient-info">
                        <div class="patient-name">{{ apt.patientName || 'N/A' }}</div>
                        <div class="patient-id">{{ apt.patientId || 'N/A' }}</div>
                      </div>
                    </td>
                    <td class="practitioner-col">
                      <svg class="practitioner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                        <path d="M16 2v4M8 2v4M3 10h18"></path>
                      </svg>
                      {{ apt.doctorName || 'N/A' }}
                    </td>
                    <td class="schedule-col">
                      <div class="schedule-date">{{ apt.date || 'N/A' }}</div>
                      <div class="schedule-time">{{ apt.time || 'N/A' }}</div>
                    </td>
                    <td class="action-col">
                      <button class="action-btn" @click="navigateTo(`/admin/appointments/${apt.id}`)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- RIGHT COLUMN: Recent Completions + Generate Reports -->
          <div class="right-column">
            <!-- Recent Completions -->
            <div class="section-header">
              <h2 class="section-title">Recent Completions</h2>
              <span class="today-badge">TODAY</span>
            </div>

            <div class="completions-list">
              <div class="completion-card">
                <div class="completion-header">
                  <div class="completion-name">Sarah Johnson</div>
                  <span class="completed-badge">COMPLETED</span>
                </div>
                <div class="completion-dept">Cardiology • Dr. Ahmed</div>
                <div class="completion-time">
                  <svg class="clock-icon" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10"></circle>
                  </svg>
                  11:30 AM - 12:15 PM
                </div>
              </div>

              <div class="completion-card">
                <div class="completion-header">
                  <div class="completion-name">Michael Chen</div>
                  <span class="completed-badge">COMPLETED</span>
                </div>
                <div class="completion-dept">Orthopedics • Dr. Smith</div>
                <div class="completion-time">
                  <svg class="clock-icon" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10"></circle>
                  </svg>
                  02:00 PM - 02:45 PM
                </div>
              </div>
            </div>

            <!-- Generate Reports Card -->
            <div class="reports-card">
              <h3 class="reports-title">Generate Reports</h3>
              <p class="reports-description">Download comprehensive monthly analytical hospital performance reports with one click.</p>
              <button class="download-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download PDF
              </button>
            </div>
          </div>
        </div>

        <!-- CLINICAL OCCUPANCY SECTION -->
        <div class="occupancy-section">
          <h2 class="section-title">Clinical Occupancy by Department</h2>
          <div class="occupancy-grid">
            <div class="occupancy-item">
              <div class="occupancy-label">
                <span>EMERGENCY WARD</span>
                <span>84%</span>
              </div>
              <div class="occupancy-bar">
                <div class="occupancy-fill" style="width: 84%; background-color: #E53E3E;"></div>
              </div>
            </div>

            <div class="occupancy-item">
              <div class="occupancy-label">
                <span>ICU / INTENSIVE CARE</span>
                <span>42%</span>
              </div>
              <div class="occupancy-bar">
                <div class="occupancy-fill" style="width: 42%; background-color: #1B5E8F;"></div>
              </div>
            </div>

            <div class="occupancy-item">
              <div class="occupancy-label">
                <span>OUTPATIENT CLINIC</span>
                <span>67%</span>
              </div>
              <div class="occupancy-bar">
                <div class="occupancy-fill" style="width: 67%; background-color: #38A169;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FLOATING ACTION BUTTON -->
      <button class="fab" @click="navigateTo('/admin/new-appointment')" title="Create new">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
        </svg>
      </button>
    </div>
  </AdminLayout>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dashboard-content {
  min-height: 100%;
  width: 100%;
}

/* PAGE HEADER */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
}

.header-left {
  flex: 1;
  text-align: left;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1A2B4A;
  margin: 0 0 6px 0;
  text-align: left;
}

.page-subtitle {
  font-size: 14px;
  color: #718096;
  margin: 0;
  text-align: left;
}

.view-toggle {
  background: #F0F4F8;
  border-radius: 8px;
  padding: 4px;
  display: flex;
  gap: 2px;
}

.toggle-btn {
  background: transparent;
  color: #718096;
  border-radius: 6px;
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn.active {
  background: #1B3A6B;
  color: white;
  font-weight: 600;
}

.toggle-btn:hover:not(.active) {
  color: #1A2B4A;
}

/* ============================================
   MAIN CONTENT AREA
   ============================================ */

.loading-container {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 16px;
}

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

/* STATS GRID */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  padding: 20px;
  position: relative;
}

.stat-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.stat-icon {
  width: 44px;
  height: 44px;
  background: #EBF4FF;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon svg {
  width: 20px;
  height: 20px;
  color: #1B5E8F;
}

.stat-badge {
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  background: #EBF4FF;
  color: #1B5E8F;
}

.stat-card:nth-child(4) .stat-badge {
  background: #FFF5F5;
  color: #E53E3E;
}

.stat-label {
  font-size: 13px;
  color: #718096;
  font-weight: 400;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1A2B4A;
  margin-bottom: 12px;
}

.stat-underline {
  height: 3px;
  width: 48px;
  background: #1B5E8F;
  border-radius: 2px;
}

/* TWO COLUMN ROW */
.two-column-row {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
  margin-bottom: 32px;
}

.left-column {
  flex: 1;
}

.right-column {
  width: 380px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1A2B4A;
  margin: 0;
}

.view-all-link {
  font-size: 13px;
  color: #1B5E8F;
  text-decoration: none;
  transition: text-decoration 0.2s ease;
}

.view-all-link:hover {
  text-decoration: underline;
}

.today-badge {
  background: #F0F4F8;
  color: #718096;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  padding: 4px 10px;
  border-radius: 6px;
}

/* TABLE */
.table-container {
  background: white;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
}

.appointments-table {
  width: 100%;
  border-collapse: collapse;
}

.appointments-table thead {
  background: #F7F9FC;
  border-bottom: 1px solid #E2E8F0;
}

.appointments-table th {
  padding: 12px 20px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  color: #A0AEC0;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 600;
}

.appointments-table tbody tr {
  border-bottom: 1px solid #F0F4F8;
  transition: background-color 0.2s ease;
}

.appointments-table tbody tr:hover {
  background: #F7F9FC;
}

.appointments-table tbody tr:last-child {
  border-bottom: none;
}

.appointments-table td {
  padding: 16px 20px;
  font-size: 14px;
  color: #2D3748;
}

.patient-col {
  display: flex;
  align-items: center;
  gap: 12px;
}

.patient-avatar {
  width: 36px;
  height: 36px;
  background: #1B3A6B;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.patient-info {
  flex: 1;
}

.patient-name {
  font-size: 14px;
  font-weight: 600;
  color: #1A2B4A;
}

.patient-id {
  font-size: 12px;
  color: #A0AEC0;
}

.practitioner-col {
  display: flex;
  align-items: center;
  gap: 8px;
}

.practitioner-icon {
  width: 14px;
  height: 14px;
  color: #718096;
  flex-shrink: 0;
}

.schedule-col {
}

.schedule-date {
  font-size: 13px;
  color: #2D3748;
  font-weight: 500;
}

.schedule-time {
  font-size: 12px;
  color: #A0AEC0;
}

.action-col {
}

.action-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.action-btn svg {
  width: 16px;
  height: 16px;
  color: #A0AEC0;
  transition: color 0.2s ease;
}

.action-btn:hover svg {
  color: #1B5E8F;
}

/* COMPLETIONS LIST */
.completions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.completion-card {
  background: white;
  border-radius: 10px;
  border: 1px solid #E2E8F0;
  padding: 14px 16px;
}

.completion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.completion-name {
  font-size: 14px;
  font-weight: 600;
  color: #1A2B4A;
}

.completed-badge {
  background: #EBF4FF;
  color: #1B5E8F;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 3px 8px;
  border-radius: 4px;
}

.completion-dept {
  font-size: 12px;
  color: #718096;
  margin-top: 4px;
  text-align: left;
}

.completion-time {
  font-size: 12px;
  color: #A0AEC0;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
}

.clock-icon {
  width: 12px;
  height: 12px;
  color: #A0AEC0;
}

/* REPORTS CARD */
.reports-card {
  background: #1B3A6B;
  border-radius: 12px;
  padding: 24px;
  margin-top: 16px;
}

.reports-title {
  font-size: 18px;
  font-weight: 700;
  color: white;
  margin: 0 0 10px 0;
}

.reports-description {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.6;
  margin: 0 0 20px 0;
}

.download-btn {
  background: white;
  color: #1B3A6B;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.download-btn:hover {
  background: #F0F4F8;
}

.download-btn svg {
  width: 16px;
  height: 16px;
}

/* OCCUPANCY SECTION */
.occupancy-section {
  margin-top: 32px;
  margin-bottom: 16px;
  text-align: left;
}

.occupancy-section .section-title {
  margin-bottom: 24px;
}

.occupancy-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.occupancy-item {
}

.occupancy-label {
  font-size: 11px;
  font-weight: 600;
  color: #718096;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
}

.occupancy-bar {
  height: 6px;
  background: #E2E8F0;
  border-radius: 3px;
  overflow: hidden;
}

.occupancy-fill {
  height: 100%;
  border-radius: 3px;
}

/* FLOATING ACTION BUTTON */
.fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 48px;
  height: 48px;
  background: #1B3A6B;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(27, 58, 107, 0.4);
  transition: all 0.2s ease;
  z-index: 500;
}

.fab:hover {
  background: #152D54;
  transform: scale(1.05);
}

.fab svg {
  width: 20px;
  height: 20px;
  color: white;
}

/* ============================================
   RESPONSIVE DESIGN
   ============================================ */

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .two-column-row {
    grid-template-columns: 1fr;
  }

  .right-column {
    width: 100%;
  }

  .occupancy-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 1001;
  }

  .navbar {
    left: 0;
  }

  .main-content {
    margin-left: 0;
    margin-top: 64px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .search-bar {
    width: 200px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .view-toggle {
    width: 100%;
    justify-content: center;
  }

  .occupancy-grid {
    grid-template-columns: 1fr;
  }
}
</style>
