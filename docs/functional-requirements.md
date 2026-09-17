# Functional Requirements — Trivia Night

## Purpose
Trivia Night lets a **host** run a live trivia session and lets **teams** join
with a short code and follow a live leaderboard. The app is intentionally small;
it exists to demonstrate AI-driven development techniques (see
[capstone-plan.md](capstone-plan.md)).

## Roles
- **Host** — authenticated (simple JWT, added when needed). Creates sessions,
  defines rounds, enters scores, closes sessions.
- **Team** — no account. Joins a session via a short join code and views the
  live leaderboard.

## Core entities
- **Session**: `id`, `name`, `date`, `joinCode`, `status` (`pending` | `active`
  | `closed`), `hostId`
- **Team**: `id`, `sessionId`, `name`, `joinedAt`
- **Round**: `id`, `sessionId`, `roundNumber`, `category`, `maxPoints`
- **Score**: `id`, `roundId`, `teamId`, `points`
- **Leaderboard**: computed aggregate of `Score` per team, ranked, with
  tie-break logic (defined later via the SpecKit pipeline — ambiguity is
  intentional).

## Feature set (the whole app — do not expand beyond this)
1. Host signup/login (JWT).
2. Host creates a session → system generates a join code.
3. Team joins a session with the join code + team name (no login).
4. Host adds rounds (category + max points) to a session.
5. Host enters/edits a team's score for a round.
6. Live leaderboard view (ranked, tie-break applied).
7. Host closes a session → final results view.

## Implementation status
| # | Feature | Status | Built in |
|---|---|---|---|
| 2 | Create session + join code | Done | Step 1 |
| 3 | Team joins via code | Done | Step 1 |
| 4 | Host adds rounds | Done | Step 2 |
| 5 | Host enters/edits scores | Done | Step 2 |
| 6 | Live leaderboard | Done | Step 3 |
| — | Tie-break ranking | Done | Steps 5–6 |
| 1 | Host auth (JWT) | Later | as needed |
| 7 | Close session / final results | Done | Step 6 |

## API conventions
- REST under `/api`, JSON request/response.
- Resources: `/api/sessions`, `/api/teams`, `/api/rounds`, `/api/scores`.
- Validation errors return `400`; missing resources `404`; conflicts `409`.
- Scores are **upserted** per (round, team) — re-entering a score edits it.
- A score may not exceed its round's `maxPoints`.
