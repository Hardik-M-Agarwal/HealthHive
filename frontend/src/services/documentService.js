import api from './api';

const documentService = {
  // Upload document
  async uploadDocument(file, category, categoryCustom) {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('category', category);
    if (categoryCustom) {
      formData.append('categoryCustom', categoryCustom);
    }

    const response = await api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Get all documents
  async getDocuments(params = {}) {
    const response = await api.get('/documents', { params });
    return response.data;
  },

  // Get single document
  async getDocumentById(id) {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  // Toggle favorite
  async toggleFavorite(id) {
    const response = await api.put(`/documents/${id}/favorite`);
    return response.data;
  },

  // Update category
  async updateCategory(id, category, categoryCustom) {
    const response = await api.put(`/documents/${id}/category`, { category, categoryCustom });
    return response.data;
  },

  // Delete document
  async deleteDocument(id) {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  }
};

export default documentService;