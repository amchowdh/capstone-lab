---
description: Generate the lint + test CI workflow from the CI requirements context.
tools: ['read', 'edit']
---
Read the requirements from [context/ci-requirements.md](../../context/ci-requirements.md)
and the standards in [.github/copilot-instructions.md](../copilot-instructions.md)
before writing any files.

Create a single GitHub Actions workflow at `.github/workflows/ci.yml` that matches
the requirements **exactly**:

- Triggers: `push` to `main` and `pull_request` to `main`.
- `permissions: { contents: read }`.
- Job **lint**: checkout → setup-node (Node 22, `cache: npm`) → `npm ci` →
  `npm run lint`.
- Job **test**: checkout → setup-node (Node 22, `cache: npm`) → `npm ci` →
  `npm run test:backend -- --coverage --coverageReporters=json-summary --coverageReporters=text-summary`
  → append the backend coverage summary to `$GITHUB_STEP_SUMMARY` →
  `npm run test:frontend`.

Do NOT add terraform, checkov, docker, or AWS jobs — they are explicitly out of
scope. Keep the file minimal and valid. Use `actions/checkout@v4` and
`actions/setup-node@v4`.
