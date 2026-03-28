<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
      <span class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
        <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </span>
      Pending Appointments for Approval
    </h2>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
      <p class="mt-2 text-gray-600">Loading appointments...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="appointments.length === 0" class="text-center py-8 text-gray-600">
      <svg class="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      <p>No pending appointments at the moment</p>
    </div>

    <!-- Appointments Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Patient</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Doctor</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date & Time</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Reason</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="appointment in appointments" :key="appointment.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">
                {{ appointment.patientFirstName }} {{ appointment.patientLastName }}
              </div>
              <div class="text-sm text-gray-600">{{ appointment.patientEmail }}</div>
            </td>
            <td class="px-6 py-4">
              <div v-if="appointment.doctor" class="text-sm font-medium text-gray-900">
                {{ appointment.doctor.name }}
              </div>
              <div v-if="appointment.doctor" class="text-sm text-gray-600">
                {{ appointment.doctor.specialization }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">
                {{ formatDate(appointment.appointmentDate) }}
              </div>
              <div class="text-sm text-gray-600">{{ appointment.timeSlot }}</div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900">{{ appointment.reason }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm space-y-2">
              <button
                @click="handleApprove(appointment.id)"
                :disabled="processingId === appointment.id"
                class="block w-full bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {{ processingId === appointment.id ? 'Approving...' : 'Approve' }}
              </button>
              <button
                @click="showRejectModal(appointment.id)"
                :disabled="processingId === appointment.id"
                class="block w-full bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
              >
                {{ processingId === appointment.id ? 'Processing...' : 'Reject' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="total > limit" class="mt-6 flex items-center justify-between">
      <div class="text-sm text-gray-600">
        Showing {{ (currentPage - 1) * limit + 1 }} to {{ Math.min(currentPage * limit, total) }} of {{ total }}
      </div>
      <div class="flex gap-2">
        <button
          @click="previousPage"
          :disabled="currentPage === 1"
          class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <div class="px-3 py-1 bg-gray-100 rounded">Page {{ currentPage }}</div>
        <button
          @click="nextPage"
          :disabled="currentPage * limit >= total"
          class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Rejection Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Reject Appointment</h3>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Reason for Rejection</label>
          <textarea
            v-model="rejectionReason"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows="3"
            placeholder="Provide a reason for rejection..."
          ></textarea>
        </div>
        <div class="flex gap-2 justify-end">
          <button
            @click="closeRejectModal"
            class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="handleReject"
            :disabled="!rejectionReason.trim()"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useReceptionistStore } from '../stores/receptionist'

const receptionistStore = useReceptionistStore()
const loading = ref(false)
const appointments = ref([])
const total = ref(0)
const currentPage = ref(1)
const limit = 10
const processingId = ref(null)
const showModal = ref(false)
const rejectionReasonId = ref(null)
const rejectionReason = ref('')

onMounted(() => {
  loadAppointments()
})

async function loadAppointments() {
  loading.value = true
  try {
    const response = await receptionistStore.getPendingAppointments(currentPage.value, limit)
    appointments.value = response.appointments
    total.value = response.total
  } catch (err) {
    console.error('Failed to load appointments:', err)
  } finally {
    loading.value = false
  }
}

async function handleApprove(appointmentId) {
  processingId.value = appointmentId
  try {
    await receptionistStore.approveAppointment(appointmentId)
    loadAppointments()
  } catch (err) {
    console.error('Failed to approve appointment:', err)
  } finally {
    processingId.value = null
  }
}

function showRejectModal(appointmentId) {
  rejectionReasonId.value = appointmentId
  rejectionReason.value = ''
  showModal.value = true
}

function closeRejectModal() {
  showModal.value = false
  rejectionReasonId.value = null
  rejectionReason.value = ''
}

async function handleReject() {
  processingId.value = rejectionReasonId.value
  try {
    await receptionistStore.rejectAppointment(rejectionReasonId.value, rejectionReason.value)
    closeRejectModal()
    loadAppointments()
  } catch (err) {
    console.error('Failed to reject appointment:', err)
  } finally {
    processingId.value = null
  }
}

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    loadAppointments()
  }
}

function nextPage() {
  if (currentPage.value * limit < total.value) {
    currentPage.value++
    loadAppointments()
  }
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
