---
agent: test-engineer
description: Run the Playwright E2E suite and triage failures.
tools: ['read', 'execute']
---
Switch to the **test-engineer** workflow and run the Playwright E2E suite:

1. Ensure both servers are running (`npm start` → backend :3030, Vite :3000), or
   rely on the Playwright config's `webServer`.
2. Run `npm run test:e2e --workspace=frontend` (or `npx playwright test`).
3. Report pass/fail per spec. For any failure, triage whether it's the app, the
   test, or timing — and recommend the owning agent (`tdd-developer` for app
   logic, `test-engineer` for the test itself).

Do not change app source here.
