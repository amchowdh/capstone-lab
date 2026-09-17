const express = require('express');
const store = require('../store');

const router = express.Router();

// Host enters or edits a team's score for a round (upsert).
router.post('/', (req, res) => {
  const { roundId, teamId, points } = req.body;
  const round = store.getRound(roundId);
  if (!round) return res.status(404).json({ error: 'Round not found' });
  const team = store.getTeam(teamId);
  if (!team) return res.status(404).json({ error: 'Team not found' });
  if (
    points === undefined ||
    Number.isNaN(Number(points)) ||
    Number(points) < 0
  ) {
    return res.status(400).json({ error: 'points must be a non-negative number' });
  }
  if (Number(points) > round.maxPoints) {
    return res
      .status(400)
      .json({ error: `points cannot exceed round maxPoints (${round.maxPoints})` });
  }
  const score = store.upsertScore({ roundId, teamId, points });
  res.status(201).json(score);
});

router.get('/', (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });
  res.json(store.listScoresBySession(sessionId));
});

module.exports = router;
