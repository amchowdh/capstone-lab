---
description: Stage, commit (conventional message), and push the current work to its branch.
tools: ['execute']
---
Commit and push the current work:

1. Run the test suites first; only proceed if green.
2. `git add -A`.
3. Commit with a **conventional-commit** message (`feat:`, `fix:`, `test:`,
   `refactor:`, `chore:`, `docs:`) summarizing the change; include a short body
   explaining the *why*.
4. Push to the current feature branch: `git push origin $(git branch --show-current)`.

Do not push to `main` directly. Report the commit hash and branch.
