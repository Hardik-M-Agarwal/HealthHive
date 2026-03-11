import api from './api';

const onboardingService = {
  async completeOnboarding(healthProfile) {
    const response = await api.post('/onboarding/complete', healthProfile);
    return response.data;
  },

  async getHealthProfile() {
    const response = await api.get('/onboarding/profile');
    return response.data;
  },

  async updateHealthProfile(healthProfile) {
    const response = await api.put('/onboarding/profile', healthProfile);
    return response.data;
  },

  async getOnboardingStatus() {
    const response = await api.get('/onboarding/status');
    return response.data;
  }
};

export default onboardingService;