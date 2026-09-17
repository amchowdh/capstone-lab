# Capstone Plan — "Trivia Night"

## 1. Purpose

Demonstrate all 7 AI-driven development techniques from `session1-lab` through `session7-lab` (see [lab-ai-concepts-reference.md](lab-ai-concepts-reference.md)) end-to-end, applied to one small, new app. The app itself ("Trivia Night") is intentionally minimal — it exists to give each technique a believable, small feature to attach to. **Do not over-build the app.** Prioritize demonstrating the workflow/technique over feature completeness.

This document is the implementation plan. Implementation happens in a separate session — this doc should contain everything needed to execute without re-deriving context from the other lab repos.

## 2. Decisions already made (do not re-litigate)

| Decision | Answer |
|---|---|
| App domain | Trivia Night — hosts run live trivia sessions, teams join and get scored, live leaderboard with tie-break logic |
| Repo | This repo: `amchowdh/capstone-lab` (real GitHub remote, currently empty — confirmed via `git remote -v`) |
| MCP target | The GitHub MCP server should point at this same repo (`amchowdh/capstone-lab`) — it's real, so issue search/create and PR creation in step 4 are real operations, not simulated |
| SpecKit | Install and run the **real** `specify-cli` via `uv` (not hand-authored artifacts) |
| Deliverable format | No `.github/steps/*.md` + `.github/workflows/*.yml` scaffolding like the source labs. Instead, author a single `CAPSTONE-GUIDE.md` at repo root, written progressively as each step is actually executed (narrative + what was run + what was produced) |
| Infra scope | Explicitly skip Terraform/AWS/OIDC (session7's IaC piece). Only borrow session7's *prompt-file-driven CI generation* and *PR-description generation* techniques |
| Stack | Node.js/Express backend + React frontend (MUI), single stack. (No polyglot microservice — session4's real technique is MCP tool orchestration, not language diversity, so there's no need for a second language runtime.) |
| Monorepo layout | npm workspaces, matching the other labs: `packages/backend`, `packages/frontend` |
| Testing stack | Jest + Supertest (backend), Jest + React Testing Library (frontend unit), Playwright (E2E) — needed to support step 2 (testing guidelines) and step 5 (TDD loop) |

## 3. App concept: Trivia Night

Small enough to bootstrap in one Agent Mode prompt, with one genuinely ambiguous business rule (tie-breaking) that justifies the SpecKit clarify step.

### Roles
- **Host**: authenticated (simple JWT auth), creates sessions, defines rounds, enters scores, closes sessions.
- **Team**: no account — joins a session via a short join code, views the live leaderboard.

### Core entities
- `Session`: id, name, date, joinCode, status (`pending` | `active` | `closed`), hostId
- `Team`: id, sessionId, name, joinedAt
- `Round`: id, sessionId, roundNumber, category, maxPoints
- `Score`: id, roundId, teamId, points
- Leaderboard = computed aggregate of `Score` per team, with tie-break logic (the interesting piece — rules to be defined during the SpecKit step, not pre-decided here, since ambiguity is the point)

### Minimal feature set (keep small — do not expand beyond this list without reason)
1. Host signup/login (JWT)
2. Host creates a session → system generates a join code
3. Team joins a session with the join code + team name (no login)
4. Host adds rounds (category + max points) to a session
5. Host enters/edits a team's score for a round
6. Live leaderboard view (ranked, with tie-break applied)
7. Host closes a session → final results view

That's the entire app. No user profile management, no persistence beyond a simple DB (SQLite/in-memory is fine), no multi-host collaboration, no styling beyond basic MUI components.

## 4. Feature-to-technique mapping (the 7 steps)

Each step below produces both (a) a slice of the app and (b) an entry in `CAPSTONE-GUIDE.md` documenting the technique as it was actually used (prompts run, artifacts produced, what to watch for).

### Step 1 — Agent Mode delegation (session1 technique)
**Goal:** bootstrap the skeleton using a single natural-language delegation, then a follow-up iteration.
- Set up empty npm-workspaces monorepo shell (`package.json`, `packages/backend`, `packages/frontend`) — this scaffolding itself can be done by hand or by Copilot, either is fine, it's not the technique being demonstrated.
- In Agent Mode (capable model, e.g. Claude Sonnet), issue one natural-language prompt like: *"Bootstrap an Express + React trivia night app: backend with Session/Team/Round/Score in-memory models and CRUD routes, React frontend with a page to create a session and a page to join one."*
- Follow up with a second delegated request that requires the agent to touch both frontend and backend and self-correct (e.g., *"Add the ability for a host to delete a round, including confirming it recalculates the leaderboard"*) — mirrors lab 1's delete-feature step.
- **Acceptance:** app boots locally, host can create a session, a team can join via code. No auth yet (added in step 2/backend hardening as needed).

### Step 2 — Copilot instructions as context anchor (session2 technique)
**Goal:** create the 4 guideline docs, wire them into `.github/copilot-instructions.md`, then build a feature "with context."
- Create `docs/functional-requirements.md`, `docs/ui-guidelines.md` (MUI-based), `docs/testing-guidelines.md` (Jest/Supertest/RTL/Playwright conventions), `docs/coding-guidelines.md` — via Agent Mode, one at a time, updating `.github/copilot-instructions.md` after each to reference it (exactly like `2-1` through `2-4`).
- Then run the "build with context" step: ask Copilot to read `copilot-instructions.md`, propose an implementation plan for **Round management + score entry** (feature 4/5 from the feature list), review the plan, then implement.
- Follow with the "validate tests" step: review the AI-generated tests for this feature specifically for false positives / phantom assertions, using the prompt pattern *"can I break this function and still have the test pass?"*
- **Acceptance:** round + score CRUD works with a real test suite that was actively reviewed/hardened, not just accepted.

### Step 3 — Artifact-driven specification (session3 technique)
**Goal:** feed raw artifacts and an image as context, generate PRD → phased epics/stories → diagrams → implement the leaderboard screen from a sketch.
- Author `docs/artifacts/trivia-night-planning-notes.md` — a fabricated but realistic planning-conversation transcript (can be plain markdown standing in for the `.vtt`/Slack-export style used in session3) describing what a live leaderboard screen and tie-break behavior should roughly do.
- Produce (or hand-draw/quickly mock with a simple wireframe image tool) `docs/artifacts/leaderboard-ui-sketch.png` — a rough wireframe of the live leaderboard screen (team ranks, scores, tie indicator). This needs to actually exist as an image file for the image-context step to be genuine.
- In Agent Mode: `#file` reference the planning notes → generate `docs/prd-trivia-night.md`.
- Generate epics/stories in **phased passes** (titles only → review → acceptance criteria → review → technical requirements), per the `3-2` pattern.
- Generate a Mermaid system/sequence diagram for the score-entry → leaderboard-update flow in `docs/architecture.md`.
- Attach `leaderboard-ui-sketch.png` via "Add Context" and have Copilot implement the live leaderboard screen to match it.
- **Acceptance:** leaderboard screen exists and visually matches the sketch; PRD/epics/diagram docs exist under `docs/`.

### Step 4 — MCP tool orchestration (session4 technique)
**Goal:** wire up the GitHub MCP server against this real repo, then use Agent Mode + MCP to triage and ship a real issue via a real PR.
- Configure `.vscode/mcp.json` registering the GitHub MCP server; authenticate.
- Seed 2-3 real GitHub issues on `amchowdh/capstone-lab` (e.g. a bug — "score double-counts if a round is re-scored" — and an enhancement — "support a lightning round worth double points").
- In Agent Mode with MCP tools available: "list open issues" → "summarize/prioritize" → "implement the top one" (with `#codebase` reference) → checkout branch → commit → open a real PR.
- Validate the AI-generated code, then close the issue via MCP (agent posts a closing comment).
- **Acceptance:** a real issue was resolved via a real PR on the repo, entirely orchestrated through MCP + Agent Mode conversation (no manual `gh` CLI or GitHub UI edits by the human).

### Step 5 — Agentic workflow infra: agents, prompts, memory (session5 technique)
**Goal:** bootstrap the persistent agentic infrastructure, then use it to build the tie-break scoring logic via TDD.
- Bootstrap: `.github/copilot-instructions.md` update with workflow patterns (Red-Green-Refactor, lint/test scope rules); `.github/memory/` (`instructions.md`, `session-notes.md`, `patterns-discovered.md`, `scratch/working-notes.md`); custom agents `.github/agents/tdd-developer.agent.md`, `.github/agents/code-reviewer.agent.md`, `.github/agents/test-engineer.agent.md` (scope-bounded, mirroring session5's descriptions); prompt files `.github/prompts/execute-step.prompt.md`, `validate-step.prompt.md`, `commit-and-push.prompt.md`, `create-ui-tests.prompt.md`, `run-ui-tests.prompt.md`.
- Use `/execute-step` to drive the **tie-break ranking calculation** feature (backend logic: given equal total scores, rank teams by a defined tie-break rule) through RED (write failing tests) → GREEN (implement) → REFACTOR, with the `tdd-developer` agent.
- Use `/execute-step` again for lint/compile cleanup with the `code-reviewer` agent (scope: lint only, does not touch feature logic).
- Use `/create-ui-tests` + `/run-ui-tests` (→ `test-engineer` agent) to add a Playwright E2E test for "leaderboard shows correct order when teams tie."
- **Acceptance:** tie-break logic is implemented and tested end-to-end (unit + E2E), and `.github/memory/patterns-discovered.md` has at least one real entry captured during the loop.

### Step 6 — Spec-Driven Development with SpecKit (session6 technique)
**Goal:** run the full SpecKit pipeline on the feature with genuine ambiguity: **team ranking & tie-break rules**. (Note: step 5 already built *a* tie-break calc quickly via TDD — step 6 should specify a related but distinct, more nuanced rule set, e.g. **cross-round tie-breaking when multiple ties exist across categories**, or reuse/refine the same feature through the formal spec pipeline if step 5's version was intentionally left simple. Decide which at implementation time; either is fine as long as SpecKit's clarify step has real ambiguity to resolve.)
- Install `specify-cli` via `uv tool install specify-cli`; run `specify init --here --force --integration copilot --extension git`.
- `/speckit-constitution` — derive principles from `docs/coding-guidelines.md`, `docs/testing-guidelines.md`, `docs/ui-guidelines.md`.
- `/speckit-specify` — write a user story **with an explicit Testing section** for the ranking/tie-break feature; creates numbered branch + `specs/00N-*/spec.md`.
- `/speckit-clarify` — interactive session; expect real questions like "if two teams are fully tied after all rounds, do we split rank, use a coin-flip flag, or compare performance in a specific category?" Answer them and let SpecKit append `## Clarifications`.
- `/speckit-plan`, then `/speckit-tasks`.
- `/speckit-analyze` (read-only gap check) → `/speckit-implement` → `/speckit-converge` in a fresh chat.
- **Acceptance:** `.specify/memory/constitution.md` and `specs/00N-*/{spec,plan,tasks}.md` exist and are coherent; convergence pass reports no unresolved gaps (or gaps were resolved in a follow-up implement pass).

### Step 7 — Lite golden path: prompt-driven CI + PR description (session7 technique, infra-light)
**Goal:** borrow only the prompt-file-driven generation pattern from session7 — no Terraform/AWS/OIDC.
- Create `context/ci-requirements.md` (Node version, Jest/Playwright, coverage threshold — no Terraform section).
- Create `.github/prompts/ci-pipeline.prompt.md` modeled on session7's, but scoped to lint + unit/integration test + coverage gate + Playwright E2E job only (no terraform-plan/apply/build-and-push-to-ECR jobs).
- Run `/ci-pipeline` to generate `.github/workflows/ci.yml`.
- Create `.github/prompts/generate-description.prompt.md` modeled on session7's; run `/generate-description` on the SpecKit feature branch from step 6 to produce a PR description; open the real PR on `amchowdh/capstone-lab`, self-review, merge.
- **Acceptance:** CI workflow runs lint+test on push/PR with a coverage gate; the step 6 feature is merged via a PR with an AI-generated description.

## 5. Repository structure (target, after all 7 steps)

```
capstone-lab/
  README.md
  CAPSTONE-GUIDE.md              # authored progressively during implementation
  docs/
    capstone-plan.md             # this file
    lab-ai-concepts-reference.md
    functional-requirements.md
    ui-guidelines.md
    testing-guidelines.md
    coding-guidelines.md
    prd-trivia-night.md
    architecture.md
    ci-pipeline.md
    artifacts/
      trivia-night-planning-notes.md
      leaderboard-ui-sketch.png
  context/
    ci-requirements.md
  .vscode/
    mcp.json
  .github/
    copilot-instructions.md
    agents/
      tdd-developer.agent.md
      code-reviewer.agent.md
      test-engineer.agent.md
    prompts/
      execute-step.prompt.md
      validate-step.prompt.md
      commit-and-push.prompt.md
      create-ui-tests.prompt.md
      run-ui-tests.prompt.md
      ci-pipeline.prompt.md
      generate-description.prompt.md
    memory/
      instructions.md
      session-notes.md
      patterns-discovered.md
      scratch/working-notes.md
    workflows/
      ci.yml
  .specify/                      # created by `specify init`
    memory/constitution.md
  specs/
    00N-team-ranking-tie-break/
      spec.md
      plan.md
      tasks.md
  packages/
    backend/
      src/
      __tests__/
    frontend/
      src/
      tests/                    # Playwright E2E
```

## 6. Prerequisites to verify at the start of the implementation session
- Node.js + npm available.
- `uv` available (for `uv tool install specify-cli`) — install if missing.
- GitHub MCP server reachable/authenticatable from VS Code for `amchowdh/capstone-lab`.
- `gh` CLI or MCP-based GitHub access for creating real issues/PRs on `amchowdh/capstone-lab`.
- Decide before step 3: whether the UI sketch image is hand-mocked (e.g. quick wireframe generated with a small script) or manually created — it must be a real image file, not a text description, for the technique to be genuine.

## 7. Explicit non-goals (keep scope small)
- No Terraform/AWS/OIDC/ECS — session7's IaC content is intentionally excluded.
- No polyglot microservice — single Node/React stack throughout.
- No user profile/settings, no multi-tenant hosting, no production deployment.
- Don't gold-plate the Trivia Night feature set beyond section 3's 7 features — additional depth should come from *how* a feature was built (which technique), not from adding more features.
