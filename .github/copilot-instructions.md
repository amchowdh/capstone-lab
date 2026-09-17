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

## Workflow patterns (agentic — Step 5)
1. **TDD (Red-Green-Refactor):** write a failing test → minimal implementation →
   refactor. Never implement a feature before its test.
2. **Code quality:** run lint/build → categorize issues → fix systematically →
   re-validate. Kept separate from feature work.
3. **UI testing:** define critical journeys → author Playwright E2E → run → triage.

## Agent usage (scope-bounded)
- **`tdd-developer`** — feature code + unit/integration tests (Jest/Supertest,
  Vitest/RTL). Does NOT fix lint or write Playwright tests.
- **`code-reviewer`** — lint/compile/quality only. Does NOT change behavior or tests.
- **`test-engineer`** — Playwright UI/E2E only. Does NOT change app logic.

Prompt-file slash commands drive these: `/execute-step`, `/validate-step`,
`/commit-and-push`, `/create-ui-tests`, `/run-ui-tests` (see `.github/prompts/`).

## Memory system
- Persistent: this file + [.github/memory/instructions.md](../.github/memory/instructions.md).
- Working: [.github/memory/](../.github/memory/) — `session-notes.md` (history),
  `patterns-discovered.md` (accumulated), `scratch/working-notes.md` (active,
  not committed). Read the committed memory before acting; record reusable
  insights as you learn them. See [.github/memory/README.md](../.github/memory/README.md).

