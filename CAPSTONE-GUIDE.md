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

---

## Step 2 — `.github/copilot-instructions.md` as context anchor

**Technique (session 2):** A single `.github/copilot-instructions.md` that
references all project docs is read automatically by Copilot in every chat,
keeping generated code aligned to documented standards. Paired with a discipline
of *critically reviewing* AI-generated tests rather than trusting them.

### 2a. Build the context anchor (docs first, one at a time)

Four guideline docs were authored, and after each one the instructions file was
updated to reference it (mirroring lab 2's `2-1` → `2-4`):

1. [docs/functional-requirements.md](docs/functional-requirements.md) — roles,
   entities, the fixed 7-feature set, API conventions, and a live
   implementation-status table.
2. [docs/ui-guidelines.md](docs/ui-guidelines.md) — MUI design system, screen
   specs, interaction/accessibility patterns.
3. [docs/testing-guidelines.md](docs/testing-guidelines.md) — test stack and,
   crucially, the **AI-test review checklist** ("can I break the function and
   still have the test pass?", no phantom assertions, no mock hallucinations).
4. [docs/coding-guidelines.md](docs/coding-guidelines.md) — style, backend/
   frontend structure (thin routers, store owns data rules, components call
   `api.js`), error handling, git practices.

The anchor itself: [.github/copilot-instructions.md](.github/copilot-instructions.md)
— a short project summary plus an "Always follow these docs" section linking all
four, and a "Working agreements" list. Because Copilot loads this file
automatically, every subsequent prompt inherits these standards without having to
restate them.

### 2b. Build a feature "with context" (plan → review → implement)

The designated feature was **round management + score entry** (features 4 & 5).
Following the lab-2 flow, an implementation plan was proposed and **reviewed
before any code was written**, then implemented so the output conformed to the
just-written guidelines:

- Backend (thin routers, store owns rules — per coding-guidelines):
  - [store.js](packages/backend/src/store.js) gained `Round`/`Score` state and
    helpers: `createRound` (auto-increments `roundNumber`), `listRounds`,
    `getRound`, `getTeam`, `upsertScore` (edits in place per `(round, team)`),
    `listScoresBySession`.
  - [routes/rounds.js](packages/backend/src/routes/rounds.js) — `POST`/`GET`
    with validation (`category` required, `maxPoints` positive, session exists).
  - [routes/scores.js](packages/backend/src/routes/scores.js) — upsert with
    boundary validation (`0 ≤ points ≤ round.maxPoints`; round + team must
    exist).
- Frontend (MUI + `api.js`, never axios directly — per ui-guidelines):
  - [pages/ManageSession.js](packages/frontend/src/pages/ManageSession.js) —
    add-round form plus a per-round score-entry table over joined teams; editing
    a cell upserts the score. Reached via a "Manage session" button on the
    create-session success screen.
  - [api.js](packages/frontend/src/api.js) gained `addRound`, `listRounds`,
    `upsertScore`, `listScores`.

### 2c. Validate the tests (the review beat)

Per testing-guidelines, the generated tests were not trusted on green alone. The
`maxPoints` cap check in `routes/scores.js` was **deliberately disabled**, then
the cap test was run:

```
npx jest rounds-scores -t "maxPoints"
→ FAIL: expected status 400, received 201
```

The test failed exactly as it should — confirming it is a real assertion tied to
the implementation, not a false positive. The implementation was then restored
and the full suite re-run green.

### What to watch for

- **Upsert vs. duplicate:** re-entering a score must edit the existing record,
  not append a second one. Pinned by a test asserting the score list stays length
  1 after an edit.
- **Boundary validation lives in the router,** data shape/identity in the store —
  matching the coding-guidelines separation.
- **The anchor only helps if it's honest:** the functional-requirements status
  table is kept current (features 4/5 now marked done, 6 deferred to Step 3) so
  the context never lies to future prompts.

### Verification

- Backend: `npm run test:backend` → **13/13** passing (5 core + 8 round/score).
- Frontend: `npm run test:frontend` → 1/1 passing.

**Acceptance (met):** round + score CRUD works against a test suite that was
actively reviewed and proven to fail on a real regression, not just accepted.
