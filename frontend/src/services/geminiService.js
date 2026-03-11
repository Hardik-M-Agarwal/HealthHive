import api from './api';

const geminiService = {
  async explainMedicine(medicineName) {
    try {
      const response = await api.post('/gemini/explain', { medicineName });
      return response.data;
    } catch (error) {
      console.error('Error explaining medicine:', error);
      throw error;
    }
  }
};

export default geminiService;