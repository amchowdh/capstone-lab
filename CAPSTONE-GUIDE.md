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

---

## Step 3 — Artifact- & image-driven specification

**Technique (session 3):** Feed Copilot raw project artifacts (transcripts, chat
exports) and an actual **image** as first-class context, and generate specs in
**phased, reviewable passes** rather than one big prompt — then implement a UI to
match the image.

### 3a. Raw artifacts as context
- [docs/artifacts/trivia-night-planning-notes.md](docs/artifacts/trivia-night-planning-notes.md)
  — a deliberately messy, conversational planning transcript (standing in for a
  `.vtt`/Slack export) that describes the leaderboard and leaves the **final
  tie-break rule unresolved on purpose** (that ambiguity is what SpecKit resolves
  in Step 6).
- [docs/artifacts/leaderboard-ui-sketch.png](docs/artifacts/leaderboard-ui-sketch.png)
  — a **real** wireframe image of the leaderboard. Per the plan's decision point,
  it was generated **programmatically** (Option A) by
  [docs/artifacts/leaderboard-sketch.py](docs/artifacts/leaderboard-sketch.py)
  (Pillow), so the sketch is reproducible rather than hand-drawn.

### 3b. Synthesize the PRD (from the notes)
`#file`-referencing the planning notes, the transcript was synthesized into
[docs/prd-trivia-night.md](docs/prd-trivia-night.md) — problem, goals, functional
+ UX requirements, and an explicit **Open Questions** section carrying the
unresolved tie-break forward.

### 3c. Phased epics/stories
[docs/epics-and-stories.md](docs/epics-and-stories.md) was generated in three
passes, each reviewable before the next: **titles only → acceptance criteria →
technical requirements**. The phase boundaries are preserved in the doc so the
process is visible.

### 3d. Diagram (Mermaid, validated)
[docs/architecture.md](docs/architecture.md) has a Mermaid **sequence** diagram
(score entry → leaderboard update) and a **flowchart** of the leaderboard
computation.

### 3e. Implement the leaderboard from the sketch
Using the sketch image as visual context, the live leaderboard was implemented to
match it:
- Backend: [leaderboard.js](packages/backend/src/leaderboard.js) —
  `computeLeaderboard(sessionId)` returns `{ standings, roundsTotal,
  roundsScored }`, using **standard competition ranking** (1, 2, 2, 4), treating
  a missing score as 0, and flagging `tied` teams. Exposed at
  `GET /api/sessions/:id/leaderboard`.
- Frontend: [pages/Leaderboard.js](packages/frontend/src/pages/Leaderboard.js) —
  brand header band, "Round X of Y scored" indicator, RANK · TEAM · POINTS table,
  first-place highlight + star, "TIE" chips, footer note, and empty states —
  mirroring the sketch. Reachable from the host (ManageSession) and team
  (JoinSession) screens.

### Decision — replaced Create React App with Vite
The frontend originally used `react-scripts` (CRA). Standing up the dev server
surfaced a hard dependency conflict: CRA 5's toolchain pulls `ajv` in two
incompatible majors (old plugins need `ajv@6`; `webpack-dev-server`'s
`schema-utils@4` needs `ajv@8`), which collides under npm-workspaces hoisting.
Rather than fight it with fragile `overrides`, **`react-scripts` was scrapped in
favor of Vite + Vitest** — lighter (627 packages vs ~1,614), faster (~250ms dev
start), and free of the webpack/ajv problem entirely. The React/MUI app and the
RTL tests were unchanged; only the build/test runner changed. `package-lock.json`
is now committed for reproducible installs (needed by Steps 5 & 7).

### Verification
- Backend: `npm run test:backend` → **18/18** (adds 5 leaderboard tests:
  ranking, missing-score-as-0, tie sharing + competition gap, rounds-scored
  progress, empty session).
- Frontend: `npm run test:frontend` (Vitest) → **3/3** (leaderboard renders
  ranks/points/TIE/progress; waiting state).
- Live data match: a seeded session reproduces the sketch exactly — `1 Quiz Lords
  58 · 2 The Brainiacs 47 · 3 Wit & Wisdom 42 (TIE) · 3 Trivia Newton-John 42
  (TIE) · 5 Anonymice 31`, "Round 3 of 3 scored".
- Dev server: `npm start` runs the app on :3000 proxying `/api` to :3030 for
  visual review (no screenshot required).

**Acceptance (met):** the leaderboard screen exists and matches the sketch;
PRD/epics/diagram docs exist under `docs/`; the tie-break ambiguity is preserved
for Step 6.

---

## Step 4 — MCP (Model Context Protocol) tool orchestration

**Technique (session 4):** An MCP server gives Copilot Agent Mode real external
tool access (GitHub issue search/create/comment, PR creation/merge) that it
invokes automatically mid-conversation — no manual `gh`/web-UI, just
natural-language requests with permission prompts. Here it operates on the
**real** `amchowdh/capstone-lab` repo, so every issue/PR is genuine.

