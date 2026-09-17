# Agent Foundation Instructions

Rules every agent applies on each loop (persistent working memory).

## Development principles
- **Red-Green-Refactor TDD**: write the failing test, make it pass minimally,
  then refactor. Never implement a feature before its test.
- **Incremental changes**: small, testable steps; run tests after each.
- **Systematic debugging**: use test failures as the guide, not guesswork.
- **Validate before commit**: all tests green, no lint errors.

## Scope boundaries (agents stay in their lane)
- `tdd-developer` — feature code + unit/integration tests only. Does NOT fix lint
  or write Playwright tests.
- `code-reviewer` — lint/compile/quality only. Does NOT change behavior or tests.
- `test-engineer` — Playwright UI/E2E only. Does NOT change app logic.

## Git workflow
- Conventional commits (`feat:`, `fix:`, `test:`, `refactor:`, `chore:`, `docs:`).
- Feature branches `feature/<slug>` (or `fix/<slug>`); merge to `main`; push only
  with approval. Never commit `.github/memory/scratch/`.

## Test commands
- `npm run test:backend` · `npm run test:frontend` · (E2E) `npx playwright test`.
