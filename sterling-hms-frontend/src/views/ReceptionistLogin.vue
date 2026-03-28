<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-12">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-lg shadow-xl p-8">
        <!-- Header -->
        <div class="mb-8 text-center">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Sterling HMS</h1>
          <h2 class="text-xl font-semibold text-purple-600">Receptionist Portal</h2>
          <p class="text-gray-600 text-sm mt-2">Hospital Management System</p>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p class="text-red-800 text-sm">{{ error }}</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="receptionist@sterling.com"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-purple-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Logging in...' : 'Log In' }}
          </button>
        </form>

        <!-- Demo Credentials -->
        <div class="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p class="text-xs font-semibold text-blue-900 mb-2">Demo Credentials:</p>
          <p class="text-xs text-blue-800">
            <strong>Email:</strong> receptionist@sterling.com<br />
            <strong>Password:</strong> receptionist@123
          </p>
        </div>

        <!-- Links -->
        <div class="mt-6 text-center space-y-4">
          <p class="text-sm text-gray-600">
            Admin Portal?
            <router-link to="/admin/login" class="text-purple-600 hover:text-purple-700 font-semibold">
              Admin Login
            </router-link>
          </p>
          <p class="text-sm text-gray-600">
            Patient?
            <router-link to="/login" class="text-purple-600 hover:text-purple-700 font-semibold">
              Patient Login
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useReceptionistStore } from '../stores/receptionist'
import { useRouter } from 'vue-router'

const router = useRouter()
const receptionistStore = useReceptionistStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref(null)

async function handleLogin() {
  loading.value = true
  error.value = null

  try {
    await receptionistStore.login(email.value, password.value)
    router.push('/receptionist/dashboard')
  } catch (err) {
    error.value = err.message || 'An error occurred during login'
  } finally {
    loading.value = false
  }
}
</script>
