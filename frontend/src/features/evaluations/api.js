import api from '../../api/axios';

export const evaluationApi = {
  getAssignments: () => api.get('/evaluations/my'),
  submit: (evaluationId, payload) => api.post(`/evaluations/${evaluationId}/submit`, payload),
};
