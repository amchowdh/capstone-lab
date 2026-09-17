# Memory System — Trivia Night

Agentic working memory for autonomous development. Two tiers:

| Tier | File | Purpose | Committed? |
|---|---|---|---|
| **Persistent** | [../copilot-instructions.md](../copilot-instructions.md) | Foundational project principles & workflows | yes |
| **Foundation** | [instructions.md](instructions.md) | Workflow rules the agents follow every loop | yes |
| **Historical** | [session-notes.md](session-notes.md) | Summaries of completed sessions | yes |
| **Accumulated** | [patterns-discovered.md](patterns-discovered.md) | Reusable patterns learned over time | yes |
| **Active** | [scratch/working-notes.md](scratch/working-notes.md) | Current-session scratchpad | **no** (git-ignored) |

## How to use it
- **During a loop:** think out loud in `scratch/working-notes.md` — task, approach,
  findings, decisions, blockers, next steps. It's ephemeral.
- **When a reusable insight emerges:** record it in `patterns-discovered.md`
  (name, context, problem, solution, example, related files).
- **At the end of a session:** summarize outcomes into `session-notes.md`.
- **Always:** the agents read the committed files and apply the learnings on the
  next loop — the system improves as you work.
