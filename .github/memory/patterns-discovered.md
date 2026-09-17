# Patterns Discovered

Reusable patterns learned during development (committed, grows over time).

## Template
```
### <Pattern name>
- **Context:** when this applies
- **Problem:** what goes wrong without it
- **Solution:** the pattern
- **Example:** short snippet or reference
- **Related files:**
```

## Patterns

### Cross-entity validation at the route boundary
- **Context:** an endpoint accepts ids from two related entities.
- **Problem:** checking each id exists individually still allows mismatched
  combinations (e.g. a team from another session scored against a round).
- **Solution:** also assert the relationship (`team.sessionId === round.sessionId`)
  and return `400` on mismatch.
- **Example:** `packages/backend/src/routes/scores.js`.
- **Related files:** `store.js` (owns the entities), the route (validates).

### Competition ranking on a composite key
- **Context:** ranking with a tie-break (a primary metric plus a secondary one).
- **Problem:** ranking on the primary value alone flags teams as tied when a
  secondary criterion should actually separate them.
- **Solution:** build a single composite rank key (e.g. `${total}:${bestRound}`),
  sort by each criterion in order, then assign standard competition ranks and the
  `tied` flag based on that composite key — so teams are "tied" only when *all*
  ranking criteria are equal.
- **Example:** `computeLeaderboard` in `packages/backend/src/leaderboard.js`.
- **Related files:** `leaderboard.js`, `__tests__/leaderboard.test.js`.