### 4a. Register the GitHub MCP server
[.vscode/mcp.json](.vscode/mcp.json) registers the hosted GitHub MCP server:

```json
{ "servers": { "github": { "type": "http", "url": "https://api.githubcopilot.com/mcp/" } } }
```

Start it from the CodeLens **Start** button in `mcp.json` and approve the GitHub
auth prompt; VS Code then exposes the server's tools to Agent Mode.

> **Repro gotcha:** VS Code only shows the Start CodeLens for an `mcp.json` at a
> **workspace-folder root** `.vscode/`. If the repo is opened as a *subfolder* of
> a larger workspace, add the same config at the workspace root (or use
> *Command Palette → “MCP: Add Server…”*) so the server actually starts in the
> window your chat runs in.

### 4b. Seed real issues (via MCP)
Three genuine, small issues were created on the repo **through MCP** (not the web
UI), each mapping to real code:
- **#1 (bug)** — scores can be recorded for a team not in the round's session.
- **#2 (enhancement)** — host can close a session to finalize results.
- **#3 (enhancement)** — support a "lightning round" worth double points.

### 4c. Triage → prioritize → implement the top one
Agent Mode listed the open issues via MCP and prioritized **#1** (a correctness
bug that silently corrupts leaderboards outranks the two enhancements). The fix:
[routes/scores.js](packages/backend/src/routes/scores.js) now rejects a score
(`400`) when `team.sessionId !== round.sessionId`, with a regression test in
[rounds-scores.test.js](packages/backend/__tests__/rounds-scores.test.js).

### 4d. Ship it — real branch, real PR, real merge (via MCP)
- Local git created `fix/cross-session-score-validation`, committed the fix, and
  pushed it.
