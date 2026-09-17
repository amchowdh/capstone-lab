const express = require('express');
const store = require('../store');

const router = express.Router();

// Host adds a round (category + max points) to a session.
router.post('/', (req, res) => {
  const { sessionId, category, maxPoints } = req.body;
  if (!sessionId || !store.getSession(sessionId)) {
    return res.status(404).json({ error: 'Session not found' });
  }
  if (!category || typeof category !== 'string' || category.trim() === '') {
    return res.status(400).json({ error: 'Round category is required' });
  }
  if (
    maxPoints === undefined ||
    Number.isNaN(Number(maxPoints)) ||
    Number(maxPoints) <= 0
  ) {
    return res.status(400).json({ error: 'maxPoints must be a positive number' });
  }
  const round = store.createRound({
    sessionId,
    category: category.trim(),
    maxPoints
  });
  res.status(201).json(round);
});

router.get('/', (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });
  res.json(store.listRounds(sessionId));
});

module.exports = router;
