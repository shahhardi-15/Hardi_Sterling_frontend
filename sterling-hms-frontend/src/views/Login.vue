<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const localError = ref('')

const handleLogin = async () => {
  localError.value = ''
  
  if (!email.value || !password.value) {
    localError.value = 'Please fill in all fields'
    return
  }

  try {
    await authStore.signin(email.value, password.value)
    
    // Redirect based on user type
    if (authStore.isAdmin) {
      router.push('/admin/dashboard')
    } else {
      router.push('/dashboard')
    }
  } catch (err) {
    if (email.value === 'adminsterling@gmail.com') {
      localError.value = 'Invalid admin credentials'
    } else {
      localError.value = authStore.error || 'Login failed'
    }
  }
}

const handleKeyPress = (e) => {
  if (e.key === 'Enter') {
    handleLogin()
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900">Sterling HMS</h1>
        <p class="mt-2 text-gray-600">Hospital Management System</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white rounded-lg shadow-xl p-8 space-y-6">
        <h2 class="text-2xl font-semibold text-gray-900 text-center">Sign In</h2>

        <!-- Error Message -->
        <div v-if="localError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {{ localError }}
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Email Input -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              required
              :disabled="authStore.loading"
              @keypress="handleKeyPress"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
              placeholder="you@example.com"
            />
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
              :disabled="authStore.loading"
              @keypress="handleKeyPress"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
              placeholder="••••••••"
            />
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input
                v-model="rememberMe"
                type="checkbox"
                :disabled="authStore.loading"
                class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
              />
              <span class="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <a @click="router.push('/forgot-password')" class="text-sm text-indigo-600 hover:text-indigo-500 font-medium cursor-pointer">
              Forgot password?
            </a>
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 disabled:transform-none"
          >
            <span v-if="!authStore.loading">Sign In</span>
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
            <span class="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <!-- Social Login (Optional) -->
        <div class="grid grid-cols-2 gap-4">
          <button
            type="button"
            class="w-full bg-white border border-gray-300 rounded-lg py-2 px-4 text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            <span class="flex items-center justify-center">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.889-2.868 5.776-5.776 5.776 1.699 0 3.289-.736 4.357-1.908.98-1.054 1.611-2.428 1.666-3.889l.008-.168c.024-.71.249-1.376.603-1.947z" />
              </svg>
              <span class="ml-2">Google</span>
            </span>
          </button>
          <button
            type="button"
            class="w-full bg-white border border-gray-300 rounded-lg py-2 px-4 text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            <span class="flex items-center justify-center">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.603-3.369-1.343-3.369-1.343-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.891 1.53 2.341 1.544 2.914 1.19.092-.926.35-1.546.636-1.903-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.023A9.578 9.578 0 0 1 10 4.508c.85.004 1.705.114 2.504.336 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.138 18.192 20 14.442 20 10.017 20 4.484 15.522 0 10 0z" clip-rule="evenodd" />
              </svg>
              <span class="ml-2">GitHub</span>
            </span>
          </button>
        </div>

        <!-- Sign Up Link -->
        <p class="text-center text-sm text-gray-600">
          Don't have an account?
          <router-link to="/signup" class="text-indigo-600 hover:text-indigo-500 font-medium">
            Sign up
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
