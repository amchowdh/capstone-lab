# GitHub Copilot Instructions — Trivia Night

> Located at `.github/copilot-instructions.md`. GitHub Copilot reads this file
> automatically in every chat, so it is the **context anchor** that keeps
> generated code aligned with the project's documented standards.

## Project
Trivia Night is a small app where a **host** runs a live trivia session and
**teams** join with a short code and follow a live leaderboard. Stack: Node.js/
Express backend + React (MUI) frontend built with Vite, npm workspaces
(`packages/backend`, `packages/frontend`), in-memory store, Jest/Supertest
(backend) + Vitest/RTL (frontend) + Playwright (E2E) tests.

The app is intentionally minimal — it demonstrates AI-driven development
techniques. Do not add features beyond the functional requirements.

## Always follow these docs
When generating or changing code, read and conform to:
- [Functional Requirements](../docs/functional-requirements.md) — what the app
  does; the fixed feature set and API conventions.
- [UI Guidelines](../docs/ui-guidelines.md) — MUI design system, screens,
  interaction & accessibility patterns.
- [Testing Guidelines](../docs/testing-guidelines.md) — test stack, conventions,
  and the required review of AI-generated tests.
- [Coding Guidelines](../docs/coding-guidelines.md) — style, structure, error
  handling, and git practices.

## Working agreements
- Keep the app small; prefer the simplest solution that meets the requirement.
- Backend routers stay thin (validate + delegate to `store.js`); the store owns
  data rules.
- Frontend components call `api.js`, never axios directly; style with MUI + `sx`.
- Validate at boundaries; return `{ error }` with `400`/`404`/`409` as
  appropriate.
- Write behavior-focused tests and review them ("can I break the function and
  still have the test pass?").
