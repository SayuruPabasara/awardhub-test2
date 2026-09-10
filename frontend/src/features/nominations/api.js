import api from '../../api/axios';

export const nominationApi = {
  getAll: (status) => api.get('/nominations', { params: status ? { status } : {} }),
  getMy: () => api.get('/nominations/my'),
  getByCategory: (categoryId) => api.get(`/nominations/category/${categoryId}`),
  getApprovedByCategory: (categoryId) => api.get(`/nominations/category/${categoryId}/approved`),
  getById: (id) => api.get(`/nominations/${id}`),
  create: (data) => api.post('/nominations', data),
  update: (id, data) => api.put(`/nominations/${id}`, data),
  submit: (id) => api.post(`/nominations/${id}/submit`),
  withdraw: (id) => api.post(`/nominations/${id}/withdraw`),
  review: (id, data) => api.post(`/nominations/${id}/review`, data),
  uploadDocument: (id, documentType, file) => {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('file', file);
    return api.post(`/nominations/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteDocument: (documentId) => api.delete(`/nominations/documents/${documentId}`),
};
