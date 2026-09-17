# Lab AI-Concepts Reference

Condensed findings from reviewing `.github/steps/*.md`, `.github/workflows/*.yml`, `.github/copilot-instructions.md`, `.github/agents/*`, and `.github/prompts/*` across `session1-lab` through `session7-lab` in this workspace. This is reference material only — it captures the **AI-driven technique** each lab teaches, distinct from the underlying app domain (all labs 1/2/3/5/6/7 build variations of a TODO app; session4 builds a "Slalom Capabilities" app). The capstone should demonstrate the techniques below, not clone the TODO app.

## Session 1 — Agent Mode delegation
- Steps: `1-1-preparing.md` (select a capable model, e.g. Claude Sonnet, ask Copilot in plain English to change the app title), `1-2-delete.md` (ask for a multi-file feature — delete functionality — across backend + frontend in one natural-language request), `1-x-review.md` (recap).
- No supporting artifacts (no copilot-instructions.md, no agents/prompts) — pure default Agent Mode chat.
- **Core technique:** delegate multi-step, multi-file tasks to Agent Mode in natural language; the agent inspects the codebase, makes coordinated changes, and self-corrects when told about bugs.

## Session 2 — `.github/copilot-instructions.md` as context anchor
- Steps: create `docs/functional-requirements.md` → create `docs/ui-guidelines.md` → create `docs/testing-guidelines.md` → create `docs/coding-guidelines.md`, updating `.github/copilot-instructions.md` after each to reference the new doc. Then `2-5-build-with-context.md`: ask Copilot to read `copilot-instructions.md`, propose an implementation plan, review it, then implement. Then `2-6-validate-tests.md`: review AI-generated tests for false positives/phantom assertions/mock hallucinations, prompt patterns like "can I break the function and make this test fail?".
- **Core technique:** a single `.github/copilot-instructions.md` file that references all project docs is read automatically by Copilot in every chat, keeping generated code aligned to documented standards. Also: critically reviewing AI-generated tests rather than trusting them blindly.

## Session 3 — Artifact-driven specification
- Steps: `3-1` use `#file` references to raw artifacts (a meeting transcript `.vtt`, a Slack export `.txt`) → have Copilot synthesize `docs/prd-todo.md` from a `prd-template.md`. `3-2` generate epics/stories in **phased passes** (titles only → review → acceptance criteria → review → technical requirements) rather than all at once. `3-3` generate Mermaid architecture/sequence diagrams, validate/fix invalid Mermaid syntax with Copilot. `3-4` attach a UI sketch **image** via "Add Context" and have Copilot implement a feature (form + model + API) to match the sketch's exact layout/colors.
- **Core technique:** feed Copilot raw project artifacts (transcripts, chat exports, template files, and images) as first-class context via `#file` references and image attachments, and use phased/reviewable generation instead of one big prompt.

## Session 4 — MCP (Model Context Protocol) tool orchestration
- Steps: `1-step.md` configure `.vscode/mcp.json` registering the **GitHub MCP server**, authenticate via VS Code's "Start" button. `2-step.md` use Agent Mode with the GitHub MCP tools available — ask Copilot to "search for repos managing consulting capabilities," "compare to our project," "create issues for these ideas" — MCP tools are invoked automatically with permission dialogs. `3-step.md` orchestrate a full workflow: "list open issues" → "summarize top 3" → "implement the first one" (with `#codebase` reference) → checkout branch → commit → open PR, all via MCP + Agent Mode. `4-step.md` validate AI-generated code, then close the issue via MCP.
- **Core technique:** MCP servers give Copilot Agent Mode real external tool access (GitHub issue search/create/comment, PR creation) that it invokes automatically mid-conversation — no manual API calls, just natural language requests with permission prompts.

## Session 5 — Agentic workflows: custom agents, prompt files, tiered memory
- `5-0-setup-workflow.md`: use a pre-provided `copilot-customization` agent to bootstrap: (a) `.github/copilot-instructions.md` with workflow patterns (Red-Green-Refactor TDD, linting, integration), (b) a tiered `.github/memory/` system — `instructions.md` (persistent foundation), `session-notes.md` (historical), `patterns-discovered.md` (accumulated learnings), `scratch/working-notes.md` (ephemeral, not committed), (c) custom scope-bounded agents: `tdd-developer` (tests+implementation only), `code-reviewer` (lint only), `test-engineer` (UI/E2E tests), (d) prompt files as slash commands: `/execute-step`, `/validate-step`, `/commit-and-push`, `/create-ui-tests`, `/run-ui-tests` — each auto-switches to the right agent.
- `5-1` through `5-3`: run `/execute-step N` repeatedly — it auto-switches to `tdd-developer` for RED→GREEN→REFACTOR feature work, to `code-reviewer` for lint/compile cleanup, and uses `/create-ui-tests` + `/run-ui-tests` (→ `test-engineer`) for Playwright E2E coverage. Each agent stays inside its scope boundary (e.g. tdd-developer does NOT fix lint issues).
- **Core technique:** build persistent agentic infrastructure once (instructions + memory + scope-bounded agents + prompt-file slash commands), then drive iterative, autonomous, self-documenting development loops through it.

