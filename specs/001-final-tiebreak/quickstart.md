# Quickstart — Validate the Final Tie-Break

Prerequisites: `npm install` done; backend on :3030, frontend on :3000
(`npm start`). See [contracts/leaderboard-api.md](contracts/leaderboard-api.md)
and [data-model.md](data-model.md) for shapes.

## Scenario A — last-round breaks a final tie
1. Create a session; join teams **X** and **Y**.
2. Add 2 rounds (max 10 each). Score so both total 12 and both have best-round 8,
   but X scores higher than Y in the **last** round.
3. Close the session (`PATCH /api/sessions/:id {"status":"closed"}`).
4. `GET /api/sessions/:id/leaderboard` → `isFinal: true`, **X ranked above Y**,
   both `tied: false`.

## Scenario B — explicit joint win (still tied)
1. As above, but X and Y have identical scores in **every** round.
2. Close the session; fetch the leaderboard.
3. Expect both teams share rank 1 with `tied: true` (joint win).

## Scenario C — active session unchanged
1. With an **open** (not closed) session where two teams tie on total and
   best-round, fetch the leaderboard.
2. Expect `isFinal: false` and the two teams share a rank (`tied: true`) —
   the last-round rule is NOT applied.

## Scenario D — edge cases
- Close a session with **no rounds/scores** → no error; all teams joint at 0.
- **3+ teams** mutually tied → the rule orders/joins all of them consistently.

Automated coverage lives in `packages/backend/__tests__/leaderboard.test.js`
(Jest + Supertest), written test-first during implementation.
