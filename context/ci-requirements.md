# CI Requirements — Trivia Night

Context file that drives `/ci-pipeline` (prompt-file-generated CI). Deliberately
**infra-light**: no Terraform/AWS/Docker (out of scope per the capstone plan).

## Runtime
- Node.js **22**, npm workspaces (`packages/backend`, `packages/frontend`).
- Install with `npm ci` (lockfile committed).

## Triggers
- `push` to `main`
- `pull_request` targeting `main`

## Jobs (all must pass — required checks)
1. **lint** — `npm run lint` (ESLint flat config, 0 errors).
2. **test** —
   - Backend: `npm run test:backend -- --coverage` (Jest + Supertest). A
     **coverage gate** is enforced by `coverageThreshold` in the backend Jest
     config (statements/functions/lines ≥ 80%, branches ≥ 75%).
   - Frontend: `npm run test:frontend` (Vitest + RTL).
   - Append a coverage summary to the GitHub step summary.

## Out of scope (do NOT generate)
- No `terraform-plan` / `terraform-apply` / `security-scan` (checkov) jobs.
- No `build-and-push` / Docker / ECR jobs.
- No AWS OIDC / secrets.

## Output
- A single workflow at `.github/workflows/ci.yml` (no reusable/caller split needed
  for this small app).