## Session 6 — Spec-Driven Development with GitHub SpecKit
- `6-1`: install `specify-cli` via `uv`, run `specify init --here --force --integration copilot --extension git` — creates `.specify/` templates + `speckit-*` slash commands.
- `6-2`: `/speckit-constitution` — derives `.specify/memory/constitution.md` (governing principles) from existing docs.
- `6-3`: `/speckit-specify` with a user story that includes an explicit **Testing** section (required, or no test tasks get generated) — creates a new numbered feature branch + `specs/00N-*/spec.md` + a `checklists/requirements.md`.
- `6-4`: `/speckit-clarify` — an **interactive** chat (stay in one session) where SpecKit asks 3-5 targeted clarifying questions about ambiguous spec areas; answers get appended as a `## Clarifications` section in `spec.md`.
- `6-5`: `/speckit-plan` — generates `plan.md` (technical HOW, separate from spec's WHAT) plus `research.md`, `data-model.md`, `quickstart.md`, `contracts/`.
- `6-6`: `/speckit-tasks` — breaks the plan into phased, dependency-ordered tasks (Setup → Foundational → Per-Story → Polish), marking parallelizable and test tasks explicitly.
- `6-7`: `/speckit-analyze` (read-only cross-check of spec/plan/tasks for gaps/conflicts) → `/speckit-implement` (executes tasks.md phase by phase, marks `[X]` complete, no auto-commit) → `/speckit-converge` in a **fresh chat** (validates the resulting code against the artifacts, appends any gaps as new tasks).
- **Core technique:** a fully versioned, on-disk spec pipeline (constitution → spec → clarify → plan → tasks → analyze → implement → converge) that turns an ambiguous user story into a high-confidence implementation, auditable and re-runnable at every stage.

## Session 7 — Prompt-driven CI/CD + IaC + PR generation ("golden path")
- `pe-1-iac-scaffold.md`: populate `context/iac-requirements.md`, run `/iac-scaffold` (a `.github/prompts/iac-scaffold.prompt.md` prompt file) to generate Terraform calling a pre-built ECS/ALB/ECR module; validate with tflint/checkov/plan.
- `pe-2-ci-pipeline.md`: populate `context/ci-requirements.md`, run `/ci-pipeline` to generate a **reusable** `golden-path-ci.yml` (`on: workflow_call`, jobs: lint/test/security-scan/terraform-plan/terraform-apply/build-and-push) plus a thin caller `todo-service-ci.yml` (`on: push`, single `uses:` line). Run `/ci-pipeline-docs` to generate `docs/ci-pipeline.md` explaining each job.
- `pe-3-terraform-apply.md`: switch from mock credentials to real OIDC federation (`aws-actions/configure-aws-credentials` + `id-token: write`, no static secrets).
- `pe-4-open-pr.md`: run `/generate-description` (a prompt file that reads the branch diff + project context) to author a structured PR description ("What Changed / Why" + "How to Adopt"), update the PR via `gh pr edit`, self-review checklist, merge.
- **Core technique:** prompt files (`.github/prompts/*.prompt.md`) are reusable generation recipes for infra/CI/PR content, driven by versioned requirements context files — **we are only borrowing the CI-pipeline-generation and PR-description-generation prompt-file techniques for the capstone; we are explicitly skipping the Terraform/AWS/OIDC infrastructure piece.**

## Summary table

| Lab | Technique | Key artifact(s) |
|---|---|---|
| 1 | Agent Mode delegation | none (pure chat) |
| 2 | Copilot instructions as context anchor | `.github/copilot-instructions.md` + `docs/*-guidelines.md` |
| 3 | Artifact/image-driven specs, phased generation | `#file` transcripts, images, `docs/prd-*.md`, Mermaid diagrams |
| 4 | MCP tool orchestration | `.vscode/mcp.json`, GitHub MCP server |
| 5 | Agentic workflow infra | `.github/agents/*.agent.md`, `.github/prompts/*.prompt.md`, `.github/memory/` |
| 6 | Spec-Driven Development (SpecKit) | `.specify/memory/constitution.md`, `specs/00N-*/{spec,plan,tasks}.md` |
| 7 (lite) | Prompt-driven CI + PR description | `.github/prompts/ci-pipeline.prompt.md`, `.github/prompts/generate-description.prompt.md` |
