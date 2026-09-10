import api from '../../api/axios';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  resendOtp: (email) => api.post(`/auth/resend-otp?email=${encodeURIComponent(email)}`),
  refreshToken: (token) => api.post('/auth/refresh', token, {
    headers: { 'Content-Type': 'text/plain' },
  }),
};
