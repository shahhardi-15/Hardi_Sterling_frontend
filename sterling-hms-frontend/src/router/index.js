import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Login from '../views/Login.vue'
import SignUp from '../views/SignUp.vue'
import Dashboard from '../views/Dashboard.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
import AdminDashboard from '../views/AdminDashboard.vue'

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
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Navigation guard for auth protection
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth
  const requiresAdmin = to.meta.requiresAdmin
  const requiresPatient = to.meta.requiresPatient

  // Admin route protection
  if (requiresAdmin && !authStore.isAdmin) {
    next('/login')
  }
  // Patient route protection
  else if (requiresPatient && authStore.isAdmin) {
    next('/admin/dashboard')
  }
  // General auth protection
  else if (requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  }
  // Redirect authenticated users away from login/signup
  else if (!requiresAuth && authStore.isAuthenticated && (to.path === '/login' || to.path === '/signup')) {
    if (authStore.isAdmin) {
      next('/admin/dashboard')
    } else {
      next('/dashboard')
    }
  } else {
    next()
  }
})

export default router
