import axios from 'axios';

// In dev, CRA proxies /api to the backend (see package.json "proxy").
const api = axios.create({ baseURL: '/api' });

export const createSession = (payload) =>
  api.post('/sessions', payload).then((r) => r.data);

export const getSessionByCode = (joinCode) =>
  api.get(`/sessions/by-code/${joinCode}`).then((r) => r.data);

export const joinSession = (payload) =>
  api.post('/teams', payload).then((r) => r.data);

export const listTeams = (sessionId) =>
  api.get('/teams', { params: { sessionId } }).then((r) => r.data);

export default api;
