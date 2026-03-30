import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useReceptionistStore } from '@/stores/receptionist'
import { useDoctorStore } from '@/stores/doctor'
import Login from '../views/Login.vue'
import SignUp from '../views/SignUp.vue'
import Dashboard from '../views/Dashboard.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import ManagePatients from '../views/ManagePatients.vue'
import ManageDoctors from '../views/admin/ManageDoctors.vue'
import ReceptionistDashboard from '../views/ReceptionistDashboard.vue'
import DoctorDashboard from '../views/DoctorDashboard.vue'

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: SignUp,
    meta: { requiresAuth: false },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
    meta: { requiresAuth: false },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true, requiresPatient: true },
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/patients',
    name: 'ManagePatients',
    component: ManagePatients,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/doctors',
    name: 'ManageDoctors',
    component: ManageDoctors,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/receptionist/dashboard',
    name: 'ReceptionistDashboard',
    component: ReceptionistDashboard,
    meta: { requiresAuth: true, requiresReceptionist: true },
  },
  {
    path: '/doctor/dashboard',
    name: 'DoctorDashboard',
    component: DoctorDashboard,
    meta: { requiresAuth: true, requiresDoctor: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Navigation guard for auth protection
router.beforeEach(async (to, from, next) => {
  console.log('[ROUTER] Navigating to:', to.path)
  
  const authStore = useAuthStore()
  const receptionistStore = useReceptionistStore()
  const doctorStore = useDoctorStore()
  
  // Restore sessions from localStorage
  console.log('[ROUTER] Restoring sessions...')
  authStore.restoreSession()
  receptionistStore.restoreSession()
  doctorStore.initializeAuth()
  
  // Log doctor auth state
  console.log('[ROUTER] Doctor store after initializeAuth:')
  console.log('[ROUTER]   - token:', !!doctorStore.token)
  console.log('[ROUTER]   - doctor:', !!doctorStore.doctor)
  console.log('[ROUTER]   - isAuthenticated:', doctorStore.isAuthenticated)
  
  // Small delay to ensure reactive values are updated
  await new Promise(resolve => setTimeout(resolve, 10))
  
  console.log('[ROUTER] Auth state:', {
    authIsAuthenticated: authStore.isAuthenticated,
    authIsAdmin: authStore.isAdmin,
    authUserType: authStore.userType,
    receptionistIsAuthenticated: receptionistStore.isAuthenticated,
    doctorIsAuthenticated: doctorStore.isAuthenticated,
  })
  
  const requiresAdmin = to.meta.requiresAdmin
  const requiresReceptionist = to.meta.requiresReceptionist
  const requiresDoctor = to.meta.requiresDoctor
  const requiresPatient = to.meta.requiresPatient
  const isLoginPage = to.path === '/login' || to.path === '/signup'
  
  // Check if doctor is trying to access doctor dashboard
  if (requiresDoctor) {
    if (doctorStore.isAuthenticated) {
      console.log('[ROUTER] Doctor accessing doctor dashboard - ALLOW')
      next()
      return
    } else {
      console.log('[ROUTER] Non-doctor trying to access doctor dashboard - REDIRECT to login')
      next('/login')
      return
    }
  }
  
  // Check if admin is trying to access admin dashboard
  if (requiresAdmin) {
    if (authStore.isAdmin) {
      console.log('[ROUTER] Admin accessing admin dashboard - ALLOW')
      next()
      return
    } else {
      console.log('[ROUTER] Non-admin trying to access admin dashboard - REDIRECT to login')
      next('/login')
      return
    }
  }
  
  // Check if receptionist is trying to access receptionist dashboard
  if (requiresReceptionist) {
    if (receptionistStore.isAuthenticated) {
      console.log('[ROUTER] Receptionist accessing receptionist dashboard - ALLOW')
      next()
      return
    } else {
      console.log('[ROUTER] Non-receptionist trying to access receptionist dashboard - REDIRECT to login')
      next('/login')
      return
    }
  }
  
  // Check if patient is trying to access patient dashboard
  if (requiresPatient) {
    if (authStore.isAuthenticated && !authStore.isAdmin) {
      console.log('[ROUTER] Patient accessing patient dashboard - ALLOW')
      next()
      return
    } else {
      console.log('[ROUTER] Non-patient trying to access patient dashboard - REDIRECT to login')
      next('/login')
      return
    }
  }
  
  // If on login/signup page and authenticated, redirect to appropriate dashboard
  if (isLoginPage) {
    if (doctorStore.isAuthenticated) {
      console.log('[ROUTER] Doctor on login page - REDIRECT to doctor dashboard')
      next('/doctor/dashboard')
      return
    } else if (authStore.isAdmin) {
      console.log('[ROUTER] Admin on login page - REDIRECT to admin dashboard')
      next('/admin/dashboard')
      return
    } else if (receptionistStore.isAuthenticated) {
      console.log('[ROUTER] Receptionist on login page - REDIRECT to receptionist dashboard')
      next('/receptionist/dashboard')
      return
    } else if (authStore.isAuthenticated) {
      console.log('[ROUTER] Patient on login page - REDIRECT to patient dashboard')
      next('/dashboard')
      return
    } else {
      console.log('[ROUTER] Not authenticated on login page - ALLOW')
      next()
      return
    }
  }
  
  // For all other routes, just allow through
  console.log('[ROUTER] Other route - ALLOW')
  next()
})

export default router
