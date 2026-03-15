import api from './api';

const medicationService = {
  // Get all medications
  async getMedications(params = {}) {
    try {
      const response = await api.get('/medications', { params });
      return response.data;
    } catch (error) {
      console.error('Error in getMedications:', error);
      throw error;
    }
  },

  // Get single medication
  async getMedicationById(id) {
    try {
      const response = await api.get(`/medications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in getMedicationById:', error);
      throw error;
    }
  },

  // Add new medication
  async addMedication(medicationData) {
    try {
      const response = await api.post('/medications', medicationData);
      return response.data;
    } catch (error) {
      console.error('Error in addMedication:', error);
      throw error;
    }
  },

  // Update medication
  async updateMedication(id, medicationData) {
    try {
      const response = await api.put(`/medications/${id}`, medicationData);
      return response.data;
    } catch (error) {
      console.error('Error in updateMedication:', error);
      throw error;
    }
  },

  // Mark as taken
  async markAsTaken(id, data) {
    try {
      const response = await api.post(`/medications/${id}/taken`, data);
      return response.data;
    } catch (error) {
      console.error('Error in markAsTaken:', error);
      throw error;
    }
  },

  // Get analytics
  async getAnalytics(params = {}) {
    try {
      const response = await api.get('/medications/analytics', { params });
      return response.data;
    } catch (error) {
      console.error('Error in getAnalytics:', error);
      throw error;
    }
  },

  // Delete medication (deactivate)
  async deleteMedication(id) {
    try {
      const response = await api.delete(`/medications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in deleteMedication:', error);
      throw error;
    }
  },

  // Get family members (helper for filtering)
  async getFamilyMembers() {
    try {
      const response = await api.get('/family/members');
      return response.data;
    } catch (error) {
      console.error('Error in getFamilyMembers:', error);
      throw error;
    }
  },

  //GET ALL LOGS
  async getAllLogs(params = {}) {
    try {
      const response = await api.get('/medications/logs/all', { params });
      return response.data;
    } catch (error) {
      console.error('Error in getAllLogs:', error);
      throw error;
    }
  }
};

export default medicationService;