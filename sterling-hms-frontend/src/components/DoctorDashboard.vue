<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
    <!-- Navigation -->
    <nav class="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-3">
            <span class="text-2xl">🩺</span>
            <h1 class="text-xl font-bold text-white">Sterling HMS - Doctor Dashboard</h1>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-right">
              <p class="text-sm text-blue-200">{{ doctorStore.doctor?.name }}</p>
              <p class="text-xs text-blue-300">{{ doctorStore.doctor?.specialization }}</p>
            </div>
            <button
              @click="handleLogout"
              class="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 text-red-200 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Error Message -->
      <div v-if="doctorStore.error" class="mb-6 bg-red-500/20 border border-red-400/50 text-red-200 px-4 py-3 rounded-lg">
        {{ doctorStore.error }}
      </div>

      <!-- Dashboard Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6 hover:bg-white/15 transition">
          <p class="text-blue-300 text-sm mb-2">Total Patients</p>
          <p class="text-3xl font-bold text-white">{{ dashboardStats?.totalPatients || 0 }}</p>
        </div>
        <div class="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6 hover:bg-white/15 transition">
          <p class="text-cyan-300 text-sm mb-2">Total Appointments</p>
          <p class="text-3xl font-bold text-white">{{ dashboardStats?.totalAppointments || 0 }}</p>
        </div>
        <div class="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6 hover:bg-white/15 transition">
          <p class="text-green-300 text-sm mb-2">Completed</p>
          <p class="text-3xl font-bold text-white">{{ dashboardStats?.completedAppointments || 0 }}</p>
        </div>
        <div class="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6 hover:bg-white/15 transition">
          <p class="text-yellow-300 text-sm mb-2">Upcoming</p>
          <p class="text-3xl font-bold text-white">{{ dashboardStats?.upcomingAppointments || 0 }}</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex space-x-2 mb-6 border-b border-white/10">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-4 py-3 font-semibold transition border-b-2',
            activeTab === tab.id
              ? 'text-cyan-400 border-cyan-400'
              : 'text-blue-300 border-transparent hover:text-blue-200'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->

      <!-- View Assigned Patients -->
      <div v-if="activeTab === 'patients'" class="space-y-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-white">Assigned Patients</h2>
          <input
            v-model="searchPatient"
            type="text"
            placeholder="Search by name, phone, or email..."
            class="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        <div class="bg-white/5 backdrop-blur border border-white/10 rounded-lg overflow-hidden">
          <div v-if="doctorStore.loading" class="p-8 text-center">
            <div class="inline-block animate-spin">⏳</div>
            <p class="text-blue-300 mt-2">Loading patients...</p>
          </div>

          <div v-else-if="filteredPatients.length === 0" class="p-8 text-center">
            <p class="text-blue-300">No patients assigned yet</p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-white/10 border-b border-white/10">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-blue-200 uppercase">Name</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-blue-200 uppercase">Phone</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-blue-200 uppercase">Email</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-blue-200 uppercase">Blood Type</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-blue-200 uppercase">Medical History</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="patient in filteredPatients" :key="patient.id" class="border-b border-white/5 hover:bg-white/5 transition">
                  <td class="px-6 py-4 text-white">{{ patient.name }}</td>
                  <td class="px-6 py-4 text-blue-200">{{ patient.phone || 'N/A' }}</td>
                  <td class="px-6 py-4 text-blue-200">{{ patient.email }}</td>
                  <td class="px-6 py-4 text-blue-200">{{ patient.bloodType || 'N/A' }}</td>
                  <td class="px-6 py-4 text-blue-200 max-w-xs truncate">{{ patient.medicalHistory || 'No history' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- View Appointments -->
      <div v-if="activeTab === 'appointments'" class="space-y-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-white">Appointments</h2>
          <select
            v-model="statusFilter"
            class="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <option value="">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No Show</option>
          </select>
        </div>

        <div class="bg-white/5 backdrop-blur border border-white/10 rounded-lg overflow-hidden">
          <div v-if="doctorStore.loading" class="p-8 text-center">
            <div class="inline-block animate-spin">⏳</div>
            <p class="text-blue-300 mt-2">Loading appointments...</p>
          </div>

          <div v-else-if="filteredAppointments.length === 0" class="p-8 text-center">
            <p class="text-blue-300">No appointments found</p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-white/10 border-b border-white/10">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-blue-200 uppercase">Patient</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-blue-200 uppercase">Date</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-blue-200 uppercase">Time</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-blue-200 uppercase">Reason</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-blue-200 uppercase">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-blue-200 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="appointment in filteredAppointments" :key="appointment.id" class="border-b border-white/5 hover:bg-white/5 transition">
                  <td class="px-6 py-4 text-white">{{ appointment.patientName }}</td>
                  <td class="px-6 py-4 text-blue-200">{{ appointment.appointmentDate }}</td>
                  <td class="px-6 py-4 text-blue-200">{{ appointment.timeSlot }}</td>
                  <td class="px-6 py-4 text-blue-200">{{ appointment.reason }}</td>
                  <td class="px-6 py-4">
                    <span :class="getStatusColor(appointment.status)" class="px-2 py-1 rounded text-xs font-semibold">
                      {{ appointment.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <button
                      @click="selectAppointmentForUpdate(appointment)"
                      class="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-200 rounded text-xs transition"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Update Appointment Status -->
      <div v-if="activeTab === 'update'" class="space-y-4">
        <h2 class="text-2xl font-bold text-white">Update Appointment Status</h2>

        <div v-if="selectedAppointment" class="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-blue-300">Patient</p>
              <p class="text-lg text-white font-semibold">{{ selectedAppointment.patientName }}</p>
            </div>
            <div>
              <p class="text-sm text-blue-300">Date & Time</p>
              <p class="text-lg text-white font-semibold">{{ selectedAppointment.appointmentDate }} - {{ selectedAppointment.timeSlot }}</p>
            </div>
            <div>
              <p class="text-sm text-blue-300">Reason</p>
              <p class="text-white">{{ selectedAppointment.reason }}</p>
            </div>
            <div>
              <p class="text-sm text-blue-300">Current Status</p>
              <p :class="getStatusColor(selectedAppointment.status)" class="px-2 py-1 rounded text-xs font-semibold w-fit">
                {{ selectedAppointment.status }}
              </p>
            </div>
          </div>

          <div class="border-t border-white/10 pt-4 space-y-4">
            <div>
              <label class="block text-sm font-semibold text-blue-100 mb-2">New Status</label>
              <select
                v-model="updateForm.status"
                class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="">Select Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-blue-100 mb-2">Notes (Optional)</label>
              <textarea
                v-model="updateForm.notes"
                rows="3"
                placeholder="Add any notes about this appointment..."
                class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              ></textarea>
            </div>

            <div class="flex space-x-3">
              <button
                @click="handleUpdateStatus"
                :disabled="!updateForm.status || doctorStore.loading"
                class="flex-1 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 disabled:bg-green-500/10 border border-green-400 text-green-200 rounded-lg font-semibold transition"
              >
                {{ doctorStore.loading ? 'Updating...' : 'Update Status' }}
              </button>
              <button
                @click="selectedAppointment = null; updateForm = { status: '', notes: '' }"
                class="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        <div v-else class="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-8 text-center">
          <p class="text-blue-300">Select an appointment from the "View Appointments" tab to update its status</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDoctorStore } from '@/stores/doctor'

const router = useRouter()
const doctorStore = useDoctorStore()

const activeTab = ref('patients')
const searchPatient = ref('')
const statusFilter = ref('')
const selectedAppointment = ref(null)
const updateForm = ref({ status: '', notes: '' })

const dashboardStats = ref(null)

const tabs = [
  { id: 'patients', label: '👥 View Assigned Patients' },
  { id: 'appointments', label: '📅 View Appointments' },
  { id: 'update', label: '✏️ Update Status' },
]

const filteredPatients = computed(() => {
  if (!searchPatient.value) return doctorStore.patients
  const search = searchPatient.value.toLowerCase()
  return doctorStore.patients.filter(p =>
    p.name.toLowerCase().includes(search) ||
    p.phone.toLowerCase().includes(search) ||
    p.email.toLowerCase().includes(search)
  )
})

const filteredAppointments = computed(() => {
  if (!statusFilter.value) return doctorStore.appointments
  return doctorStore.appointments.filter(a => a.status === statusFilter.value)
})

const getStatusColor = (status) => {
  const colors = {
    'upcoming': 'bg-yellow-500/20 text-yellow-200 border border-yellow-400/50',
    'completed': 'bg-green-500/20 text-green-200 border border-green-400/50',
    'cancelled': 'bg-red-500/20 text-red-200 border border-red-400/50',
    'no-show': 'bg-gray-500/20 text-gray-200 border border-gray-400/50',
  }
  return colors[status] || 'bg-blue-500/20 text-blue-200 border border-blue-400/50'
}

const selectAppointmentForUpdate = (appointment) => {
  selectedAppointment.value = appointment
  activeTab.value = 'update'
  updateForm.value = { status: '', notes: '' }
}

const handleUpdateStatus = async () => {
  if (!updateForm.value.status || !selectedAppointment.value) return

  try {
    await doctorStore.updateAppointmentStatus(
      selectedAppointment.value.id,
      updateForm.value.status,
      updateForm.value.notes
    )
    selectedAppointment.value = null
    updateForm.value = { status: '', notes: '' }
    activeTab.value = 'appointments'
    // Refresh appointments
    await doctorStore.getAppointments()
  } catch (err) {
    console.error('Error updating appointment:', err)
  }
}

const handleLogout = () => {
  doctorStore.logout()
  router.push('/login')
}

onMounted(async () => {
  try {
    // Check if doctor is authenticated
    if (!doctorStore.isAuthenticated) {
      router.push('/login')
      return
    }

    // Load dashboard data
    await Promise.all([
      doctorStore.getDashboardStats(),
      doctorStore.getAssignedPatients(),
      doctorStore.getAppointments(),
    ])

    dashboardStats.value = doctorStore.dashboardStats
  } catch (err) {
    console.error('Error loading dashboard:', err)
    router.push('/login')
  }
})
</script>

<style scoped>
/* Add any additional styles here */
</style>
