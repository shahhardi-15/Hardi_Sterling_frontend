<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'

const router = useRouter()
const adminStore = useAdminStore()

const email = ref('')
const password = ref('')
const localError = ref('')

const handleLogin = async () => {
  localError.value = ''

  if (!email.value || !password.value) {
    localError.value = 'Please fill in all fields'
    return
  }

  // Validate that email matches admin email format
  if (email.value !== 'adminsterling@gmail.com') {
    localError.value = 'Invalid email. Only admin can login'
    return
  }

  try {
    await adminStore.loginAdmin(email.value, password.value)
    // Redirect to admin dashboard after successful login
    router.push('/admin/dashboard')
  } catch (err) {
    localError.value = adminStore.error || 'Incorrect password'
  }
}

const handleKeyPress = (e) => {
  if (e.key === 'Enter') {
    handleLogin()
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div class="flex items-center justify-center mb-4">
          <svg class="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 class="text-4xl font-bold text-gray-900">Sterling HMS</h1>
        <p class="mt-2 text-gray-600">Admin Portal</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white rounded-lg shadow-xl p-8 space-y-6">
        <h2 class="text-2xl font-semibold text-gray-900 text-center">Admin Login</h2>

        <!-- Error Message -->
        <div v-if="localError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {{ localError }}
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Email Input -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Admin Email
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              required
              :disabled="adminStore.loading"
              @keypress="handleKeyPress"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
              placeholder="adminsterling@gmail.com"
            />
            <p class="mt-1 text-xs text-gray-500">Admin access only</p>
          </div>

          <!-- Password Input -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
              :disabled="adminStore.loading"
              @keypress="handleKeyPress"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
              placeholder="••••••••"
            />
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="adminStore.loading"
            class="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 disabled:transform-none"
          >
            <span v-if="!adminStore.loading">Sign In as Admin</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          </button>
        </form>

        <!-- Divider -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">Security Notice</span>
          </div>
        </div>

        <!-- Security Info -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
          <p class="font-semibold mb-2">Admin Access Only</p>
          <ul class="list-disc list-inside space-y-1">
            <li>This portal is restricted to authorized administrators</li>
            <li>All admin actions are logged for audit purposes</li>
            <li>Session timeout after 24 hours of inactivity</li>
          </ul>
        </div>

        <!-- Patient Login Link -->
        <p class="text-center text-sm text-gray-600">
          Patient login?
          <router-link to="/login" class="text-red-600 hover:text-red-500 font-medium">
            Sign in here
          </router-link>
        </p>
      </div>

      <!-- Footer -->
      <p class="text-center text-xs text-gray-500">
        © 2026 Sterling HMS. All rights reserved.
      </p>
    </div>
  </div>
</template>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}
</style>
