import { defineStore } from 'pinia'
import { ref } from 'vue'
import { appointmentAPI } from '@/api/appointment'

export const useAppointmentStore = defineStore('appointment', () => {
  // State
  const profile = ref(null)
  const appointments = ref([])
  const doctors = ref([])
  const specializations = ref([])
  const doctorsBySpecialization = ref([])
  const selectedDoctor = ref(null)
  const availableSlots = ref([])
  const loading = ref(false)
  const error = ref(null)
  const totalAppointments = ref(0)

  // Get patient profile
  const getProfile = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await appointmentAPI.getPatientProfile()
      profile.value = response.data.profile
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get appointment history
  const getHistory = async (page = 1, limit = 10) => {
    loading.value = true
    error.value = null
    try {
      const response = await appointmentAPI.getAppointmentHistory(page, limit)
      appointments.value = response.data.appointments || []
      totalAppointments.value = response.data.total || 0
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch appointment history'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get available doctors
  const getDoctors = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await appointmentAPI.getDoctors()
      doctors.value = response.data.doctors || []
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch doctors'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get all specializations
  const getSpecializations = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await appointmentAPI.getSpecializations()
      specializations.value = response.data.specializations || []
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch specializations'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get doctors by specialization
  const getDoctorsBySpecialization = async (specializationName) => {
    loading.value = true
    error.value = null
    try {
      const response = await appointmentAPI.getDoctorsBySpecialization(specializationName)
      doctorsBySpecialization.value = response.data.doctors || []
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch doctors'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Set selected doctor
  const setSelectedDoctor = (doctor) => {
    selectedDoctor.value = doctor
  }

  // Clear selected doctor
  const clearSelectedDoctor = () => {
    selectedDoctor.value = null
  }

  // Get available slots for a doctor
  const getAvailableSlots = async (doctorId) => {
    loading.value = true
    error.value = null
    try {
      const response = await appointmentAPI.getAvailableSlots(doctorId)
      availableSlots.value = response.data.slots || []
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch available slots'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Book appointment
  const bookAppointment = async (appointmentData) => {
    loading.value = true
    error.value = null
    try {
      const response = await appointmentAPI.bookAppointment(appointmentData)
      // Add the new appointment to the list
      appointments.value.unshift(response.data.appointment)
      totalAppointments.value += 1
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to book appointment'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Cancel appointment
  const cancelAppointment = async (appointmentId) => {
    loading.value = true
    error.value = null
    try {
      const response = await appointmentAPI.cancelAppointment(appointmentId)
      // Update the appointment status in the list
      const index = appointments.value.findIndex(apt => apt.id === appointmentId)
      if (index !== -1) {
        appointments.value[index].status = 'cancelled'
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to cancel appointment'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Clear store
  const clearStore = () => {
    profile.value = null
    appointments.value = []
    doctors.value = []
    specializations.value = []
    doctorsBySpecialization.value = []
    selectedDoctor.value = null
    availableSlots.value = []
    loading.value = false
    error.value = null
    totalAppointments.value = 0
  }

  return {
    // State
    profile,
    appointments,
    doctors,
    specializations,
    doctorsBySpecialization,
    selectedDoctor,
    availableSlots,
    loading,
    error,
    totalAppointments,

    // Actions
    getProfile,
    getHistory,
    getDoctors,
    getSpecializations,
    getDoctorsBySpecialization,
    setSelectedDoctor,
    clearSelectedDoctor,
    getAvailableSlots,
    bookAppointment,
    cancelAppointment,
    clearStore
  }
})
