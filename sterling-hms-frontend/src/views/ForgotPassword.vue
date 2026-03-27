<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import authAPI from '@/api/auth'

const router = useRouter()

// State
const currentStep = ref(1) // 1: Email, 2: Password Reset
const email = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const resetToken = ref('')

// UI State
const loading = ref(false)
const error = ref('')
const success = ref('')

// Password validation requirements
const passwordRequirements = {
  minLength: computed(() => newPassword.value.length >= 8),
  hasUppercase: computed(() => /[A-Z]/.test(newPassword.value)),
  hasLowercase: computed(() => /[a-z]/.test(newPassword.value)),
  hasNumber: computed(() => /[0-9]/.test(newPassword.value)),
  hasSpecial: computed(() => /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?/~`]/.test(newPassword.value)),
}

const isPasswordValid = computed(() => {
  return (
    passwordRequirements.minLength.value &&
    passwordRequirements.hasUppercase.value &&
    passwordRequirements.hasLowercase.value &&
    passwordRequirements.hasNumber.value &&
    passwordRequirements.hasSpecial.value &&
    newPassword.value === confirmPassword.value
  )
})

const passwordStrengthPercent = computed(() => {
  let strength = 0
  if (passwordRequirements.minLength.value) strength += 20
  if (passwordRequirements.hasUppercase.value) strength += 20
  if (passwordRequirements.hasLowercase.value) strength += 20
  if (passwordRequirements.hasNumber.value) strength += 20
  if (passwordRequirements.hasSpecial.value) strength += 20
  return strength
})

// Step 1: Request Password Reset
const handleForgotPassword = async () => {
  error.value = ''
  success.value = ''

  if (!email.value) {
    error.value = 'Please enter your email address'
    return
  }

  loading.value = true
  try {
    await authAPI.forgotPassword(email.value)
    success.value = 'Password reset link sent to your email. Check your inbox and click the link to reset your password.'
    email.value = ''
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to send reset link. Please try again.'
  } finally {
    loading.value = false
  }
}

// Check if we're coming from email link with token
onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const token = urlParams.get('token')
  if (token) {
    resetToken.value = token
    currentStep.value = 2
  }
})

// Step 2: Reset Password
const handleResetPassword = async () => {
  error.value = ''
  success.value = ''

  if (!resetToken.value) {
    error.value = 'No reset token found. Please click the link from your email.'
    return
  }

  if (!newPassword.value || !confirmPassword.value) {
    error.value = 'Please fill in all password fields'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  if (!isPasswordValid.value) {
    error.value = 'Password does not meet all requirements'
    return
  }

  loading.value = true
  try {
    await authAPI.resetPassword(resetToken.value, newPassword.value)
    success.value = 'Password reset successfully! Redirecting to login...'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to reset password. Please try again.'
  } finally {
    loading.value = false
  }
}

// Go back to previous step
const goBack = () => {
  if (currentStep.value > 1) {
    error.value = ''
    success.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    currentStep.value = 1
  }
}

// Back to Login
const goToLogin = () => {
  router.push('/login')
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

      <!-- Forgot Password Card -->
      <div class="bg-white rounded-lg shadow-xl p-8 space-y-6">
        <h2 class="text-2xl font-semibold text-gray-900 text-center">Reset Password</h2>

        <!-- Progress Steps -->
        <div class="flex items-center justify-between mb-8">
          <div :class="['flex flex-col items-center', currentStep >= 1 ? 'text-indigo-600' : 'text-gray-400']">
            <div :class="['w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold', currentStep >= 1 ? 'bg-indigo-600' : 'bg-gray-300']">
              1
            </div>
            <span class="text-xs mt-2">Email</span>
          </div>

          <div :class="['flex-1 h-1 mx-2 rounded', currentStep >= 2 ? 'bg-indigo-600' : 'bg-gray-300']"></div>

          <div :class="['flex flex-col items-center', currentStep >= 2 ? 'text-indigo-600' : 'text-gray-400']">
            <div :class="['w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold', currentStep >= 2 ? 'bg-indigo-600' : 'bg-gray-300']">
              2
            </div>
            <span class="text-xs mt-2">Password</span>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {{ error }}
        </div>

        <!-- Success Message -->
        <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {{ success }}
        </div>

        <!-- Step 1: Email -->
        <form v-if="currentStep === 1" @submit.prevent="handleForgotPassword" class="space-y-5">
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
              :disabled="loading"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
              placeholder="you@example.com"
            />
            <p class="mt-2 text-sm text-gray-600">
              Enter the email address associated with your account. We'll send you a reset link.
            </p>
          </div>

          <button
            type="submit"
            :disabled="loading || !email"
            class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            {{ loading ? 'Sending...' : 'Send Reset Link' }}
          </button>

          <button
            type="button"
            @click="goToLogin"
            class="w-full text-indigo-600 hover:text-indigo-700 font-semibold py-2 px-4"
          >
            Back to Login
          </button>
        </form>

        <!-- Step 2: Password Reset (only visible when we have a token) -->
        <div v-if="resetToken && currentStep === 2" class="space-y-5">
          <form @submit.prevent="handleResetPassword" class="space-y-5">
          <!-- New Password -->
          <div>
            <label for="new-password" class="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              id="new-password"
              v-model="newPassword"
              type="password"
              required
              :disabled="loading"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
              placeholder="••••••••"
            />
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              required
              :disabled="loading"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
              placeholder="••••••••"
            />
            <p v-if="newPassword && confirmPassword && newPassword !== confirmPassword" class="mt-1 text-sm text-red-600">
              Passwords do not match
            </p>
          </div>

          <!-- Password Strength Indicator -->
          <div v-if="newPassword" class="bg-gray-50 rounded-lg p-4 space-y-3">
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-700">Password Strength</span>
                <span class="text-xs font-semibold" :class="passwordStrengthPercent >= 80 ? 'text-green-600' : passwordStrengthPercent >= 60 ? 'text-yellow-600' : 'text-red-600'">
                  {{ passwordStrengthPercent }}%
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-300"
                  :class="passwordStrengthPercent >= 80 ? 'bg-green-600' : passwordStrengthPercent >= 60 ? 'bg-yellow-600' : 'bg-red-600'"
                  :style="{ width: passwordStrengthPercent + '%' }"
                ></div>
              </div>
            </div>

            <!-- Requirements Checklist -->
            <div class="space-y-1 text-sm">
              <div :class="['flex items-center', passwordRequirements.minLength.value ? 'text-green-600' : 'text-gray-500']">
                <span class="mr-2">{{ passwordRequirements.minLength.value ? '✓' : '○' }}</span>
                At least 8 characters
              </div>
              <div :class="['flex items-center', passwordRequirements.hasUppercase.value ? 'text-green-600' : 'text-gray-500']">
                <span class="mr-2">{{ passwordRequirements.hasUppercase.value ? '✓' : '○' }}</span>
                At least one uppercase letter (A-Z)
              </div>
              <div :class="['flex items-center', passwordRequirements.hasLowercase.value ? 'text-green-600' : 'text-gray-500']">
                <span class="mr-2">{{ passwordRequirements.hasLowercase.value ? '✓' : '○' }}</span>
                At least one lowercase letter (a-z)
              </div>
              <div :class="['flex items-center', passwordRequirements.hasNumber.value ? 'text-green-600' : 'text-gray-500']">
                <span class="mr-2">{{ passwordRequirements.hasNumber.value ? '✓' : '○' }}</span>
                At least one number (0-9)
              </div>
              <div :class="['flex items-center', passwordRequirements.hasSpecial.value ? 'text-green-600' : 'text-gray-500']">
                <span class="mr-2">{{ passwordRequirements.hasSpecial.value ? '✓' : '○' }}</span>
                At least one special character (!@#$%^&*)
              </div>
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading || !isPasswordValid"
            class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            {{ loading ? 'Resetting...' : 'Reset Password' }}
          </button>

          <button
            type="button"
            @click="goBack"
            class="w-full text-gray-600 hover:text-gray-700 font-semibold py-2 px-4"
          >
            Back
          </button>
          </form>
        </div>

        <!-- Placeholder when Step 2 shown without token -->
        <div v-if="!resetToken && currentStep === 2" class="text-center space-y-4">
          <p class="text-gray-600">Please click the reset link from your email to set a new password.</p>
          <button
            type="button"
            @click="goToLogin"
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Return to Login
          </button>
        </div>
      </div>

      <!-- Footer Links -->
      <div class="text-center space-y-2">
        <button
          @click="goToLogin"
          class="text-indigo-600 hover:text-indigo-700 font-semibold"
        >
          Return to Login
        </button>
      </div>
    </div>
  </div>
</template>
