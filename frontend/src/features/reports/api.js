import api from '../../api/axios';

export const reportsApi = {
  getAllCategoryStatistics: () => api.get('/reports/categories'),
  getCategoryStatistics: (categoryId) => api.get(`/reports/category/${categoryId}`),
  getAuditLogs: (page = 0, size = 20) => api.get('/reports/audit-logs', { params: { page, size } }),
  getAuditLogsByAction: (action, page = 0, size = 20) =>
    api.get(`/reports/audit-logs/action/${action}`, { params: { page, size } }),
  getAuditLogsByUser: (userId, page = 0, size = 20) =>
    api.get(`/reports/audit-logs/user/${userId}`, { params: { page, size } }),
};
