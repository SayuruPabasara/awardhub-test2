import api from '../../api/axios';

export const votingApi = {
  getOpenCategories: () => api.get('/categories/open-for-voting'),
  getApprovedNominees: (categoryId) => api.get(`/nominations/category/${categoryId}/approved`),
  submitVote: (payload) => api.post('/votes', payload),
  getMyVotes: () => api.get('/votes/my'),
};
