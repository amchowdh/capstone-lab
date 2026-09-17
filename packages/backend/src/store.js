// In-memory data store for Trivia Night.
// Intentionally simple (no DB) — the app exists to demonstrate AI-driven
// workflow techniques, not persistence engineering. See docs/capstone-plan.md.
//
// Sessions + Teams landed in Step 1. Rounds + Scores were added in Step 2
// (round management + score entry). Leaderboard and tie-break logic arrive in
// later steps via their designated techniques (TDD, SpecKit).

const state = {
  sessions: [],
  teams: [],
  rounds: [],
  scores: [],
  counters: { session: 0, team: 0, round: 0, score: 0 }
};

function nextId(entity) {
  state.counters[entity] += 1;
  return state.counters[entity];
}

function generateJoinCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous 0/O/1/I
  let code = '';
  do {
    code = Array.from({ length: 6 }, () =>
      alphabet[Math.floor(Math.random() * alphabet.length)]
    ).join('');
  } while (state.sessions.some((s) => s.joinCode === code));
  return code;
}

// --- Sessions ---
function createSession({ name, date, hostId = null }) {
  const session = {
    id: nextId('session'),
    name,
    date: date || null,
    joinCode: generateJoinCode(),
    status: 'pending',
    hostId
  };
  state.sessions.push(session);
  return session;
}

function listSessions() {
  return state.sessions;
}

function getSession(id) {
  return state.sessions.find((s) => s.id === Number(id)) || null;
}

function getSessionByCode(joinCode) {
  if (!joinCode) return null;
  return (
    state.sessions.find(
      (s) => s.joinCode.toUpperCase() === String(joinCode).toUpperCase()
    ) || null
  );
}

// --- Teams ---
function createTeam({ sessionId, name }) {
  const team = {
    id: nextId('team'),
    sessionId: Number(sessionId),
    name,
    joinedAt: new Date().toISOString()
  };
  state.teams.push(team);
  return team;
}

function listTeams(sessionId) {
  return state.teams.filter((t) => t.sessionId === Number(sessionId));
}

function findTeamByName(sessionId, name) {
  const target = String(name).trim().toLowerCase();
  return (
    listTeams(sessionId).find((t) => t.name.toLowerCase() === target) || null
  );
}

function getTeam(id) {
  return state.teams.find((t) => t.id === Number(id)) || null;
}

// --- Rounds ---
function createRound({ sessionId, category, maxPoints }) {
  const existing = listRounds(sessionId);
  const round = {
    id: nextId('round'),
    sessionId: Number(sessionId),
    roundNumber: existing.length + 1,
    category,
    maxPoints: Number(maxPoints)
  };
  state.rounds.push(round);
  return round;
}

function listRounds(sessionId) {
  return state.rounds
    .filter((r) => r.sessionId === Number(sessionId))
    .sort((a, b) => a.roundNumber - b.roundNumber);
}

function getRound(id) {
  return state.rounds.find((r) => r.id === Number(id)) || null;
}

// --- Scores ---
// Upsert keyed on (roundId, teamId): re-entering a score edits it in place.
function upsertScore({ roundId, teamId, points }) {
  const existing = state.scores.find(
    (s) => s.roundId === Number(roundId) && s.teamId === Number(teamId)
  );
  if (existing) {
    existing.points = Number(points);
    return existing;
  }
  const score = {
    id: nextId('score'),
    roundId: Number(roundId),
    teamId: Number(teamId),
    points: Number(points)
  };
  state.scores.push(score);
  return score;
}

function listScoresBySession(sessionId) {
  const roundIds = listRounds(sessionId).map((r) => r.id);
  return state.scores.filter((s) => roundIds.includes(s.roundId));
}

function reset() {
  state.sessions = [];
  state.teams = [];
  state.rounds = [];
  state.scores = [];
  state.counters = { session: 0, team: 0, round: 0, score: 0 };
}

module.exports = {
  createSession,
  listSessions,
  getSession,
  getSessionByCode,
  createTeam,
  listTeams,
  findTeamByName,
  getTeam,
  createRound,
  listRounds,
  getRound,
  upsertScore,
  listScoresBySession,
  reset
};
