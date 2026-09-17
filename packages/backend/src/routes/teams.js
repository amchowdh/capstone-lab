const express = require('express');
const store = require('../store');

const router = express.Router();

// A team joins a session using its join code (no account needed).
router.post('/', (req, res) => {
  const { joinCode, name } = req.body;
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Team name is required' });
  }
  const session = store.getSessionByCode(joinCode);
  if (!session) return res.status(404).json({ error: 'Invalid join code' });

  // Self-correction follow-up (Step 1): two teams could previously join the
  // same session with an identical name. Reject duplicates (case-insensitive).
  if (store.findTeamByName(session.id, name)) {
    return res
      .status(409)
      .json({ error: `A team named "${name.trim()}" already joined this session` });
  }

  const team = store.createTeam({ sessionId: session.id, name: name.trim() });
  res.status(201).json({ team, session });
});

router.get('/', (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });
  res.json(store.listTeams(sessionId));
});

module.exports = router;
