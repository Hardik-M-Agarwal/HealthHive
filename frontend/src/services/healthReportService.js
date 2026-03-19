import api from './api';

const healthReportService = {
  // Upload and process health report
  async uploadReport(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/health-reports/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Get all reports
  async getReports(params = {}) {
    const response = await api.get('/health-reports', { params });
    return response.data;
  },

  // Get single report
  async getReportById(id) {
    const response = await api.get(`/health-reports/${id}`);
    return response.data;
  },

  // Toggle archive status
  async toggleArchive(id) {
    const response = await api.put(`/health-reports/${id}/archive`);
    return response.data;
  },

  // Delete report
  async deleteReport(id) {
    const response = await api.delete(`/health-reports/${id}`);
    return response.data;
  }
};

export default healthReportService;