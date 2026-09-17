# Phase 0 Research — Final Tie-Break

All spec ambiguities were resolved in `/speckit-clarify`; this records the
design decisions and rejected alternatives.

## Decision 1 — Tie-break criterion (FR-004)
- **Decision**: Break a remaining final tie by the team's score in the **last
  (highest-numbered) round**, descending.
- **Rationale**: Deterministic, uses data already stored, needs no new fields or
  UI, and mirrors a common "closing round decides it" trivia convention.
- **Alternatives considered**: designated "lightning"/hard round (adds a per-round
  attribute + host UI — rejected as scope creep, see Decision 3); category
  head-to-head (requires choosing a category — more UI, less general); coin-flip
  flag (non-deterministic).

## Decision 2 — Fallback when still tied (FR-005)
- **Decision**: Declare an **explicit joint win** — still-tied teams share the
  same final rank, labeled tied.
- **Rationale**: Honest (they tied on every available criterion), deterministic,
  no extra input. Matches the planning-notes "split the prize" idea.
- **Alternatives considered**: stable order by join time (manufactures a winner
  from an unrelated attribute); host manual pick (adds interactive workflow).

## Decision 3 — Data scope (FR-007)
- **Decision**: Use **existing round/score data only**; do not add a designated
  special round.
- **Rationale**: Keeps the app small (Constitution I). The last-round rule already
  fully resolves ties. A designated-round mechanic overlaps with a separate
  backlog enhancement and would expand data model + UI.
- **Alternatives considered**: add `isLightning`/`multiplier` per round — deferred.

## Decision 4 — Where the rule lives & when it applies
- **Decision**: Apply the last-round criterion **only when the session status is
  `closed`**, inside `computeLeaderboard`. Active sessions keep the existing
  total → best-round ranking with cosmetic joint ranks.
- **Rationale**: Single source of ranking truth (`leaderboard.js`); mid-game ties
  stay cosmetic per FR-002.

## Decision 5 — "Close session" capability
- **Decision**: Add a thin status transition to `closed` (store mutation +
  validated route). Surface a `final` flag on the leaderboard response.
- **Rationale**: The trigger is `closed` status; a minimal, validated transition
  is enough — no broader session lifecycle work.
