import api from '../api';

const getAll = (token) =>
  api.get('/review/getall', token ? { headers: { Authorization: `Bearer ${token}` } } : {});
const get = (token) =>
  api.get('/review/get', token ? { headers: { Authorization: `Bearer ${token}` } } : {});
const check = (token) =>
  api.get('/review/check', token ? { headers: { Authorization: `Bearer ${token}` } } : {});
const respond = (id, responseText, token) =>
  api.put(
    `/review/respond/${id}`,
    { adminresponse: responseText },
    token ? { headers: { Authorization: `Bearer ${token}` } } : {}
  );
const updateResponse = (id, updatedResponse, token) =>
  api.put(
    `/review/update-response/${id}`,
    { adminresponse: updatedResponse },
    token ? { headers: { Authorization: `Bearer ${token}` } } : {}
  );
const add = (payload, token) =>
  api.post('/review/add', payload, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
const update = (id, payload, token) =>
  api.put(
    `/review/update/${id}`,
    payload,
    token ? { headers: { Authorization: `Bearer ${token}` } } : {}
  );

export default {
  getAll,
  respond,
  updateResponse,
  add,
  get,
  check,
  update,
};
