import api from '../../api/axios';

export const categoryApi = {
  getAll: (status) => api.get('/categories', { params: status ? { status } : {} }),
  getById: (id) => api.get(`/categories/${id}`),
  getOpenForNomination: () => api.get('/categories/open-for-nomination'),
  getOpenForVoting: () => api.get('/categories/open-for-voting'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  updateStatus: (id, status) => api.patch(`/categories/${id}/status?status=${status}`),
  delete: (id) => api.delete(`/categories/${id}`),
};
