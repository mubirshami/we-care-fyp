import api from '../api';

const getAll = (token) =>
  api.get('/journal/get', token ? { headers: { Authorization: `Bearer ${token}` } } : {});
const remove = (id, token) =>
  api.delete(
    `/journal/delete/${id}`,
    token ? { headers: { Authorization: `Bearer ${token}` } } : {}
  );
const postTime = (payload, token) =>
  api.post(
    '/journaltime/post',
    payload,
    token ? { headers: { Authorization: `Bearer ${token}` } } : {}
  );

export default {
  getAll,
  remove,
  postTime,
};
