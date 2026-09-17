# Implementation Plan: Final Tie-Break for Session Winners

**Branch**: `001-final-tiebreak` | **Date**: 2026-09-17 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-final-tiebreak/spec.md`

## Summary

When a session is **closed**, the leaderboard must resolve teams that are tied on
total points and best-single-round score into a decisive final result. Per the
clarifications: break such ties by **highest score in the last (highest-numbered)
round**; if still tied, declare an **explicit joint win**; use **existing
round/score data only** (no designated special round).

Technical approach: extend `computeLeaderboard` so that, for a closed session, the
composite rank key gains a third criterion (last-round score) after
total → best-round; teams remain `tied` only when all three are equal (joint win).
Add a minimal "close session" capability (status → `closed`) and surface a
`final` flag so the UI can label results as final. Active sessions keep today's
behavior unchanged.

## Technical Context

**Language/Version**: Node.js 22 (CommonJS backend), ES modules frontend
**Primary Dependencies**: Express, React + MUI (built with Vite), axios (`api.js`)
**Storage**: in-memory store (`packages/backend/src/store.js`) — no DB
**Testing**: Jest + Supertest (backend); Vitest + React Testing Library (frontend); Playwright optional
**Target Platform**: local Node server + browser SPA
**Project Type**: web application (npm workspaces: `packages/backend`, `packages/frontend`)
**Performance Goals**: N/A (tiny local app); leaderboard computed on demand
**Constraints**: keep the app small (Constitution I); deterministic ranking
**Scale/Scope**: a handful of teams/rounds per session; single feature slice

## Constitution Check

*GATE: must pass before Phase 0. Re-checked after Phase 1.*

| Principle | Assessment |
|---|---|
| I. Minimal Scope | ✅ Reuses existing data; only adds a third tie-break criterion + a thin close-session path. Designated-round mechanic explicitly out of scope. |
| II. Test-First (RGR) | ✅ Plan drives Jest tests first for last-round tiebreak, joint-win fallback, active-vs-closed behavior, and edge cases. |
| III. Thin Routers, Store Owns Rules | ✅ Ranking logic stays in `leaderboard.js`; status change is a small `store` mutation; routes only validate + delegate. |
| IV. Frontend Consistency (MUI + api.js) | ✅ Leaderboard "Final" state + close control use MUI and go through `api.js`. |
| V. Validate at Boundaries | ✅ Close route validates status transition and returns `{ error }` with proper codes. |

**Result**: PASS — no violations; Complexity Tracking not required.

## Project Structure

### Documentation (this feature)

```text
specs/001-final-tiebreak/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── leaderboard-api.md
└── tasks.md             # /speckit-tasks output (not created here)
```

### Source Code (repository root)

```text
packages/backend/
├── src/
│   ├── store.js                 # add setSessionStatus / updateSession
│   ├── leaderboard.js           # last-round tie-break when session is closed
│   └── routes/
│       └── sessions.js          # close-session route + leaderboard already here
└── __tests__/
    └── leaderboard.test.js      # add final tie-break + fallback + edge tests

packages/frontend/
└── src/
    ├── api.js                   # closeSession() helper
    └── pages/
        ├── Leaderboard.js       # "Final results" labeling when closed
        └── ManageSession.js     # "Close session" control
```

**Structure Decision**: existing npm-workspaces web app; this feature touches the
leaderboard computation, a thin session-status path, and the leaderboard/manage
screens. No new packages or layers.

## Complexity Tracking

No constitution violations — section intentionally empty.
