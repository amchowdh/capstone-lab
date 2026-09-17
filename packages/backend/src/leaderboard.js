const store = require('./store');

// Computes the live leaderboard for a session.
// - total points per team across all rounds; a missing score counts as 0
// - best-single-round score is the first tie-break (Step 5)
// - when the session is CLOSED, a second tie-break applies: highest score in the
//   last (highest-numbered) round. Teams equal on total, best-round AND
//   last-round share a rank → an explicit joint win (Step 6, spec 001).
// - `isFinal` is true when the session is closed (final results).
function computeLeaderboard(sessionId) {
  const session = store.getSession(sessionId);
  const isFinal = !!session && session.status === 'closed';

  const teams = store.listTeams(sessionId);
  const scores = store.listScoresBySession(sessionId);
  const rounds = store.listRounds(sessionId); // sorted by roundNumber asc
  const lastRound = rounds.length ? rounds[rounds.length - 1] : null;

  const standings = teams.map((team) => {
    const teamScores = scores.filter((s) => s.teamId === team.id);
    const totalPoints = teamScores.reduce((sum, s) => sum + s.points, 0);
    const bestRoundScore = teamScores.reduce(
      (max, s) => Math.max(max, s.points),
      0
    );
    const lastRoundScore = lastRound
      ? teamScores.find((s) => s.roundId === lastRound.id)?.points ?? 0
      : 0;
    return {
      teamId: team.id,
      teamName: team.name,
      totalPoints,
      bestRoundScore,
      lastRoundScore
    };
  });

  // Final standings add last-round as a third criterion; live standings do not.
  standings.sort(
    (a, b) =>
      b.totalPoints - a.totalPoints ||
      b.bestRoundScore - a.bestRoundScore ||
      (isFinal ? b.lastRoundScore - a.lastRoundScore : 0) ||
      a.teamId - b.teamId
  );

  const rankKey = (s) =>
    isFinal
      ? `${s.totalPoints}:${s.bestRoundScore}:${s.lastRoundScore}`
      : `${s.totalPoints}:${s.bestRoundScore}`;
  const keyCounts = standings.reduce((acc, s) => {
    acc[rankKey(s)] = (acc[rankKey(s)] || 0) + 1;
    return acc;
  }, {});

  let previousKey = null;
  let previousRank = 0;
  standings.forEach((s, index) => {
    if (rankKey(s) === previousKey) {
      s.rank = previousRank; // share the rank of the tie group
    } else {
      s.rank = index + 1; // standard competition ranking (gap after ties)
      previousRank = s.rank;
      previousKey = rankKey(s);
    }
    s.tied = keyCounts[rankKey(s)] > 1;
  });

  const roundsScored = rounds.filter((r) =>
    scores.some((s) => s.roundId === r.id)
  ).length;

  return { isFinal, standings, roundsTotal: rounds.length, roundsScored };
}

module.exports = { computeLeaderboard };
