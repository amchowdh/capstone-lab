# Capstone Guide — Trivia Night

This guide is written **progressively**, one section per step, as each step of
[docs/capstone-plan.md](docs/capstone-plan.md) is actually executed. It is a
narrative you could follow to reproduce the work: the prompts run, the artifacts
produced, decisions made, and what to watch for. Each step maps a specific
AI-driven development technique (from
[docs/lab-ai-concepts-reference.md](docs/lab-ai-concepts-reference.md)) onto a
small slice of the app.

> **App scope reminder:** Trivia Night is intentionally tiny. The value is in
> *how* each feature was built (which technique), not in feature depth. See
> "Explicit non-goals" in the plan.

## App at a glance

- **Stack:** Node.js/Express backend + React (MUI) frontend, npm workspaces
  (`packages/backend`, `packages/frontend`).
- **Persistence:** in-memory store (no DB) — deliberately simple.
- **Entities:** `Session`, `Team` (in Step 1); `Round`, `Score`, and the computed
  leaderboard are added in later steps via their designated techniques.
- **Run locally:** `npm install` then `npm start` (backend on :3030, frontend on
  :3000). `npm test` runs backend + frontend suites.

---

## Step 1 — Agent Mode delegation

**Technique (session 1):** Delegate a multi-step, multi-file task to Copilot
Agent Mode in plain natural language. The agent inspects the codebase, makes
coordinated changes across backend + frontend, and self-corrects on follow-up
requests. No supporting artifacts (`copilot-instructions.md`, prompt files,
agents) are used yet — this is pure default Agent Mode.

### What was delegated

The monorepo shell (`package.json`, `packages/backend`, `packages/frontend`,
`.gitignore`) was scaffolded first — per the plan, that scaffolding is not the
technique being demonstrated, so it does not matter whether a human or the agent
creates it.

The technique itself was demonstrated with two natural-language delegations.

> **Scope note:** Step 1 is deliberately kept to **create-session + join-by-code
> only**. The other features are intentionally *not* built here — each is earned
> later through its designated technique: round management + score entry via the
> context anchor (Step 2), the leaderboard screen from a UI sketch (Step 3),
> tie-break logic via TDD (Step 5), and nuanced tie-break rules via SpecKit
> (Step 6). Front-loading them into a hand-built Step 1 would hollow out those
> steps.

**Delegation 1 — bootstrap the app (single prompt):**

> "Bootstrap an Express + React trivia night app: backend with Session and Team
> in-memory models and CRUD routes; React frontend (MUI) with a page to create a
> session (returns a join code) and a page to join one via join code."

From that one request the agent produced a coordinated, multi-file slice:

- Backend
  - [packages/backend/src/store.js](packages/backend/src/store.js) — in-memory
    `Session` + `Team` models and CRUD helpers, join-code generation (6-char,
    ambiguous characters like `0/O/1/I` excluded), and a `reset()` used by tests.
  - Route modules [sessions.js](packages/backend/src/routes/sessions.js) and
    [teams.js](packages/backend/src/routes/teams.js), wired together in
    [packages/backend/src/app.js](packages/backend/src/app.js).
- Frontend
  - [packages/frontend/src/pages/CreateSession.js](packages/frontend/src/pages/CreateSession.js)
    — host creates a session and is shown the generated join code.
  - [packages/frontend/src/pages/JoinSession.js](packages/frontend/src/pages/JoinSession.js)
    — a team joins with a join code + team name (no account).
  - MUI theming and routing in
    [packages/frontend/src/index.js](packages/frontend/src/index.js) and
    [packages/frontend/src/App.js](packages/frontend/src/App.js).

**Delegation 2 — the multi-file self-correction follow-up (mirrors lab 1's
second delegation):**

> "Two teams can currently join the same session with an identical name —
> prevent duplicate team names within a session and surface a clear error."

This is the coordinated, self-correcting change that spans layers:

- `store.findTeamByName(sessionId, name)` does a case-insensitive lookup
  ([store.js](packages/backend/src/store.js)).
- The join route returns `409` with a friendly message when a duplicate is
  detected ([teams.js](packages/backend/src/routes/teams.js)); the existing
  `JoinSession` error path surfaces it in the UI with no frontend change needed.
- Pinned by a test asserting a case-insensitive duplicate (`Aces` vs `aces`) is
  rejected
  ([core-flow.test.js](packages/backend/__tests__/core-flow.test.js)).

### What to watch for

- **Case-insensitivity:** the naive guard compares raw strings, letting `aces`
  slip past `Aces`. The follow-up forces a normalized comparison — the
  "self-correct when told about a bug" beat from lab 1.
- **Join-code collisions:** codes are regenerated on the rare collision rather
  than assumed unique.
- **No auth yet:** `hostId` is accepted but optional. JWT auth is introduced in a
  later step; the plan explicitly defers it out of Step 1.

### Verification

- Backend: `npm run test:backend` → 5/5 passing (create session, reject nameless
  session, join via code, reject bad code, reject duplicate team name).
- Frontend: `npm run test:frontend` → 1/1 passing (home screen renders).

**Acceptance (met):** app boots locally, a host can create a session and is given
a join code, and a team can join via that code.
