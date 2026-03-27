import api from './auth' // Use the existing auth API instance

export const appointmentAPI = {
  // Get patient profile
  getPatientProfile() {
    return api.get('/patient/profile')
  },

  // Get appointment history
  getAppointmentHistory(page = 1, limit = 10) {
    return api.get('/appointments/history', {
      params: {
        page,
        limit
      }
    })
  },

  // Get all doctors
  getDoctors() {
    return api.get('/doctors')
  },

  // Get available slots for a doctor
  getAvailableSlots(doctorId) {
    return api.get('/doctors/available-slots', {
      params: {
        doctorId
      }
    })
  },

  // Book an appointment
  bookAppointment(appointmentData) {
    return api.post('/appointments/book', appointmentData)
  },

  // Cancel an appointment
  cancelAppointment(appointmentId) {
    return api.delete(`/appointments/${appointmentId}`)
  }
}
