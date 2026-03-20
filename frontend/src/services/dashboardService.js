import api from './api';

const dashboardService = {
  async getDashboardData() {
    const response = await api.get('/dashboard');
    return response.data;
  }
};

export default dashboardService;