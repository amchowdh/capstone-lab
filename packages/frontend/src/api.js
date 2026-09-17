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

export const getSession = (id) =>
  api.get(`/sessions/${id}`).then((r) => r.data);

export const addRound = (payload) =>
  api.post('/rounds', payload).then((r) => r.data);

export const listRounds = (sessionId) =>
  api.get('/rounds', { params: { sessionId } }).then((r) => r.data);

export const upsertScore = (payload) =>
  api.post('/scores', payload).then((r) => r.data);

export const listScores = (sessionId) =>
  api.get('/scores', { params: { sessionId } }).then((r) => r.data);

export const getLeaderboard = (sessionId) =>
  api.get(`/sessions/${sessionId}/leaderboard`).then((r) => r.data);

export const closeSession = (id) =>
  api.patch(`/sessions/${id}`, { status: 'closed' }).then((r) => r.data);

export default api;
