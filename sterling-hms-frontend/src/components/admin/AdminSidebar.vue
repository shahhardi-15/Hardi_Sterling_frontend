<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import adminAPI from '@/api/admin'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  try {
    await adminAPI.logout(authStore.token)
  } catch (err) {
    console.error('Logout error:', err)
  } finally {
    authStore.logout()
    router.push('/login')
  }
}
</script>

<template>
  <!-- LEFT SIDEBAR -->
  <aside class="sidebar">
    <!-- Logo Area -->
    <div class="sidebar-logo">
      <div class="logo-title">Sterling Admin</div>
      <div class="logo-subtitle">Hospital Management</div>
    </div>

    <!-- Navigation Links -->
    <nav class="sidebar-nav">
      <router-link 
        to="/admin" 
        class="nav-link"
        :class="{ active: $route.path === '/admin' || $route.path === '/admin/dashboard' }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        <span>Dashboard</span>
      </router-link>

      <router-link 
        to="/admin/patients"
        class="nav-link"
        :class="{ active: $route.path === '/admin/patients' }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <span>Manage Patients</span>
      </router-link>

      <router-link 
        to="/admin/doctors"
        class="nav-link"
        :class="{ active: $route.path === '/admin/doctors' }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
        <span>Manage Doctors</span>
      </router-link>

      <router-link 
        to="/admin/appointments"
        class="nav-link"
        :class="{ active: $route.path === '/admin/appointments' }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2"></rect>
          <path d="M16 2v4M8 2v4M3 10h18"></path>
        </svg>
        <span>View Appointments</span>
      </router-link>

      <router-link 
        to="/admin/profile"
        class="nav-link"
        :class="{ active: $route.path === '/admin/profile' }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <span>My Profile</span>
      </router-link>
    </nav>

    <!-- Admin Profile Bottom Section -->
    <div class="sidebar-profile">
      <div class="profile-avatar">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
        </svg>
      </div>
      <div class="profile-info">
        <div class="profile-name">Admin User Profile</div>
        <div class="profile-role">Super Administrator</div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 220px;
  height: 100vh;
  background: #FFFFFF;
  border-right: 1px solid #E2E8F0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0;
  z-index: 1000;
  overflow-y: auto;
}

.sidebar-logo {
  padding: 20px 20px 16px 20px;
  border-bottom: 1px solid #E2E8F0;
  text-align: left;
}

.logo-title {
  font-size: 18px;
  font-weight: 700;
  color: #1B5E8F;
  letter-spacing: -0.02em;
}

.logo-subtitle {
  font-size: 11px;
  font-weight: 400;
  color: #718096;
  margin-top: 2px;
}

.sidebar-nav {
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #4A5568;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s ease;
  border-left: 3px solid transparent;
}

.nav-link svg {
  width: 18px;
  height: 18px;
  color: #718096;
  flex-shrink: 0;
}

.nav-link:hover {
  background: #F0F4F8;
  color: #1B5E8F;
}

.nav-link:hover svg {
  color: #1B5E8F;
}

.nav-link.active {
  background: #EBF4FF;
  color: #1B5E8F;
  font-weight: 600;
  border-left: 3px solid #1B5E8F;
  padding-left: 9px;
}

.nav-link.active svg {
  color: #1B5E8F;
}

.sidebar-profile {
  padding: 16px;
  border-top: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.profile-avatar {
  width: 36px;
  height: 36px;
  background: #1B3A6B;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.profile-avatar svg {
  width: 18px;
  height: 18px;
  color: white;
}

.profile-info {
  flex: 1;
  min-width: 0;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.profile-name {
  font-size: 12px;
  font-weight: 600;
  color: #1A2B4A;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-role {
  font-size: 10px;
  color: #718096;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

</style>
