<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AdminSidebar from './AdminSidebar.vue'
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

const searchQuery = ref('')
</script>

<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- TOP NAVBAR -->
    <nav class="navbar">
      <!-- Search Bar -->
      <div class="search-bar">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search records..." 
          class="search-input" />
      </div>

      <!-- Right Side Icons & Logout -->
      <div class="navbar-right">
        <button @click="handleLogout" class="sign-out-btn">Sign Out</button>
      </div>
    </nav>

    <!-- MAIN CONTENT AREA -->
    <main class="main-content">
      <slot></slot>
    </main>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.admin-layout {
  display: flex;
  width: 100%;
  max-width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  background: #F5F7FA;
}

/* ============================================
   TOP NAVBAR
   ============================================ */
.navbar {
  position: fixed;
  top: 0;
  left: 220px;
  right: 0;
  height: 64px;
  background: #FFFFFF;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  z-index: 999;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #F7F9FC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 0 14px;
  height: 38px;
  width: 280px;
}

.search-icon {
  width: 16px;
  height: 16px;
  color: #A0AEC0;
  flex-shrink: 0;
}

.search-input {
  background: transparent;
  border: none;
  font-size: 14px;
  color: #2D3748;
  width: 100%;
  outline: none;
}

.search-input::placeholder {
  color: #A0AEC0;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.sign-out-btn {
  background: transparent;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: #4A5568;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s ease;
}

.sign-out-btn:hover {
  color: #E53E3E;
}

/* ============================================
   MAIN CONTENT AREA
   ============================================ */
.main-content {
  position: relative;
  flex: 1;
  width: calc(100% - 220px);
  max-width: calc(100% - 220px);
  box-sizing: border-box;
  margin-left: 220px;
  margin-top: 64px;
  padding: 32px 28px;
  background: #F5F7FA;
  overflow-y: auto;
  max-height: calc(100vh - 64px);
}
</style>
