import api from '../api';

const getAll = (token) =>
  api.get('/user/get', token ? { headers: { Authorization: `Bearer ${token}` } } : {});
const deleteUser = (id, token) =>
  api.delete(`/user/${id}`, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
const getById = (id, token) =>
  api.get(`/user/${id}`, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
const update = (id, data, token) =>
  api.put(`/user/${id}`, data, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
const getId = (token) =>
  api.get('/user/getid', token ? { headers: { Authorization: `Bearer ${token}` } } : {});

export default {
  getAll,
  deleteUser,
  getById,
  update,
  getId,
};
