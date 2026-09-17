# Testing Guidelines — Trivia Night

## Stack
- **Backend:** Jest + Supertest against the Express app
  ([packages/backend](../packages/backend)).
- **Frontend unit/integration:** Jest + React Testing Library (via
  react-scripts).
- **End-to-end:** Playwright (introduced in Step 5).

## Conventions
- Backend tests live in `packages/backend/__tests__/*.test.js`; reset the
  in-memory store in `beforeEach(() => store.reset())` so tests are isolated.
- Frontend tests live next to code in `__tests__/` folders.
- Name tests by behavior: `it('rejects a duplicate team name within a session')`.
- Follow **Arrange–Act–Assert**. One clear behavior per test.
- Test **behavior, not implementation** — assert on API responses and rendered
  output, not internal function calls.

## What to cover
- Happy path for each endpoint/feature.
- Validation failures (missing/invalid input → `400`).
- Not-found and conflict paths (`404` / `409`).
- Business rules (e.g., a score may not exceed the round `maxPoints`;
  re-entering a score edits rather than duplicates it).

## Reviewing AI-generated tests (required)
AI-written tests can pass for the wrong reasons. Before trusting a test, apply:
- **"Can I break the function and still have the test pass?"** Temporarily
  introduce a bug in the implementation; a good test must fail. If it still
  passes, the test is a false positive — fix the assertion.
- **No phantom assertions:** every test must contain a real `expect` that
  depends on the code under test. Reject tests that only assert on constants or
  mock return values.
- **No mock hallucinations:** don't mock the thing you're trying to verify. Test
  the real store/route rather than a mock that always returns the expected shape.
- **Meaningful failure messages:** a failing test should make the cause obvious.

## Commands
- `npm run test:backend` — backend Jest suite.
- `npm run test:frontend` — frontend Jest suite (`--watchAll=false`).
- `npm test` — both.
