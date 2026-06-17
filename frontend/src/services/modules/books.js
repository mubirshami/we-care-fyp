import api from '../api';

const postBook = (payload, token) =>
  api.post(
    '/books/bookdata',
    payload,
    token ? { headers: { Authorization: `Bearer ${token}` } } : {}
  );
const getAll = (token) =>
  api.get('/books/getbooks', token ? { headers: { Authorization: `Bearer ${token}` } } : {});
const remove = (id, token) =>
  api.delete(`/books/delete/${id}`, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
const update = (id, payload, token) =>
  api.put(
    `/books/update/${id}`,
    payload,
    token ? { headers: { Authorization: `Bearer ${token}` } } : {}
  );

export default {
  postBook,
  getAll,
  remove,
  update,
};
