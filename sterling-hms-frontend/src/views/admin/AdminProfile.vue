<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import adminAPI from '@/api/admin'
import AdminLayout from '@/components/admin/AdminLayout.vue'

const router = useRouter()
const authStore = useAuthStore()

// State
const isEditing = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showPasswordForm = ref(false)

const adminProfile = ref({
  id: '',
  full_name: '',
  email: '',
  phone: '',
  department: '',
  role: 'Super Administrator',
  created_at: ''
})

const formData = ref({
  full_name: '',
  email: '',
  phone: '',
  department: ''
})

// Lifecycle
onMounted(async () => {
  authStore.initializeAuth()
  
  if (!authStore.isAdmin) {
    router.push('/login')
    return
  }
  
  if (!authStore.token) {
    error.value = 'Session expired. Please login again.'
    setTimeout(() => router.push('/admin/login'), 2000)
    return
  }
  
  await fetchProfile()
})

// Methods
const fetchProfile = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await adminAPI.getAdminProfile(authStore.token)
    adminProfile.value = response.data.data || adminProfile.value
    formData.value = { ...adminProfile.value }
  } catch (err) {
    console.error('Error fetching profile:', err)
    if (err.response?.status === 401) {
      error.value = 'Session expired. Please login again.'
      setTimeout(() => router.push('/admin/login'), 2000)
    } else {
      error.value = 'Failed to load profile. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

const startEditing = () => {
  isEditing.value = true
  formData.value = { ...adminProfile.value }
}

const cancelEditing = () => {
  isEditing.value = false
  formData.value = { ...adminProfile.value }
  error.value = ''
  success.value = ''
}

const saveProfile = async () => {
  loading.value = true
  error.value = ''
  success.value = ''
  
  try {
    const response = await adminAPI.updateAdminProfile(authStore.token, formData.value)
    adminProfile.value = response.data.data || adminProfile.value
    isEditing.value = false
    success.value = 'Profile updated successfully!'
    setTimeout(() => { success.value = '' }, 3000)
  } catch (err) {
    console.error('Error updating profile:', err)
    error.value = err.response?.data?.message || 'Failed to update profile. Please try again.'
  } finally {
    loading.value = false
  }
}

const changePassword = async () => {
  error.value = ''
  success.value = ''
  
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    error.value = 'Please fill in all password fields'
    return
  }
  
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'New passwords do not match'
    return
  }
  
  if (newPassword.value.length < 6) {
    error.value = 'New password must be at least 6 characters long'
    return
  }
  
  loading.value = true
  
  try {
    await adminAPI.changeAdminPassword(authStore.token, {
      current_password: currentPassword.value,
      new_password: newPassword.value
    })
    
    success.value = 'Password changed successfully!'
    showPasswordForm.value = false
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    setTimeout(() => { success.value = '' }, 3000)
  } catch (err) {
    console.error('Error changing password:', err)
    error.value = err.response?.data?.message || 'Failed to change password. Please try again.'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}
</script>

<template>
  <AdminLayout>
    <div class="profile-container">
      <!-- Alert Messages -->
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>
      <div v-if="success" class="alert alert-success">
        {{ success }}
      </div>

      <!-- Page Header -->
      <div class="page-header-section">
        <h1 class="page-title">My Profile</h1>
        <p class="page-subtitle">Manage your administrator account and settings.</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading && !isEditing" class="loading-container">
        <div class="spinner"></div>
        <p>Loading profile...</p>
      </div>

      <!-- Profile Content -->
      <div v-else class="profile-content">
        <!-- Profile Card -->
        <div class="card profile-card">
          <div class="card-header">
            <h2 class="card-title">Administrator Information</h2>
            <button 
              v-if="!isEditing"
              @click="startEditing"
              class="btn-edit"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Edit Profile
            </button>
          </div>

          <div class="card-content">
            <!-- View Mode -->
            <div v-if="!isEditing" class="profile-view">
              <div class="profile-grid">
                <!-- Full Name -->
                <div class="profile-field">
                  <label class="field-label">Full Name</label>
                  <p class="field-value">{{ adminProfile.full_name || '-' }}</p>
                </div>

                <!-- Email -->
                <div class="profile-field">
                  <label class="field-label">Email Address</label>
                  <p class="field-value">{{ adminProfile.email || '-' }}</p>
                </div>

                <!-- Phone -->
                <div class="profile-field">
                  <label class="field-label">Phone Number</label>
                  <p class="field-value">{{ adminProfile.phone || '-' }}</p>
                </div>

                <!-- Role -->
                <div class="profile-field">
                  <label class="field-label">Role</label>
                  <p class="field-value">{{ adminProfile.role }}</p>
                </div>

                <!-- Department -->
                <div class="profile-field">
                  <label class="field-label">Department</label>
                  <p class="field-value">{{ adminProfile.department || '-' }}</p>
                </div>

                <!-- Member Since -->
                <div class="profile-field">
                  <label class="field-label">Member Since</label>
                  <p class="field-value">{{ formatDate(adminProfile.created_at) }}</p>
                </div>
              </div>
            </div>

            <!-- Edit Mode -->
            <form v-else @submit.prevent="saveProfile" class="profile-edit">
              <div class="form-grid">
                <!-- Full Name -->
                <div class="form-group">
                  <label for="fullName" class="form-label">Full Name</label>
                  <input 
                    id="fullName"
                    v-model="formData.full_name"
                    type="text"
                    class="form-input"
                    required
                  />
                </div>

                <!-- Email -->
                <div class="form-group">
                  <label for="email" class="form-label">Email Address</label>
                  <input 
                    id="email"
                    v-model="formData.email"
                    type="email"
                    class="form-input"
                    required
                  />
                </div>

                <!-- Phone -->
                <div class="form-group">
                  <label for="phone" class="form-label">Phone Number</label>
                  <input 
                    id="phone"
                    v-model="formData.phone"
                    type="tel"
                    class="form-input"
                  />
                </div>

                <!-- Department -->
                <div class="form-group">
                  <label for="department" class="form-label">Department</label>
                  <input 
                    id="department"
                    v-model="formData.department"
                    type="text"
                    class="form-input"
                  />
                </div>
              </div>

              <!-- Form Actions -->
              <div class="form-actions">
                <button type="submit" class="btn-save" :disabled="loading">
                  <span v-if="!loading">Save Changes</span>
                  <span v-else>Saving...</span>
                </button>
                <button type="button" @click="cancelEditing" class="btn-cancel" :disabled="loading">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Security Card -->
        <div class="card security-card">
          <div class="card-header">
            <h2 class="card-title">Security</h2>
          </div>

          <div class="card-content">
            <!-- Password Change Form -->
            <div v-if="showPasswordForm" class="password-form">
              <form @submit.prevent="changePassword">
                <!-- Current Password -->
                <div class="form-group">
                  <label for="currentPassword" class="form-label">Current Password</label>
                  <input 
                    id="currentPassword"
                    v-model="currentPassword"
                    type="password"
                    class="form-input"
                    placeholder="Enter your current password"
                    required
                  />
                </div>

                <!-- New Password -->
                <div class="form-group">
                  <label for="newPassword" class="form-label">New Password</label>
                  <input 
                    id="newPassword"
                    v-model="newPassword"
                    type="password"
                    class="form-input"
                    placeholder="Enter your new password"
                    required
                  />
                </div>

                <!-- Confirm Password -->
                <div class="form-group">
                  <label for="confirmPassword" class="form-label">Confirm New Password</label>
                  <input 
                    id="confirmPassword"
                    v-model="confirmPassword"
                    type="password"
                    class="form-input"
                    placeholder="Confirm your new password"
                    required
                  />
                </div>

                <!-- Form Actions -->
                <div class="form-actions">
                  <button type="submit" class="btn-save" :disabled="loading">
                    <span v-if="!loading">Change Password</span>
                    <span v-else>Changing...</span>
                  </button>
                  <button type="button" @click="showPasswordForm = false" class="btn-cancel" :disabled="loading">
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            <!-- Change Password Button -->
            <div v-else class="security-info">
              <p class="security-description">
                Keep your account secure by changing your password regularly.
              </p>
              <button @click="showPasswordForm = true" class="btn-change-password">
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.profile-container {
  min-height: 100%;
}

/* Alert Messages */
.alert {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-weight: 500;
}

.alert-danger {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef5350;
}

.alert-success {
  background-color: #c8e6c9;
  color: #2e7d32;
  border: 1px solid #81c784;
}

/* Page Header */
.page-header-section {
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1A2B4A;
  margin: 0 0 8px 0;
  padding: 0;
  text-align: left;
}

.page-subtitle {
  font-size: 14px;
  color: #718096;
  line-height: 1.6;
  margin: 0;
  text-align: left;
}

/* Profile Content */
.profile-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

/* Card Styles */
.card {
  background: white;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #E2E8F0;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #1A2B4A;
  margin: 0;
  padding: 0;
}

.card-content {
  padding: 24px;
}

/* Edit Button */
.btn-edit {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #1B5E8F;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-edit:hover {
  background: #144070;
}

.btn-edit svg {
  width: 16px;
  height: 16px;
}

/* Profile View */
.profile-view {
  width: 100%;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
}

.profile-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 12px;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.field-value {
  font-size: 14px;
  color: #2D3748;
  margin: 0;
  padding: 8px 0;
}

/* Profile Edit */
.profile-edit {
  width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #1A2B4A;
}

.form-input {
  padding: 10px 12px;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  font-size: 14px;
  color: #2D3748;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #1B5E8F;
  box-shadow: 0 0 0 3px rgba(27, 94, 143, 0.1);
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #E2E8F0;
}

.btn-save {
  padding: 10px 24px;
  background: #1B5E8F;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-save:hover:not(:disabled) {
  background: #144070;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  padding: 10px 24px;
  background: #F0F4F8;
  color: #4A5568;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover:not(:disabled) {
  background: #E2E8F0;
  color: #2D3748;
}

.btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Security Card */
.security-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.security-description {
  font-size: 14px;
  color: #718096;
  margin: 0;
}

.btn-change-password {
  align-self: flex-start;
  padding: 10px 20px;
  background: #1B5E8F;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-change-password:hover {
  background: #144070;
}

/* Password Form */
.password-form {
  width: 100%;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1B5E8F;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p {
  color: #718096;
  font-size: 14px;
  margin: 0;
}
</style>
