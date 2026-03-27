<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const agreeToTerms = ref(false)
const localError = ref('')
const success = ref(false)

const validateForm = () => {
  if (!firstName.value.trim()) {
    localError.value = 'First name is required'
    return false
  }
  if (!lastName.value.trim()) {
    localError.value = 'Last name is required'
    return false
  }
  if (!email.value) {
    localError.value = 'Email is required'
    return false
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    localError.value = 'Please enter a valid email address'
    return false
  }
  if (!password.value) {
    localError.value = 'Password is required'
    return false
  }
  if (password.value.length < 8) {
    localError.value = 'Password must be at least 8 characters'
    return false
  }
  if (password.value !== confirmPassword.value) {
    localError.value = 'Passwords do not match'
    return false
  }
  if (!agreeToTerms.value) {
    localError.value = 'You must agree to the terms and conditions'
    return false
  }
  return true
}

const handleSignUp = async () => {
  localError.value = ''
  success.value = false

  if (!validateForm()) {
    return
  }

  try {
    await authStore.signup(
      firstName.value,
      lastName.value,
      email.value,
      password.value
    )
    
    success.value = true
    
    // Redirect to dashboard after successful signup
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  } catch (err) {
    localError.value = authStore.error || 'Sign up failed. Please try again.'
  }
}

const handleKeyPress = (e) => {
  if (e.key === 'Enter') {
    handleSignUp()
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

      <!-- Sign Up Card -->
      <div class="bg-white rounded-lg shadow-xl p-8 space-y-6">
        <h2 class="text-2xl font-semibold text-gray-900 text-center">Create Account</h2>

        <!-- Success Message -->
        <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          Account created successfully! Redirecting to login...
        </div>

        <!-- Error Message -->
        <div v-if="localError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {{ localError }}
        </div>

        <!-- Sign Up Form -->
        <form @submit.prevent="handleSignUp" class="space-y-4">
          <!-- Name Fields -->
          <div class="grid grid-cols-2 gap-4">
            <!-- First Name -->
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                id="firstName"
                v-model="firstName"
                type="text"
                :disabled="authStore.loading"
                required
                @keypress="handleKeyPress"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
                placeholder="John"
              />
            </div>

            <!-- Last Name -->
            <div>
              <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                id="lastName"
                v-model="lastName"
                type="text"
                :disabled="authStore.loading"
                required
                @keypress="handleKeyPress"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
                placeholder="Doe"
              />
            </div>
          </div>

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
              :disabled="authStore.loading"
              required
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
              autocomplete="new-password"
              :disabled="authStore.loading"
              required
              @keypress="handleKeyPress"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
              placeholder="••••••••"
            />
            <p class="mt-1 text-xs text-gray-500">At least 8 characters</p>
          </div>

          <!-- Confirm Password Input -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              autocomplete="new-password"
              :disabled="authStore.loading"
              required
              @keypress="handleKeyPress"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
              placeholder="••••••••"
            />
          </div>

          <!-- Terms & Conditions -->
          <div class="flex items-start">
            <input
              id="agreeToTerms"
              v-model="agreeToTerms"
              type="checkbox"
              :disabled="authStore.loading"
              class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 mt-1"
            />
            <label for="agreeToTerms" class="ml-2 block text-sm text-gray-600">
              I agree to the
              <a href="#" class="text-indigo-600 hover:text-indigo-500 font-medium">terms and conditions</a>
              and
              <a href="#" class="text-indigo-600 hover:text-indigo-500 font-medium">privacy policy</a>
            </label>
          </div>

          <!-- Sign Up Button -->
          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 disabled:transform-none"
          >
            <span v-if="!authStore.loading">Create Account</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating account...
            </span>
          </button>
        </form>

        <!-- Sign In Link -->
        <p class="text-center text-sm text-gray-600">
          Already have an account?
          <router-link to="/login" class="text-indigo-600 hover:text-indigo-500 font-medium">
            Sign in
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
