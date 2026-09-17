# Phase 1 Data Model — Final Tie-Break

No new entities. One new value derived at read time; one status transition.

## Session (existing)
- `status`: `pending` | `active` | `closed`.
- **Transition added**: `pending`/`active` → `closed` (host action). Once
  `closed`, the leaderboard is treated as final and the tie-break applies.

## Leaderboard standing (computed — extended)
Each standing row already has `teamId`, `teamName`, `totalPoints`,
`bestRoundScore`, `rank`, `tied`. This feature adds:
- `lastRoundScore` (number): the team's score in the highest-numbered round
  (0 if unscored). Used as the tie-break criterion **only when the session is
  closed**.

Ranking key:
- **Active session**: `totalPoints DESC → bestRoundScore DESC → teamId ASC`;
  `tied` = another team shares `(totalPoints, bestRoundScore)`.
- **Closed session (final)**: `totalPoints DESC → bestRoundScore DESC →
  lastRoundScore DESC → teamId ASC`; `tied` = another team shares
  `(totalPoints, bestRoundScore, lastRoundScore)` → **explicit joint win**.

## Leaderboard response (extended)
- `isFinal` (boolean): `true` when the session status is `closed`.
- `standings`, `roundsTotal`, `roundsScored` (existing).

## Validation rules
- Closing a session: only a `pending`/`active` session may be closed; closing an
  already-`closed` session is idempotent (or `409`, see contract).
- `lastRoundScore` derives from the highest `roundNumber` that has any score;
  with no rounds, it is 0 for all teams (all trivially joint).
