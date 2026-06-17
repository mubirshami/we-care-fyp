import api from '../api';

const login = (credentials) => api.post('/user/login', credentials);
const signup = (data) => api.post('/user/register', data);
const adminSignin = (payload) => api.post('/user/admin-signin', payload);
const requestPassword = (payload) => api.post('/password/', payload);
const resetPassword = (payload) => api.post('/password/reset', payload);
const verifyUser = (token) => api.get(`/verifyuser/${token}`);
const verifyEmail = (id, token) => api.get(`/verifyemail/${id}/verify/${token}`);
const verifyReset = (id, token) => api.get(`/password/${id}/${token}`);
const doReset = (id, token, payload) => api.post(`/password/${id}/${token}`, payload);

export default {
  login,
  signup,
  adminSignin,
  requestPassword,
  resetPassword,
  verifyUser,
  verifyEmail,
  verifyReset,
  doReset,
};
