<template>
  <div class="doctor-patients-section">
    <h2 class="section-title">Your Assigned Patients</h2>

    <div v-if="loading" class="loading">
      <p>Loading patients...</p>
    </div>

    <div v-else-if="doctorStore.patients.length === 0" class="no-data">
      <p>No patients assigned yet.</p>
    </div>

    <div v-else class="patients-container">
      <!-- Search/Filter -->
      <div class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name, email, or phone..."
          class="search-input"
        />
      </div>

      <!-- Patients Table -->
      <table v-if="filteredPatients.length > 0" class="patients-table">
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Blood Type</th>
            <th>Medical History</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="patient in filteredPatients" :key="patient.id">
            <td class="patient-name">{{ patient.name }}</td>
            <td>{{ patient.email }}</td>
            <td>{{ patient.phone || 'N/A' }}</td>
            <td class="text-center">{{ patient.bloodType || 'N/A' }}</td>
            <td class="medical-history">{{ patient.medicalHistory || 'No history' }}</td>
          </tr>
        </tbody>
      </table>

      <!-- No results after filtering -->
      <div v-else class="no-results">
        <p>No patients match your search</p>
      </div>

      <!-- Error -->
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDoctorStore } from '@/stores/doctor'

const doctorStore = useDoctorStore()

const loading = ref(false)
const error = ref('')
const searchQuery = ref('')

const filteredPatients = computed(() => {
  const query = searchQuery.value.toLowerCase()
  if (!query) return doctorStore.patients

  return doctorStore.patients.filter(patient =>
    patient.name.toLowerCase().includes(query) ||
    patient.email.toLowerCase().includes(query) ||
    (patient.phone && patient.phone.toLowerCase().includes(query))
  )
})

const loadPatients = async () => {
  try {
    loading.value = true
    error.value = ''
    await doctorStore.getAssignedPatients()
  } catch (err) {
    error.value = 'Failed to load patients'
    console.error('Error loading patients:', err)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadPatients()
})
</script>

<style scoped>
.doctor-patients-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.loading {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.no-data {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.patients-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-container {
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.patients-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}

.patients-table thead {
  background-color: #f5f5f5;
  border-bottom: 2px solid #ddd;
}

.patients-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #333;
  font-size: 13px;
}

.patients-table tbody tr {
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
}

.patients-table tbody tr:hover {
  background-color: #f9f9f9;
}

.patients-table td {
  padding: 12px;
  color: #666;
  font-size: 14px;
}

.patient-name {
  font-weight: 600;
  color: #333;
}

.text-center {
  text-align: center;
}

.medical-history {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-results {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.alert {
  padding: 12px 16px;
  border-radius: 6px;
  margin-top: 16px;
}

.alert-danger {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef5350;
}
</style>
