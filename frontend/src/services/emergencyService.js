import api from './api';

const emergencyService = {
  // Trigger emergency alert
  async triggerEmergency(data) {
    try {
      const response = await api.post('/emergency/trigger', data);
      return response.data;
    } catch (error) {
      console.error('Error triggering emergency:', error);
      throw error;
    }
  },

  // Get emergency history
  async getEmergencyHistory() {
    try {
      const response = await api.get('/emergency/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching emergency history:', error);
      throw error;
    }
  },

  // Resolve emergency
  async resolveEmergency(id) {
    try {
      const response = await api.post(`/emergency/resolve/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error resolving emergency:', error);
      throw error;
    }
  }
};

export default emergencyService;