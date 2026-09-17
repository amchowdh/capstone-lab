---
description: Validate the current work — run tests, check the review discipline, and report gaps.
tools: ['search', 'read', 'execute']
---
Validate the most recent change without modifying feature code:

1. Run `npm run test:backend` and `npm run test:frontend`; report pass/fail counts.
2. Apply the test-review discipline from
   [docs/testing-guidelines.md](../../docs/testing-guidelines.md): for the key new
   test, reason about whether breaking the implementation would make it fail
   ("can I break the function and still have the test pass?"). Call out any
   phantom assertions or over-mocking.
3. Summarize: what is verified, what is still uncovered, and any follow-ups.

Do not implement fixes here — just validate and report.
