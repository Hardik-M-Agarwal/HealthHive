import api from './api';

const vitalsService = {
  async addVitals(data) {
    try {
      const response = await api.post('/vitals', data);
      return response.data;
    } catch (error) {
      console.error('Error adding vitals:', error);
      throw error;
    }
  },

  async getMyVitals(params = {}) {
    try {
      const response = await api.get('/vitals/my-vitals', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching my vitals:', error);
      throw error;
    }
  },

  async getMyChartData(params = {}) {
    try {
      const response = await api.get('/vitals/my-chart', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw error;
    }
  },

  async getFamilyVitals(params = {}) {
    try {
      const response = await api.get('/vitals/family', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching family vitals:', error);
      throw error;
    }
  },

  async analyzeMyTrend(data) {
    try {
      const response = await api.post('/vitals/analyze-my-trend', data);
      return response.data;
    } catch (error) {
      console.error('Error analyzing trend:', error);
      throw error;
    }
  }
};

export default vitalsService;