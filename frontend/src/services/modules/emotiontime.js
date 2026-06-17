import api from '../api';

const post = (payload, token) =>
  api.post(
    '/emotiontime/post',
    payload,
    token ? { headers: { Authorization: `Bearer ${token}` } } : {}
  );

export default { post };
