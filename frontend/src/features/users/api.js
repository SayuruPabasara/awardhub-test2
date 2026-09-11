import api from '../../api/axios';

export const userApi = {
  getAll: (page = 0, size = 100) => api.get('/users', { params: { page, size } }),
  getById: (userId) => api.get(`/users/${userId}`),
  getByRole: (role) => api.get(`/users/role/${role}`),
  create: (data) => api.post('/users', data),
  update: (userId, data) => api.put(`/users/${userId}`, data),
  delete: (userId) => api.delete(`/users/${userId}`),
};
