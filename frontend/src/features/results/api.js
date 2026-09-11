import api from '../../api/axios';

export const resultsApi = {
  getResultsByCategory: (categoryId) => api.get(`/results/category/${categoryId}`),
  publishResults: (categoryId) => api.post(`/results/category/${categoryId}/publish`),
};
