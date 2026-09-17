---
agent: test-engineer
description: Author a Playwright E2E test for a critical Trivia Night journey.
tools: ['search', 'read', 'edit', 'execute', 'todo']
---
Switch to the **test-engineer** workflow and create a Playwright E2E test for:

Journey: ${input:journey:Describe the user journey to cover end-to-end}

Requirements:
- Place the spec under `packages/frontend/tests/`.
- Use accessibility-first selectors (`getByRole`/`getByLabel`), then
  `data-testid`; no brittle CSS selectors; use state-based waits.
- Drive real UI (the app talks to the live backend via the Vite proxy).
- Keep the test isolated and repeatable (fresh session/data per run).

Do not modify app features or fix lint here — E2E only. If the app is missing a
`data-testid`/role needed for a stable selector, note it for `tdd-developer`
rather than fixing logic yourself.
