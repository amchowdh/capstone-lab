---
description: "Task list for Final Tie-Break for Session Winners"
---

# Tasks: Final Tie-Break for Session Winners

**Input**: Design documents from `/specs/001-final-tiebreak/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md
**Tests**: REQUESTED (spec Testing section + Constitution II — Test-First)

**Branch**: `001-final-tiebreak`

## Phase 1: Setup

- [X] T001 Confirm on branch `001-final-tiebreak` and baseline green: run `npm run test:backend` and `npm run test:frontend`

## Phase 2: Foundational (blocking — the `closed` status is the tie-break trigger)

- [X] T002 [P] Write failing test: `PATCH /api/sessions/:id {"status":"closed"}` sets status to `closed`, rejects invalid status (400), missing session (404) in packages/backend/__tests__/sessions.test.js
- [X] T003 Add `updateSession(id, { status })` (validated status set) in packages/backend/src/store.js
- [X] T004 Add `PATCH /api/sessions/:id` status-transition route (validate allowed statuses; idempotent close) in packages/backend/src/routes/sessions.js — makes T002 pass

## Phase 3: User Story 1 — Decisive final result at close (Priority: P1) 🎯 MVP

**Goal**: A closed session resolves teams tied on total + best-round via last-round score; still-tied → explicit joint win.
**Independent test**: Close a session with two teams tied on total and best-round; leaderboard ranks them by last-round score (or joint-wins if equal).

- [X] T005 [P] [US1] Write failing tests: closed session breaks a total+best-round tie by highest last-round score; response includes `isFinal: true` and `lastRoundScore` in packages/backend/__tests__/leaderboard.test.js
- [X] T006 [P] [US1] Write failing test: teams equal on total, best-round AND last-round get an **explicit joint win** (shared rank, `tied: true`) in packages/backend/__tests__/leaderboard.test.js
- [X] T007 [P] [US1] Write failing tests for edge cases: 3+ mutually tied teams resolved/joined consistently; closing a session with no rounds/scores does not error (all joint at 0) in packages/backend/__tests__/leaderboard.test.js
- [X] T008 [US1] Extend `computeLeaderboard` in packages/backend/src/leaderboard.js: compute `lastRoundScore` (highest-numbered round), add `isFinal` (status === closed), and when final rank by `total → bestRound → lastRound` with `tied` only when all three equal — makes T005–T007 pass

## Phase 4: User Story 2 — Mid-game ties stay cosmetic (Priority: P2)

**Goal**: Active sessions keep cosmetic joint ranks; the last-round rule is not applied.
**Independent test**: An active session with two tied teams returns `isFinal: false` and shared ranks.

- [X] T009 [P] [US2] Write test: active (not closed) session with two teams tied on total → `isFinal: false`, teams share a rank, last-round rule NOT applied (existing behavior preserved) in packages/backend/__tests__/leaderboard.test.js

## Phase 5: User Story 3 — The result explains itself (Priority: P3)

**Goal**: The UI communicates "Final results" and marks joint wins clearly.
**Independent test**: Viewing a closed session shows a final-results state; joint winners are labeled tied.

- [X] T010 [P] [US3] Add `closeSession(id)` helper (PATCH status closed) in packages/frontend/src/api.js
- [X] T011 [US3] Add a "Close session" control (confirm + call `closeSession`) in packages/frontend/src/pages/ManageSession.js
- [X] T012 [US3] Show a "Final results" header when `isFinal` and keep the TIE chip for joint winners in packages/frontend/src/pages/Leaderboard.js
- [X] T013 [P] [US3] Add a Vitest test for the Leaderboard "Final results" state (mock `isFinal: true`) in packages/frontend/src/pages/__tests__/Leaderboard.test.js

## Phase 6: Polish & Cross-Cutting

- [X] T014 Run full suites green (`npm run test:backend` + `npm run test:frontend`) and validate quickstart Scenarios A–D in specs/001-final-tiebreak/quickstart.md
- [X] T015 [P] Update the implementation-status table in docs/functional-requirements.md (feature 7 close + final tie-break → Done)

## Dependencies & Order

- **Setup (T001)** → **Foundational (T002–T004)** → **US1 (T005–T008)** → US2 (T009) → US3 (T010–T013) → Polish (T014–T015).
- US1 depends on Foundational (needs a closable session). US2 is independent of US1 (asserts unchanged active behavior) but reads the same code. US3 (frontend) depends on US1's `isFinal`/ranking.
- **MVP = Phase 2 + Phase 3 (US1)**: the backend final tie-break is the core value; US2/US3 add safety and UX.

## Parallel Execution Examples

- T002 and T005/T006/T007 are test-authoring tasks in different concerns and can be drafted in parallel `[P]` (distinct files/blocks), but each implementation task (T004, T008) must follow its tests (RED→GREEN).
- T010 and T013 (frontend api + test) are `[P]`; T011/T012 edit different pages and can proceed in parallel after T010.

## Format Validation

All tasks use `- [X] Txxx [P?] [US?] description + file path`; setup/foundational/polish carry no story label; US phases are labeled `[US1]`/`[US2]`/`[US3]`.
