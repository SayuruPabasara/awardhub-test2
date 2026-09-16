import api from '../../api/axios';

export const evaluationApi = {
  // Judge endpoints
  getAssignments: () => api.get('/evaluations/my'),
  getPendingAssignments: () => api.get('/evaluations/my/pending'),
  submit: (evaluationId, payload) => api.post(`/evaluations/${evaluationId}/submit`, payload),

  // Organizer endpoints
  getAll: (params) => api.get('/evaluations', { params }),
  getByCategory: (categoryId) => api.get(`/evaluations/category/${categoryId}`),
  getByNomination: (nominationId) => api.get(`/evaluations/nomination/${nominationId}`),
  assignJudges: (payload) => api.post('/evaluations/assign', payload),
  unassign: (evaluationId) => api.delete(`/evaluations/${evaluationId}`),
};
