const store = require('./store');

// Computes the live leaderboard for a session.
// - total points per team across all rounds; a missing score counts as 0
// - ranked by total points descending
// - standard competition ranking: equal totals share a rank, with a gap after
//   the tie group (e.g. 1, 2, 2, 4)
// - `tied` flags teams that share their total with at least one other team
//
// Final tie-break (who actually wins an equal top score) is intentionally NOT
// decided here — joint ranks only. That rule is specified later via SpecKit.
function computeLeaderboard(sessionId) {
  const teams = store.listTeams(sessionId);
  const scores = store.listScoresBySession(sessionId);
  const rounds = store.listRounds(sessionId);

  const standings = teams.map((team) => {
    const totalPoints = scores
      .filter((s) => s.teamId === team.id)
      .reduce((sum, s) => sum + s.points, 0);
    return { teamId: team.id, teamName: team.name, totalPoints };
  });

  standings.sort(
    (a, b) => b.totalPoints - a.totalPoints || a.teamId - b.teamId
  );

  const totalCounts = standings.reduce((acc, s) => {
    acc[s.totalPoints] = (acc[s.totalPoints] || 0) + 1;
    return acc;
  }, {});

  let previousTotal = null;
  let previousRank = 0;
  standings.forEach((s, index) => {
    if (s.totalPoints === previousTotal) {
      s.rank = previousRank; // share the rank of the tie group
    } else {
      s.rank = index + 1; // standard competition ranking (gap after ties)
      previousRank = s.rank;
      previousTotal = s.totalPoints;
    }
    s.tied = totalCounts[s.totalPoints] > 1;
  });

  const roundsScored = rounds.filter((r) =>
    scores.some((s) => s.roundId === r.id)
  ).length;

  return { standings, roundsTotal: rounds.length, roundsScored };
}

module.exports = { computeLeaderboard };
