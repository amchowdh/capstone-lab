---
description: Generate a structured PR description from the branch diff + project context.
tools: ['read', 'execute', 'edit']
---
Author a GitHub Pull Request description for the current feature branch.

1. Read [docs/functional-requirements.md](../../docs/functional-requirements.md)
   and, if present, the feature's spec under `specs/` for acceptance context.
2. Examine the diff between `main` and the current branch
   (`git diff --stat main...HEAD` and key file diffs).
3. Write a professional, concise PR description with these sections:

   ## Summary
   ## What Changed
   ## Why This Matters
   ## How to Adopt / Verify
   (a short quickstart: install, run tests, exercise the feature)
   ## Evidence
   - [ ] backend tests passing (count)
   - [ ] frontend tests passing (count)
   - [ ] lint clean
   ## Checklist
   - [ ] Follows coding & testing guidelines
   - [ ] No secrets or hardcoded config
   - [ ] Spec/constitution honored (if a SpecKit feature)

Save the result to `/tmp/pr-body.md` and print it. Do not modify app source.