- The **PR was opened via MCP** ([#4](https://github.com/amchowdh/capstone-lab/pull/4)),
  body referencing `Closes #1`.
- The **PR was merged via MCP** (squash → `main`), which **auto-closed #1**; a
  closing summary comment was posted on #1 via MCP.

Division of labor: all **GitHub-state** operations (issue create/list/comment, PR
create/merge) went through **MCP**; local `git` was used only for the working-copy
branch/commit/push. Issues #2 and #3 remain open as a realistic backlog.

### Verification
- Backend: `npm run test:backend` → **19/19** (adds the cross-session regression
  test).
- GitHub: issue #1 shows `state: closed`, `state_reason: completed`, closed by
  merged PR #4; `main` fast-forwarded to include the squash-merged fix.

**Acceptance (met):** a real issue was resolved via a real PR on the repo,
orchestrated end-to-end through MCP + Agent Mode (no manual `gh` CLI or GitHub UI
edits for the GitHub-state changes).

---

## Step 5 — Agentic workflow infrastructure (agents, prompts, memory)

**Technique (session 5):** Build persistent agentic infrastructure **once**
(scope-bounded agents + prompt-file slash commands + tiered memory), then drive
iterative, self-documenting development loops through it.

### 5a. The infrastructure
- **Scope-bounded agents** ([.github/agents/](.github/agents/)):
  - [`tdd-developer`](.github/agents/tdd-developer.agent.md) — feature code +
    unit/integration tests; does NOT fix lint or write Playwright.
  - [`code-reviewer`](.github/agents/code-reviewer.agent.md) — lint/quality only;
    does NOT change behavior.
  - [`test-engineer`](.github/agents/test-engineer.agent.md) — Playwright E2E only.
- **Prompt-file slash commands** ([.github/prompts/](.github/prompts/)):
  `/execute-step`, `/validate-step`, `/commit-and-push`, `/create-ui-tests`,
  `/run-ui-tests` — each declares the agent it runs under.
- **Tiered memory** ([.github/memory/](.github/memory/README.md)): persistent
  `instructions.md`, historical `session-notes.md`, accumulated
  `patterns-discovered.md`, and an ephemeral (git-ignored) `scratch/working-notes.md`.
- `.github/copilot-instructions.md` gained *Workflow patterns*, *Agent usage*, and
  *Memory system* sections tying it together.

> **Repro gotcha (same root cause as Step 4):** VS Code discovers `.github/prompts`
> and `.github/agents` relative to the **workspace-folder root**. When the repo is
> a subfolder of a larger workspace, the slash commands don't appear. Fix: point
> VS Code at the nested paths via workspace settings —
> `chat.promptFilesLocations`, `chat.modeFilesLocations`/`chat.agentFilesLocations`
> keyed to `capstone-lab/.github/...` — then reload the window.

### 5b. Drive a feature through the loop (`/execute-step`)
Running **`/execute-step`** (which switches to `tdd-developer`) built the
**tie-break ranking** feature test-first:
- **RED** — added tie-break tests; the "separate equal-total teams by best round"
  test failed for the right reason (equal totals shared rank 1).
- **GREEN** — [`computeLeaderboard`](packages/backend/src/leaderboard.js) now
  computes each team's `bestRoundScore`, sorts by `total → bestRound → teamId`,
  and ranks/flags `tied` on the composite key `${total}:${bestRound}`.
- **REFACTOR** — the single composite key drives both sort and tie detection;
  already tidy.
- Backend **21/21** (the Step 3 single-round tie still passes — no regression).

### 5c. The memory learning loop
The reusable insight — *competition ranking on a composite key* — was recorded in
[patterns-discovered.md](.github/memory/patterns-discovered.md) during the loop,
so future work inherits it. In-progress reasoning went to the ephemeral
`scratch/working-notes.md` (never committed).

### Scope decisions
- The **Playwright E2E** for tie ordering (via `test-engineer`) is left as an
  optional follow-up — the tie-break is fully covered by unit tests, and the
  E2E harness install is heavy relative to its value here.
- The **`code-reviewer` lint pass** is deferred to **Step 7**, where the CI lint
  gate introduces ESLint (avoids standing up lint tooling twice).

### Verification
- Backend: `npm run test:backend` → **21/21**.
- `patterns-discovered.md` has a real entry captured during the loop.

**Acceptance (met):** the tie-break logic is implemented and unit-tested via the
agentic loop, and the memory system captured a real learning. (E2E + lint
demonstrations are scheduled where they add the most value: E2E optional, lint at
Step 7.)

---

## Step 6 — Spec-Driven Development with SpecKit

**Technique (session 6):** A fully versioned, on-disk spec pipeline
(constitution → spec → clarify → plan → tasks → implement) that turns an
ambiguous story into a high-confidence implementation, auditable at every stage.

### 6a. Install & init
`uv tool install specify-cli --from git+…@v0.16.2` (pinned), then
`specify init --here --force --integration copilot --extension git` — creates
[.specify/](.specify/) (templates, sh scripts, `memory/constitution.md`, the git
extension) and `.github/skills/speckit-*` (the slash-command skills).

> **Repro gotcha (recurring):** the `/speckit-*` skills live in
> `capstone-lab/.github/skills/`. In a parent-folder workspace VS Code won't
> discover them — **add `capstone-lab` as a workspace folder** (File → Add Folder
> to Workspace) and reload. That one change also makes the Step 5 prompts/agents
> discover natively.

### 6b. The pipeline (all run by the user as `/speckit-*` slash commands)
1. **`/speckit-constitution`** → [.specify/memory/constitution.md](.specify/memory/constitution.md)
   `v1.0.0` — 5 principles derived from the docs (minimal scope; test-first RGR;
   thin routers/store; MUI+`api.js`; validate at boundaries).
2. **`/speckit-specify`** → the git hook auto-created branch `001-final-tiebreak`
   and [specs/001-final-tiebreak/spec.md](specs/001-final-tiebreak/spec.md) with
   **3 intentional `[NEEDS CLARIFICATION]`** markers (the genuinely undecided
   final tie-break rule) + a requirements checklist.
3. **`/speckit-clarify`** — interactive Q&A (3 questions), appended as a
   `## Clarifications` section: rule = **highest score in the last round**;
   fallback = **explicit joint win**; designated special round = **out of scope**.
4. **`/speckit-plan`** → [plan.md](specs/001-final-tiebreak/plan.md) +
   [research.md](specs/001-final-tiebreak/research.md),
   [data-model.md](specs/001-final-tiebreak/data-model.md),
   [contracts/](specs/001-final-tiebreak/contracts/leaderboard-api.md),
   [quickstart.md](specs/001-final-tiebreak/quickstart.md); Constitution Check PASS.
5. **`/speckit-tasks`** → [tasks.md](specs/001-final-tiebreak/tasks.md) — 15
   dependency-ordered, test-first tasks (Setup → Foundational → US1 → US2 → US3 →
   Polish).
6. **`/speckit-implement`** — executed all 15 tasks test-first: close-session
   status transition; `computeLeaderboard` gains `lastRoundScore` + `isFinal` and,
   when closed, ranks `total → best-round → last-round` with an explicit joint win;
   frontend "Final Results" state + close control. **Backend 30/30, frontend 4/4.**

Every stage auto-committed via the SpecKit **git extension hooks**. `/speckit-analyze`
and `/speckit-converge` were skipped by choice (implementation complete + green).

### The ambiguity payoff
Because the final tie-break was left undecided in the spec, `/speckit-clarify` had
*real* questions to ask — the whole point of the pipeline. Step 5 built a *simple*
best-round tiebreak via TDD; Step 6 layered the *nuanced, spec-driven* final rule
on top, distinct and auditable.

**Acceptance (met):** `constitution.md` and `specs/001-final-tiebreak/{spec,plan,tasks}.md`
exist and are coherent; the clarify step resolved genuine ambiguity; the
implementation is green. The feature is merged via the Step 7 PR.
