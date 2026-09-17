# Trivia Night — Capstone Lab

**Trivia Night** is a small web app where a **host** runs a live trivia session and
**teams** join with a short code and follow a live, ranked leaderboard. It is
intentionally minimal — it exists to demonstrate, end-to-end on one app, the seven
AI-driven development techniques taught across `session1-lab` through `session7-lab`.

> The value is in *how* each feature was built (which AI technique), not in feature
> depth. See **[CAPSTONE-GUIDE.md](CAPSTONE-GUIDE.md)** for the full narrative of
> what was run and produced at each step.

## What the app does
- Host creates a session → gets a **join code**.
- Teams join with the code + a team name (no account).
- Host adds **rounds** (category + max points) and enters/edits **scores**.
- **Live leaderboard**: teams ranked by total points, with tie-breaks
  (best single round; on close, the **last round** decides, else an explicit joint win).
- Host **closes** the session → **Final Results**.

## Stack
- **Backend:** Node.js / Express, in-memory store (`packages/backend`).
- **Frontend:** React + Material UI, built with **Vite** (`packages/frontend`).
- **Tests:** Jest + Supertest (backend), Vitest + React Testing Library (frontend).
- npm workspaces monorepo.

## Run it
```bash
npm install
npm start          # backend on :3030, frontend on :3000 (Vite proxies /api)
npm test           # backend + frontend test suites
npm run lint       # ESLint gate
```

## The 7 techniques (mapped to features)
| Step | Technique | Where |
|---|---|---|
| 1 | Agent Mode delegation | bootstrap create-session + join |
| 2 | `copilot-instructions.md` as context anchor | round management + score entry |
| 3 | Artifact- & image-driven spec | leaderboard from a wireframe sketch |
| 4 | MCP tool orchestration | real GitHub issues → PR → merge |
| 5 | Agentic infra (agents, prompts, memory) | tie-break via TDD `/execute-step` |
| 6 | Spec-Driven Development (SpecKit) | final tie-break (`specs/001-final-tiebreak/`) |
| 7 | Prompt-driven CI + PR description | `.github/workflows/ci.yml`, PR #5 |

## Repository map
- [CAPSTONE-GUIDE.md](CAPSTONE-GUIDE.md) — step-by-step narrative (start here).
- [docs/](docs/) — functional requirements, UI/coding/testing guidelines, PRD,
  architecture, artifacts.
- [.github/](.github/) — copilot-instructions, custom agents, prompt slash-commands,
  tiered memory, CI workflow, SpecKit skills.
- [.specify/](.specify/) & [specs/](specs/) — SpecKit constitution + the versioned
  spec pipeline.
- [packages/](packages/) — the `backend` and `frontend` workspaces.

> Planning docs `docs/capstone-plan.md` and `docs/lab-ai-concepts-reference.md`
> describe the original plan and the per-lab techniques.
