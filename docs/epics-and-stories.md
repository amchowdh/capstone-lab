# Epics & Stories — Live Leaderboard

> Generated in **phased passes** (the session-3 technique): first titles only,
> then acceptance criteria, then technical requirements — each phase reviewable
> before the next. The finished result of all three phases is below; the phase
> boundaries are called out so the process is visible.

## Epic: Live Leaderboard

Teams can see an accurate, legible, ranked leaderboard that updates as the host
enters scores, with ties clearly marked.

---

### Phase 1 — Story titles (generated first, reviewed before adding detail)
- **S1** — Compute ranked standings from round scores
- **S2** — Mark tied teams with a shared rank
- **S3** — Show rounds-scored progress
- **S4** — Render the leaderboard screen to match the sketch
- **S5** — Handle empty states (no teams / no scores)

---

### Phase 2 — Acceptance criteria (added after titles were approved)

**S1 — Compute ranked standings**
- Given a session with teams and scored rounds, standings list each team with its
  total points (sum across rounds).
- Teams are ordered by descending total points.
- A round with no score for a team contributes 0 for that team.

**S2 — Mark tied teams**
- Given two or more teams with equal totals, they share the same rank number.
- Each tied team is flagged so the UI can show a "TIE" indicator.
- The next distinct total resumes ranking at the correct position (e.g., 1, 2,
  2, 4 — standard competition ranking).

**S3 — Rounds-scored progress**
- The leaderboard reports how many rounds exist and how many have at least one
  score, so the UI can show "Round X of Y scored".

**S4 — Render leaderboard screen**
- Header band in brand blue with title and the rounds-scored indicator.
- Columns RANK · TEAM · POINTS; points large and right-aligned.
- First-place row highlighted with a star marker.
- Tied rows show a "TIE" chip and share a rank.

**S5 — Empty states**
- With zero teams: show "waiting for teams", not a table.
- With teams but zero scores: show a friendly "no scores yet" message (totals may
  render as 0).

---

### Phase 3 — Technical requirements (added after criteria were approved)

**S1/S2/S3 (backend)**
- `packages/backend/src/leaderboard.js` — `computeLeaderboard(sessionId)` returns
  `{ standings, roundsTotal, roundsScored }` where each standing is
  `{ teamId, teamName, totalPoints, rank, tied }`.
- Totals sum `Score.points` per team over the session's rounds; teams with no
  matching score get 0.
- Ranking uses **standard competition ranking** (equal totals → equal rank; gaps
  after ties).
- Expose `GET /api/sessions/:id/leaderboard`.

**S4/S5 (frontend)**
- `packages/frontend/src/pages/Leaderboard.js` — MUI, reachable at
  `/session/:id/leaderboard`.
- Fetch via a new `getLeaderboard(sessionId)` in `api.js`.
- Match the sketch: brand header, progress indicator, RANK/TEAM/POINTS table,
  first-place highlight + star, "TIE" chips, footer note.
- Empty states per S5.

**Tie-break note**
- Final tie-break rule is intentionally out of scope here (joint ranks only).
  The formal rule is specified later via SpecKit (Steps 5–6).
