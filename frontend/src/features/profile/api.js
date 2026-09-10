import api from '../../api/axios';

export const profileApi = {
  getMyProfile: () => api.get('/profile/nominee/me'),
  updateMyProfile: (data) => api.put('/profile/nominee/me', data),
  getProfileById: (id) => api.get(`/profile/nominee/${id}`),
};
