<!--
Sync Impact Report
- Version change: (initial) → 1.0.0
- Ratification: initial adoption of the Trivia Night constitution
- Principles defined: I. Minimal Scope; II. Test-First (NON-NEGOTIABLE);
  III. Thin Routers, Store Owns Data Rules; IV. Frontend Consistency;
  V. Validate at Boundaries
- Added sections: Technology & Structure Constraints; Development Workflow &
  Quality Gates; Governance
- Removed sections: none
- Templates reviewed: plan-template.md, spec-template.md, tasks-template.md
  (Constitution Check aligns with these principles)
- Deferred TODOs: none
-->

# Trivia Night Constitution

## Core Principles

### I. Minimal Scope (No Gold-Plating)
The app MUST stay small. Only the fixed feature set in
`docs/functional-requirements.md` is in scope; new features MUST NOT be added
without an explicit requirement. Prefer the simplest solution that satisfies the
requirement. Depth comes from *how* a feature is built (the technique), never
from adding more features. Rationale: the project exists to demonstrate
AI-driven development techniques on a believable-but-tiny app.

### II. Test-First (NON-NEGOTIABLE)
Every behavior change follows **Red-Green-Refactor**: write a failing test, make
it pass with minimal code, then refactor. Tests MUST be behavior-focused and
actively reviewed — for any critical test, breaking the implementation MUST make
it fail ("can I break the function and still have the test pass?"). Phantom
assertions and mock-hallucinations are rejected. Rationale: AI-generated tests
can pass for the wrong reasons; the review discipline is what makes them trustworthy.

### III. Thin Routers, Store Owns Data Rules
Backend Express routers MUST only validate input and delegate; all data rules and
entity relationships live in `store.js`. Business logic MUST NOT leak into route
handlers. Rationale: a single source of truth for data keeps the small codebase
coherent and testable.

### IV. Frontend Consistency (MUI + api.js)
Frontend components MUST use Material UI (with the `sx` prop for one-off styling)
and MUST call the backend through `api.js` — never `axios` (or `fetch`) directly.
Inputs MUST be labeled and keyboard-accessible; color MUST never be the only
signal. Rationale: one styling system and one HTTP boundary keep the UI
consistent and accessible.

### V. Validate at Boundaries
Request bodies MUST be validated at the route boundary and return a structured
`{ error }` with the correct status: `400` (invalid input), `404` (missing
resource), `409` (conflict). Cross-entity relationships MUST be validated (e.g. a
team may only be scored against a round in its own session). Internal calls are
NOT over-validated. Rationale: validate where untrusted input enters; trust
internal invariants.

## Technology & Structure Constraints

- **Stack**: Node.js/Express backend + React (MUI) frontend built with **Vite**,
  organized as npm workspaces (`packages/backend`, `packages/frontend`).
- **Persistence**: an in-memory store is sufficient; no database is required.
- **Testing**: Jest + Supertest (backend), Vitest + React Testing Library
  (frontend), Playwright (optional E2E for critical journeys).
- **Style**: 2-space indent, semicolons, single quotes, `camelCase` /
  `PascalCase` (components) / `UPPER_SNAKE_CASE` (constants). Comment *why*, not
  *what*.
- No Terraform/AWS/OIDC, no polyglot services, no auth/profile scope beyond the
  documented feature set.

## Development Workflow & Quality Gates

- **Branches**: feature work on `feature/<slug>` (or `fix/<slug>`); merge to
  `main`. Push only with maintainer approval.
- **Commits**: conventional commits (`feat:`, `fix:`, `test:`, `refactor:`,
  `chore:`, `docs:`), atomic, with a short *why* in the body.
- **Quality gate**: all test suites MUST be green and free of lint errors before
  merge.
- **Scope-bounded agents**: `tdd-developer` (features + unit/integration tests),
  `code-reviewer` (lint/quality only), `test-engineer` (Playwright only) stay in
  their lanes.

## Governance

This constitution supersedes ad-hoc practices for Trivia Night. Amendments MUST
be recorded here with a semantic-version bump: **MAJOR** for
backward-incompatible principle changes/removals, **MINOR** for new or materially
expanded principles/sections, **PATCH** for clarifications. Every pull request
MUST verify compliance with these principles; deviations MUST be justified in the
PR description or the change reverted. Runtime development guidance lives in
`.github/copilot-instructions.md` and the `docs/` guidelines, which MUST remain
consistent with this document.

**Version**: 1.0.0 | **Ratified**: 2026-09-17 | **Last Amended**: 2026-09-17
