const store = require('./store');

// Computes the live leaderboard for a session.
// - total points per team across all rounds; a missing score counts as 0
// - ranked by total points descending, then by a tie-break: highest single
//   round score (descending)
// - standard competition ranking on the (totalPoints, bestRoundScore) pair:
//   two teams share a rank only when BOTH values are equal, with a gap after
//   the tie group (e.g. 1, 2, 2, 4)
// - `tied` flags teams that still share their (totalPoints, bestRoundScore)
//   with at least one other team after the tie-break
//
// A richer, cross-round tie-break rule is specified later via SpecKit (Step 6).
function computeLeaderboard(sessionId) {
  const teams = store.listTeams(sessionId);
  const scores = store.listScoresBySession(sessionId);
  const rounds = store.listRounds(sessionId);

  const standings = teams.map((team) => {
    const teamScores = scores.filter((s) => s.teamId === team.id);
    const totalPoints = teamScores.reduce((sum, s) => sum + s.points, 0);
    const bestRoundScore = teamScores.reduce(
      (max, s) => Math.max(max, s.points),
      0
    );
    return { teamId: team.id, teamName: team.name, totalPoints, bestRoundScore };
  });

  standings.sort(
    (a, b) =>
      b.totalPoints - a.totalPoints ||
      b.bestRoundScore - a.bestRoundScore ||
      a.teamId - b.teamId
  );

  // A team is tied only when another shares BOTH total and best-round score.
  const rankKey = (s) => `${s.totalPoints}:${s.bestRoundScore}`;
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

  return { standings, roundsTotal: rounds.length, roundsScored };
}

module.exports = { computeLeaderboard };
