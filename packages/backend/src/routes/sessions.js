const express = require('express');
const store = require('../store');
const { computeLeaderboard } = require('../leaderboard');

const router = express.Router();

// Create a session — generates a join code.
router.post('/', (req, res) => {
  const { name, date, hostId } = req.body;
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Session name is required' });
  }
  const session = store.createSession({ name: name.trim(), date, hostId });
  res.status(201).json(session);
});

router.get('/', (req, res) => {
  res.json(store.listSessions());
});

// Look up a session by its join code (used by teams before joining).
router.get('/by-code/:joinCode', (req, res) => {
  const session = store.getSessionByCode(req.params.joinCode);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(session);
});

router.get('/:id', (req, res) => {
  const session = store.getSession(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(session);
});

// Host updates a session's status (e.g. close it to finalize results).
router.patch('/:id', (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'active', 'closed'];
  if (status !== undefined && !allowed.includes(status)) {
    return res
      .status(400)
      .json({ error: `status must be one of ${allowed.join(', ')}` });
  }
  const session = store.updateSession(req.params.id, status ? { status } : {});
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(session);
});

// Live leaderboard for a session (ranked standings + rounds-scored progress).
router.get('/:id/leaderboard', (req, res) => {
  const session = store.getSession(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(computeLeaderboard(session.id));
});

module.exports = router;
