import api from '../api';

const getAll = (token) =>
  api.get('/videos/getall', token ? { headers: { Authorization: `Bearer ${token}` } } : {});
const postMeditationTime = (payload, token) =>
  api.post(
    '/meditationtime/post',
    payload,
    token ? { headers: { Authorization: `Bearer ${token}` } } : {}
  );
const getCategories = (token) =>
  api.get('/videos/getcategory', token ? { headers: { Authorization: `Bearer ${token}` } } : {});
const postVideo = (payload, token) =>
  api.post(
    '/videos/videourl',
    payload,
    token ? { headers: { Authorization: `Bearer ${token}` } } : {}
  );
const remove = (id, token) =>
  api.delete(
    `/videos/delete/${id}`,
    token ? { headers: { Authorization: `Bearer ${token}` } } : {}
  );

export default {
  getAll,
  postMeditationTime,
  getCategories,
  postVideo,
  remove,
};
