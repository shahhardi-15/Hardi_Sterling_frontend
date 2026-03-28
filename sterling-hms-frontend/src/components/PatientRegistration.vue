<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
      <span class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
        </svg>
      </span>
      Register New Patient
    </h2>

    <!-- Error Message -->
    <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
      <p class="text-red-800 text-sm">{{ error }}</p>
    </div>

    <!-- Success Message -->
    <div v-if="success" class="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
      <p class="text-green-800 text-sm">{{ success }}</p>
    </div>

    <!-- Registration Form -->
    <form @submit.prevent="handleRegister" class="space-y-6">
      <!-- Personal Information -->
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <input
              v-model="form.firstName"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
            <input
              v-model="form.lastName"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              v-model="form.email"
              type="email"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input
              v-model="form.phone"
              type="tel"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input
              v-model="form.password"
              type="password"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Minimum 8 characters"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input
              v-model="form.dateOfBirth"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              v-model="form.gender"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
            <select
              v-model="form.bloodType"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select...</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Address Information -->
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Address</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
            <input
              v-model="form.address"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              v-model="form.city"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              v-model="form.state"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
            <input
              v-model="form.postalCode"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              v-model="form.country"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <!-- Medical Information -->
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
        <div class="grid grid-cols-1 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
            <textarea
              v-model="form.allergies"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="2"
              placeholder="List any known allergies..."
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Medical Conditions</label>
            <textarea
              v-model="form.medicalConditions"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="2"
              placeholder="List any medical conditions..."
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Current Medications</label>
            <textarea
              v-model="form.currentMedications"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="2"
              placeholder="List current medications..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Emergency Contact -->
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
            <input
              v-model="form.emergencyContactName"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
            <input
              v-model="form.emergencyContactPhone"
              type="tel"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex gap-4">
        <button
          type="submit"
          :disabled="loading"
          class="flex-1 bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors disabled:opacity-50"
        >
          {{ loading ? 'Registering...' : 'Register Patient' }}
        </button>
        <button
          type="button"
          @click="resetForm"
          class="flex-1 bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
        >
          Clear
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useReceptionistStore } from '../stores/receptionist'

const receptionistStore = useReceptionistStore()
const loading = ref(false)
const error = ref(null)
const success = ref(null)

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  dateOfBirth: '',
  gender: '',
  bloodType: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  allergies: '',
  medicalConditions: '',
  currentMedications: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
})

async function handleRegister() {
  loading.value = true
  error.value = null
  success.value = null

  try {
    await receptionistStore.registerPatient(form.value)
    success.value = `Patient ${form.value.firstName} ${form.value.lastName} registered successfully!`
    resetForm()
  } catch (err) {
    error.value = err.message || 'Failed to register patient'
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.value = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    allergies: '',
    medicalConditions: '',
    currentMedications: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  }
  success.value = null
}
</script>
