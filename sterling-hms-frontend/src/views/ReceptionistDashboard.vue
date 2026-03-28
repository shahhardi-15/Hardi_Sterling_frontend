<template>
  <div v-if="!isAuthenticated" class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <p class="text-xl text-gray-600 mb-4">Redirecting to login...</p>
    </div>
  </div>
  <div v-else class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md">
      <div class="max-w-7xl mx-auto px-4 py-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold">Receptionist Dashboard</h1>
            <p class="text-purple-100 mt-1">Welcome, {{ receptionist?.name }}</p>
          </div>
          <button
            @click="handleLogout"
            class="bg-white text-purple-600 px-6 py-2 rounded-md font-semibold hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Dashboard Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-gray-600 text-sm font-medium">Total Patients</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats?.totalPatients || 0 }}</p>
            </div>
            <div class="bg-blue-100 p-3 rounded-full">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-gray-600 text-sm font-medium">Pending Approvals</p>
              <p class="text-3xl font-bold text-yellow-600 mt-2">{{ stats?.pendingAppointments || 0 }}</p>
            </div>
            <div class="bg-yellow-100 p-3 rounded-full">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-gray-600 text-sm font-medium">Approved</p>
              <p class="text-3xl font-bold text-green-600 mt-2">{{ stats?.approvedAppointments || 0 }}</p>
            </div>
            <div class="bg-green-100 p-3 rounded-full">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-gray-600 text-sm font-medium">Rejected</p>
              <p class="text-3xl font-bold text-red-600 mt-2">{{ stats?.rejectedAppointments || 0 }}</p>
            </div>
            <div class="bg-red-100 p-3 rounded-full">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-lg shadow">
        <div class="border-b border-gray-200">
          <div class="flex gap-0">
            <button
              v-for="tab in tabs"
              :key="tab"
              @click="activeTab = tab"
              :class="[
                'flex-1 py-4 px-6 text-center font-medium text-sm transition-colors',
                activeTab === tab
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900',
              ]"
            >
              {{ tab }}
            </button>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <PatientRegistration v-if="activeTab === 'Register Patient'" />
          <AppointmentApproval v-else-if="activeTab === 'Approve Appointments'" />
          <PatientsList v-else-if="activeTab === 'Manage Patients'" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReceptionistStore } from '../stores/receptionist'
import PatientRegistration from '../components/PatientRegistration.vue'
import AppointmentApproval from '../components/AppointmentApproval.vue'
import PatientsList from '../components/PatientsList.vue'

const router = useRouter()
const receptionistStore = useReceptionistStore()
const activeTab = ref('Register Patient')
const tabs = ['Register Patient', 'Approve Appointments', 'Manage Patients']
const stats = ref(null)

const isAuthenticated = computed(() => receptionistStore.isAuthenticated)
const receptionist = computed(() => receptionistStore.receptionist)

onMounted(async () => {
  // Restore session if needed
  receptionistStore.restoreSession()

  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }

  // Load dashboard stats
  try {
    stats.value = await receptionistStore.getDashboardStats()
  } catch (err) {
    console.error('Failed to load stats:', err)
  }
})

async function handleLogout() {
  try {
    await receptionistStore.logout()
    router.push('/login')
  } catch (err) {
    console.error('Logout error:', err)
  }
}
</script>
