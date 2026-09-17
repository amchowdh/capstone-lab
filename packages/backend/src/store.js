// In-memory data store for Trivia Night.
// Intentionally simple (no DB) — the app exists to demonstrate AI-driven
// workflow techniques, not persistence engineering. See docs/capstone-plan.md.
//
// Step 1 scope is deliberately minimal: Sessions + Teams only.
// Rounds, Scores, leaderboard, and tie-break logic are added in later steps
// via their designated techniques (context anchor, TDD, SpecKit, etc.).

const state = {
  sessions: [],
  teams: [],
  counters: { session: 0, team: 0 }
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

function reset() {
  state.sessions = [];
  state.teams = [];
  state.counters = { session: 0, team: 0 };
}

module.exports = {
  createSession,
  listSessions,
  getSession,
  getSessionByCode,
  createTeam,
  listTeams,
  findTeamByName,
  reset
};
