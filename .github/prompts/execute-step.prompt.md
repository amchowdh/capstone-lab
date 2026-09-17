---
agent: tdd-developer
description: Drive a feature through a full Red-Green-Refactor TDD cycle.
tools: ['search', 'read', 'edit', 'execute', 'todo']
---
Switch to the **tdd-developer** workflow and implement the following using strict
Red-Green-Refactor:

Task: ${input:task:Describe the feature/behavior to build (include the rule and how to test it)}

Steps:
1. **RED** — write the failing test(s) that capture the task's behavior. Run the
   relevant suite and show they fail for the right reason; explain each.
2. **GREEN** — implement the minimal code to make them pass. Re-run.
3. **REFACTOR** — tidy up while keeping the suite green.

Constraints:
- Test first, always. Do not fix lint issues or write Playwright tests here.
- Follow the docs guidelines and keep changes small.
- Note any reusable insight in `.github/memory/patterns-discovered.md` and
  in-progress thinking in `.github/memory/scratch/working-notes.md`.

Finish by reporting the RED→GREEN→REFACTOR result and the passing test counts.
