# Coding Guidelines — Trivia Night

## Language & style
- Node.js + React, JavaScript (CommonJS on the backend, ES modules on the
  frontend via react-scripts).
- 2-space indentation; semicolons; single quotes; lines ideally under 100 chars.
- `camelCase` for variables/functions, `PascalCase` for React components and
  their files, `UPPER_SNAKE_CASE` for constants.

## Structure
- **Backend** (`packages/backend/src`):
  - `store.js` — in-memory data + CRUD helpers (single source of truth).
  - `routes/*.js` — one Express router per resource; thin, validation + store
    calls only.
  - `app.js` — wires middleware + routers; `index.js` — starts the server.
- **Frontend** (`packages/frontend/src`):
  - `pages/*.js` — one component per screen.
  - `api.js` — all HTTP calls (axios); components never call axios directly.

## Quality principles
- **KISS / small surface:** prefer the simplest thing that satisfies the
  functional requirement. Do not add features beyond
  [functional-requirements.md](functional-requirements.md).
- **Single responsibility:** routers validate + delegate; the store owns data
  rules; components render + call `api.js`.
- **Validate at boundaries:** validate request bodies in routes and return
  `400`/`404`/`409` with a clear `{ error }` message. Don't over-validate
  internal calls.
- **DRY, but no premature abstraction:** extract a helper only on the second real
  use.

## Error handling
- Routes return structured errors: `res.status(4xx).json({ error: 'message' })`.
- Frontend surfaces `err.response?.data?.error` in an MUI `Alert`, with a
  friendly fallback.

## Comments
- Comment **why**, not what. One short line where the code can't explain itself.
- No restating the next line; no multi-paragraph doc blocks for trivial code.

## Git practices
- Feature branches per capstone step: `feature/stepN-<slug>`.
- Atomic commits with a clear subject + short body explaining the why.
- Merge to `main` locally; push only with explicit approval.
