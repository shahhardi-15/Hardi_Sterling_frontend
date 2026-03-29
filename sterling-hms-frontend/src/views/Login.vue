<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useReceptionistStore } from '@/stores/receptionist'
import { useDoctorStore } from '@/stores/doctor'
import adminAPI from '@/api/admin'

console.log('[LOGIN.VUE] Initializing...')

const router = useRouter()
const authStore = useAuthStore()
const receptionistStore = useReceptionistStore()
const doctorStore = useDoctorStore()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const localError = ref('')

console.log('[LOGIN.VUE] Setup complete')

const handleLogin = async (e) => {
  console.log('[HANDLER] handleLogin called!')
  console.log('[HANDLER] Event:', e)
  
  e?.preventDefault?.()
  
  localError.value = ''
  
  if (!email.value || !password.value) {
    localError.value = 'Please fill in all fields'
    console.log('[HANDLER] Missing fields')
    return
  }

  console.log('[HANDLER] Attempting login for:', email.value)
  authStore.loading = true

  try {
    // Receptionist login
    if (email.value === 'receptionist@sterling.com' || email.value.includes('receptionist')) {
      console.log('[HANDLER] Trying receptionist login')
      try {
        const response = await receptionistStore.login(email.value, password.value)
        console.log('[HANDLER] Receptionist login success:', response)
        console.log('[HANDLER] receptionistStore.token:', receptionistStore.token)
        console.log('[HANDLER] receptionistStore.isAuthenticated:', receptionistStore.isAuthenticated)
        authStore.loading = false
        console.log('[HANDLER] Redirecting to /receptionist/dashboard')
        await router.push('/receptionist/dashboard')
        console.log('[HANDLER] Receptionist redirect completed')
        return
      } catch (err) {
        console.error('[HANDLER] Receptionist login failed:', err.message)
      }
    }

    // Doctor login attempt
    console.log('[HANDLER] Trying doctor login')
    try {
      const response = await doctorStore.login(email.value, password.value)
      console.log('[HANDLER] Doctor API response received')
      console.log('[HANDLER] Response data:', response)
      
      // Check the response object returned from doctorStore.login()
      if (response && response.success === true) {
        console.log('[HANDLER] Doctor login success! Token:', !!response.token)
        console.log('[HANDLER] Doctor data:', response.doctor?.name)
        console.log('[HANDLER] doctorStore.token after login:', doctorStore.token)
        console.log('[HANDLER] doctorStore.isAuthenticated after login:', doctorStore.isAuthenticated)
        
        authStore.loading = false
        console.log('[HANDLER] About to redirect to /doctor/dashboard')
        
        try {
          await router.push('/doctor/dashboard')
          console.log('[HANDLER] Doctor redirect completed')
          return
        } catch (pushErr) {
          console.error('[HANDLER] Router push failed:', pushErr.message)
          // Fallback redirect
          window.location.href = '/doctor/dashboard'
          return
        }
      } else {
        console.log('[HANDLER] Doctor login response incomplete:', response)
        console.log('[HANDLER] response.success:', response?.success)
        console.log('[HANDLER] response.token:', !!response?.token)
        console.log('[HANDLER] response.doctor:', !!response?.doctor)
      }
    } catch (err) {
      console.error('[HANDLER] Doctor login failed:', err.message)
      console.error('[HANDLER] Error status:', err.response?.status)
      console.error('[HANDLER] Error data:', err.response?.data)
      // Continue to try other login methods
    }

    // Patient login
    console.log('[HANDLER] Trying patient login')
    try {
      const response = await authStore.signin(email.value, password.value)
      console.log('[HANDLER] Patient login success:', response)
      console.log('[HANDLER] authStore.token:', authStore.token)
      console.log('[HANDLER] authStore.isAuthenticated:', authStore.isAuthenticated)
      authStore.loading = false
      console.log('[HANDLER] Redirecting to /dashboard')
      await router.push('/dashboard')
      console.log('[HANDLER] Patient redirect completed')
      return
    } catch (err) {
      console.error('[HANDLER] Patient login failed:', err.message)
    }

    // Admin login
    console.log('[HANDLER] Trying admin login')
    try {
      console.log('[HANDLER] Calling adminAPI.login()')
      const adminResponse = await adminAPI.login(email.value, password.value)
      console.log('[HANDLER] Admin API response received:', adminResponse)
      console.log('[HANDLER] Response data:', adminResponse.data)
      
      console.log('[HANDLER] Setting authStore values')
      authStore.token = adminResponse.data.token
      authStore.admin = adminResponse.data.admin
      authStore.userType = 'admin'
      
      console.log('[HANDLER] Saving to localStorage')
      localStorage.setItem('authToken', adminResponse.data.token)
      localStorage.setItem('admin', JSON.stringify(adminResponse.data.admin))
      localStorage.setItem('userType', 'admin')
      
      console.log('[HANDLER] AuthStore state after setting:')
      console.log('  token:', !!authStore.token)
      console.log('  isAdmin:', authStore.isAdmin)
      console.log('  isAuthenticated:', authStore.isAuthenticated)
      console.log('  userType:', authStore.userType)
      
      authStore.loading = false
      
      console.log('[HANDLER] About to redirect to /admin/dashboard')
      try {
        await router.push('/admin/dashboard')
        console.log('[HANDLER] Admin redirect completed successfully')
      } catch (pushErr) {
        console.error('[HANDLER] Router.push error:', pushErr)
        // Fallback: try location redirect
        console.log('[HANDLER] Trying fallback location redirect')
        window.location.href = '/admin/dashboard'
      }
      return
    } catch (err) {
      console.error('[HANDLER] Admin login failed:', err.message)
      console.error('[HANDLER] Admin error details:', err)
    }

    localError.value = 'Invalid email or password'
  } catch (err) {
    console.error('[HANDLER] Unexpected error:', err)
    localError.value = err.message || 'Login failed'
  } finally {
    authStore.loading = false
  }
}

