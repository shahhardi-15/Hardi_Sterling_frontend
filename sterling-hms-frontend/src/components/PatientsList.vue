<template>
  <div class="bg-white rounded-lg shadow-md">
    <div class="p-6 border-b border-gray-200 flex justify-between items-center">
      <h2 class="text-xl font-semibold text-gray-900 flex items-center">
        <span class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
          </svg>
        </span>
        Patient Records ({{ total }})
      </h2>
      <div class="text-sm text-gray-600">
        Page {{ currentPage }} of {{ Math.ceil(total / limit) }}
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-6 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      <p class="mt-2 text-gray-600">Loading patient records...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="patients.length === 0" class="p-6 text-center text-gray-600">
      <svg class="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 2.748m0-2.748L9.172 9.172M12 21H7a2 2 0 01-2-2V9a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2z"></path>
      </svg>
      <p>No patient records found</p>
    </div>

    <!-- Patients Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Patient Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Phone</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date of Birth</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Blood Type</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Registered</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="patient in patients" :key="patient.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">
                {{ patient.firstName }} {{ patient.lastName }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-600">{{ patient.email }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-600">{{ patient.phone }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-600">
                {{ patient.dateOfBirth ? formatDate(patient.dateOfBirth) : '-' }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span v-if="patient.bloodType" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {{ patient.bloodType }}
              </span>
              <span v-else class="text-gray-400">-</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-600">{{ formatDate(patient.createdAt) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <button
                @click="openDetails(patient)"
                class="text-blue-600 hover:text-blue-900 font-medium"
              >
                View
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="total > limit" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
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
        <span class="px-3 py-1 bg-gray-100 rounded text-sm">Page {{ currentPage }}</span>
        <button
          @click="nextPage"
          :disabled="currentPage * limit >= total"
          class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Patient Details Modal -->
    <div v-if="selectedPatient" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 flex justify-between items-center">
          <h3 class="text-xl font-semibold">
            {{ selectedPatient.firstName }} {{ selectedPatient.lastName }}
          </h3>
          <button @click="selectedPatient = null" class="text-white hover:opacity-80">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="p-6 space-y-6">
          <!-- Personal Info -->
          <div>
            <h4 class="font-semibold text-gray-900 mb-4">Personal Information</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div><span class="text-gray-600">Email:</span> {{ selectedPatient.email }}</div>
              <div><span class="text-gray-600">Phone:</span> {{ selectedPatient.phone }}</div>
              <div><span class="text-gray-600">Date of Birth:</span> {{ selectedPatient.dateOfBirth ? formatDate(selectedPatient.dateOfBirth) : '-' }}</div>
              <div><span class="text-gray-600">Gender:</span> {{ selectedPatient.gender || '-' }}</div>
              <div><span class="text-gray-600">Blood Type:</span> {{ selectedPatient.bloodType || '-' }}</div>
            </div>
          </div>

          <!-- Address Info -->
          <div v-if="selectedPatient.address">
            <h4 class="font-semibold text-gray-900 mb-4">Address</h4>
            <div class="text-sm space-y-1">
              <p>{{ selectedPatient.address }}</p>
              <p>{{ selectedPatient.city }}, {{ selectedPatient.state }} {{ selectedPatient.postalCode }}</p>
              <p>{{ selectedPatient.country }}</p>
            </div>
          </div>

          <!-- Medical Info -->
          <div v-if="selectedPatient.allergies">
            <h4 class="font-semibold text-gray-900 mb-2">Allergies</h4>
            <p class="text-sm bg-red-50 p-3 rounded text-red-800">{{ selectedPatient.allergies }}</p>
          </div>

          <div v-if="selectedPatient.medicalConditions">
            <h4 class="font-semibold text-gray-900 mb-2">Medical Conditions</h4>
            <p class="text-sm bg-yellow-50 p-3 rounded text-yellow-800">{{ selectedPatient.medicalConditions }}</p>
          </div>

          <div v-if="selectedPatient.currentMedications">
            <h4 class="font-semibold text-gray-900 mb-2">Current Medications</h4>
            <p class="text-sm bg-blue-50 p-3 rounded text-blue-800">{{ selectedPatient.currentMedications }}</p>
          </div>

          <!-- Emergency Contact -->
          <div v-if="selectedPatient.emergencyContactName">
            <h4 class="font-semibold text-gray-900 mb-4">Emergency Contact</h4>
            <div class="text-sm space-y-1">
              <p><span class="text-gray-600">Name:</span> {{ selectedPatient.emergencyContactName }}</p>
              <p><span class="text-gray-600">Phone:</span> {{ selectedPatient.emergencyContactPhone }}</p>
            </div>
          </div>

          <div class="border-t border-gray-200 pt-4 text-xs text-gray-600">
            <p>Registered: {{ formatDate(selectedPatient.createdAt) }}</p>
            <p>Last Updated: {{ formatDate(selectedPatient.updatedAt) }}</p>
          </div>
        </div>

        <div class="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            @click="selectedPatient = null"
            class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Close
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
const patients = ref([])
const total = ref(0)
const currentPage = ref(1)
const limit = 10
const selectedPatient = ref(null)

onMounted(() => {
  loadPatients()
})

async function loadPatients() {
  loading.value = true
  try {
    const response = await receptionistStore.getPatients(currentPage.value, limit)
    patients.value = response.patients
    total.value = response.total
  } catch (err) {
    console.error('Failed to load patients:', err)
  } finally {
    loading.value = false
  }
}

function openDetails(patient) {
  selectedPatient.value = patient
}

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    loadPatients()
  }
}

function nextPage() {
  if (currentPage.value * limit < total.value) {
    currentPage.value++
    loadPatients()
  }
}

function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  })
}
</script>
