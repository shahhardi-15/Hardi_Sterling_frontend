<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import adminAPI from '@/api/admin'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const stats = ref(null)
const showMenu = ref(false)

onMounted(async () => {
  // Initialize auth data from storage
  authStore.initializeAuth()

  // Check if admin is authenticated
  if (!authStore.isAdmin) {
    router.push('/login')
    return
  }

  // Fetch dashboard statistics
  loading.value = true
  try {
    const response = await adminAPI.getDashboardStats(authStore.token)
    stats.value = response.data.stats
  } catch (err) {
    error.value = 'Failed to load dashboard statistics'
    console.error('Error loading stats:', err)
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
  showMenu.value = false
  router.push(route)
}
</script>

<template>
  <div v-if="authStore.isAdmin" class="min-h-screen bg-gray-100">
    <!-- Navigation Bar -->
    <nav class="bg-red-600 text-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <div class="flex items-center space-x-2">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span class="text-xl font-bold">Sterling HMS - Admin</span>
            </div>
          </div>

          <!-- Menu Button (Mobile) -->
          <div class="flex items-center md:hidden">
            <button
              @click="showMenu = !showMenu"
              class="inline-flex items-center justify-center p-2 rounded-md hover:bg-red-700 focus:outline-none"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <!-- Admin Menu (Desktop) -->
          <div class="hidden md:flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
              <span>{{ authStore.admin?.name || 'Admin' }}</span>
            </div>
            <button
              @click="handleLogout"
              class="bg-red-700 hover:bg-red-800 text-white px-3 py-2 rounded-md text-sm font-medium transition"
            >
              Logout
            </button>
          </div>
        </div>

        <!-- Mobile Menu -->
        <div v-if="showMenu" class="md:hidden pb-4">
          <div class="flex flex-col space-y-2">
            <div class="px-2 py-1 text-sm">
              <p class="text-red-100">{{ authStore.admin?.email }}</p>
              <p class="font-medium">{{ authStore.admin?.name }}</p>
            </div>
            <button
              @click="handleLogout"
              class="w-full bg-red-700 hover:bg-red-800 text-white px-3 py-2 rounded-md text-sm font-medium transition text-left"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Section -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">
          Welcome, {{ authStore.admin?.name || 'Admin' }}!
        </h1>
        <p class="text-gray-600 mt-2">Here's your dashboard overview</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
        {{ error }}
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="text-center">
          <svg class="animate-spin h-12 w-12 text-red-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-600">Loading dashboard...</p>
        </div>
      </div>

      <!-- Stats Cards -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Patients Card -->
        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Total Patients</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ stats?.totalPatients || 0 }}
              </p>
            </div>
            <div class="bg-blue-100 rounded-full p-4">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM4 20h16c1.1 0 2-.9 2-2v-2a6 6 0 00-6-6H4a6 6 0 000 12z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Total Appointments Card -->
        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Total Appointments</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ stats?.totalAppointments || 0 }}
              </p>
            </div>
            <div class="bg-green-100 rounded-full p-4">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Total Doctors Card -->
        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Total Doctors</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ stats?.totalDoctors || 0 }}
              </p>
            </div>
            <div class="bg-purple-100 rounded-full p-4">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Total Staff Card -->
        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Total Staff</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ stats?.totalStaff || 0 }}
              </p>
            </div>
            <div class="bg-orange-100 rounded-full p-4">
              <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 8.646 4 4 0 010-8.646M12 14H8m0 0H4m8 0h4m0 0h4m-2 4v4m0 0v2m0-2h-4m0 0h-4m4 0v-2" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Recent Activity Section -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
          <div class="space-y-3">
            <button
              @click="navigateTo('/admin/patients')"
              class="w-full text-left px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition"
            >
              Manage Patients
            </button>
            <button
              @click="navigateTo('/admin/appointments')"
              class="w-full text-left px-4 py-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 font-medium transition"
            >
              View Appointments
            </button>
            <button
              @click="navigateTo('/admin/doctors')"
              class="w-full text-left px-4 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium transition"
            >
              Manage Doctors
            </button>
            <button
              @click="navigateTo('/admin/reports')"
              class="w-full text-left px-4 py-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium transition"
            >
              View Reports
            </button>
          </div>
        </div>

        <!-- System Status -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-gray-700 font-medium">API Server</span>
              <span class="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                <span class="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                Online
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-700 font-medium">Database</span>
              <span class="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                <span class="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                Connected
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-700 font-medium">Email Service</span>
              <span class="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                <span class="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                Active
              </span>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-200">
              <p class="text-sm text-gray-600">Last refresh: {{ new Date().toLocaleTimeString() }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- Redirect to login if not authenticated -->
  <div v-else class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="text-center">
      <p class="text-gray-600 mb-4">Redirecting to login...</p>
      <svg class="animate-spin h-8 w-8 text-red-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  </div>
</template>

<style scoped>
/* Add any component-specific styles here */
</style>