const handleKeyPress = (e) => {
  if (e.key === 'Enter') {
    console.log('[HANDLER] Enter key pressed')
    handleLogin(e)
  }
}

console.log('[LOGIN.VUE] Script setup complete')
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
    <!-- Decorative elements -->
    <div class="absolute top-0 left-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
    <div class="absolute top-0 right-0 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
    <div class="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

    <div class="w-full max-w-md space-y-8 relative z-10">
      <!-- Header with Icon -->
      <div class="text-center space-y-4">
        <h1 class="text-6xl font-bold text-white flex items-center justify-center gap-3">
          <span>🏥</span>
          Sterling HMS
        </h1>
      </div>

      <!-- Main Login Card -->
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 space-y-6 shadow-2xl hover:bg-white/15 transition duration-300">
        <div class="text-center space-y-2">
          <h2 class="text-3xl font-bold text-white">Welcome Back</h2>
          <p class="text-blue-200 text-sm">Access your medical management dashboard</p>
        </div>

        <!-- Error Message -->
        <div v-if="localError" class="bg-red-500/20 border border-red-400/50 backdrop-blur text-red-100 px-5 py-3 rounded-xl text-sm font-medium flex items-center space-x-2 animate-pulse">
          <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <span>{{ localError }}</span>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Email Input -->
          <div class="group">
            <label for="email" class="block text-sm font-semibold text-blue-100 mb-3 group-focus-within:text-cyan-300 transition">
              Email Address
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              required
              :disabled="authStore.loading"
              class="w-full px-5 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition focus:bg-white/15 focus:shadow-lg focus:shadow-cyan-500/20 disabled:opacity-50"
              placeholder="you@example.com"
            />
          </div>

          <!-- Password Input -->
          <div class="group">
            <label for="password" class="block text-sm font-semibold text-blue-100 mb-3 group-focus-within:text-cyan-300 transition">
              Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
              :disabled="authStore.loading"
              class="w-full px-5 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition focus:bg-white/15 focus:shadow-lg focus:shadow-cyan-500/20 disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between pt-2">
            <label class="flex items-center cursor-pointer group">
              <input
                v-model="rememberMe"
                type="checkbox"
                :disabled="authStore.loading"
                class="w-4 h-4 bg-white/10 border border-white/30 rounded focus:ring-2 focus:ring-cyan-400 focus:ring-offset-0 cursor-pointer"
              />
              <span class="ml-3 text-sm text-blue-200 group-hover:text-blue-100 transition">Remember me</span>
            </label>
            <button
              type="button"
              @click="router.push('/forgot-password')"
              class="text-sm font-semibold text-cyan-400 hover:text-cyan-300 hover:underline transition"
            >
              Forgot password?
            </button>
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full mt-8 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 hover:from-blue-600 hover:via-blue-700 hover:to-cyan-600 disabled:from-blue-400 disabled:via-blue-500 disabled:to-cyan-400 text-white font-bold py-3 px-4 rounded-xl transition duration-300 ease-in-out transform hover:shadow-lg hover:shadow-blue-500/50 hover:scale-[1.02] disabled:scale-100 disabled:shadow-none flex items-center justify-center space-x-2"
          >
            <span v-if="!authStore.loading">Sign In</span>
            <span v-else class="flex items-center justify-center space-x-2">
              <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Signing in...</span>
            </span>
          </button>
        </form>

        <!-- Demo Credentials Info -->
        <div class="bg-white/10 border border-cyan-400/30 rounded-lg p-4 space-y-3">
          <p class="text-xs font-semibold text-cyan-300">📋 Demo Credentials - Try all roles:</p>
          <div class="space-y-2 text-xs">
            <div class="text-blue-200">
              <p class="font-semibold">👤 Patient</p>
              <p class="text-blue-300/80">Email: patient1@example.com | Password: password123</p>
            </div>
            <div class="border-t border-white/10 pt-2 text-sky-200">
              <p class="font-semibold">🩺 Doctor</p>
              <p class="text-sky-300/80">Email: testpat@example.com | Password: TestPass@123</p>
            </div>
            <div class="border-t border-white/10 pt-2 text-green-200">
              <p class="font-semibold">👨‍⚕️ Receptionist</p>
              <p class="text-green-300/80">Email: receptionist@sterling.com | Password: Receptionist@Sterling2026</p>
            </div>
            <div class="border-t border-white/10 pt-2 text-purple-200">
              <p class="font-semibold">🔐 Admin</p>
              <p class="text-purple-300/80">Email: adminsterling@gmail.com | Password: admin@123</p>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="relative py-4">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-white/10"></div>
          </div>
          <div class="relative flex justify-center text-xs">
            <span class="px-2 bg-white/5 text-blue-300">Need an account?</span>
          </div>
        </div>

        <!-- Sign Up Link -->
        <router-link
          to="/signup"
          class="block w-full text-center bg-white/5 hover:bg-white/10 border border-white/20 hover:border-cyan-400/50 text-cyan-300 hover:text-cyan-200 font-semibold py-3 px-4 rounded-xl transition duration-300"
        >
          Create Account
        </router-link>
      </div>

      <!-- Footer -->
      <div class="text-center space-y-2">
        <p class="text-blue-300/50 text-xs">
          © 2026 Sterling HMS. All rights reserved.
        </p>
      </div>
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

@keyframes blob {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

/* Input focus state with better visual feedback */
input:focus::placeholder {
  color: rgba(148, 163, 184, 0.3);
}

/* Smooth transitions for all interactive elements */
button, a, input {
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
