# PRD — Trivia Night Live Leaderboard

> Synthesized from [artifacts/trivia-night-planning-notes.md](artifacts/trivia-night-planning-notes.md)
> (raw planning-conversation notes). This PRD covers the **live leaderboard**
> feature specifically. Deliberately leaves the final tie-break rule as an open
> question — that ambiguity is resolved later via the SpecKit pipeline.

## 1. Problem
On trivia night, the leaderboard displayed at the front of the room is what teams
actually care about. Hosts currently track scores in a spreadsheet and read them
out, which is slow and error-prone — and ties cause confusion about who is
winning.

## 2. Goals
- Show a clear, ranked leaderboard that is legible from across a room.
- Update after each round is scored (near-real-time is not required).
- Make ties unambiguous on screen (joint rank, clearly labeled).

## 3. Non-goals (for this feature)
- The formal rule for breaking a **final** tie for first place (unresolved —
  see Open Questions).
- Real-time/websocket updates.
- Lightning/double-point rounds (mentioned but not built).

## 4. Users
- **Host** — enters scores; glances at the leaderboard to read standings aloud.
- **Team** — no account; watches the leaderboard between rounds.

## 5. Functional requirements
1. **Ranking:** teams ranked by descending total points across all scored rounds.
2. **Totals:** a team's total is the sum of its round scores; a **missing score
   counts as 0**.
3. **Ties:** teams with equal totals share the same rank and are visibly marked
   as tied ("TIE"). Mid-game ties are expected and are cosmetic only.
4. **Progress:** show how many rounds have been scored (e.g., "Round 3 of 3
   scored") so viewers know in-progress vs final.
5. **Refresh:** the leaderboard reflects the latest scores whenever it is loaded
   / after a score is entered.
6. **Empty states:** with no teams, show "waiting for teams"; with no scores yet,
   show "no scores yet" — never an empty table.

## 6. UX requirements (from the sketch)
See [artifacts/leaderboard-ui-sketch.png](artifacts/leaderboard-ui-sketch.png).
- Header band in brand blue (`#1976d2`): "TRIVIA NIGHT / Live Leaderboard", with
  the rounds-scored indicator top-right.
- Columns: **RANK · TEAM · POINTS**. Points large and right-aligned.
- **First place** row highlighted (light blue) with a star/trophy marker.
- **Tied** rows show a small "TIE" chip next to the team name and share a rank
  number.
- Footer note: "Updates after each round is scored · missing score = 0".

## 7. Open questions (unresolved — deferred to SpecKit)
- **Final tie for first place:** sudden-death question? highest score in the last
  round? highest score in a designated hard/"lightning" round? joint win? — TBD.
- Whether lightning/double-point rounds will exist.

## 8. Acceptance
- Leaderboard endpoint returns teams ranked by total points, with joint ranks and
  a `tied` flag, plus rounds-scored progress.
- Leaderboard screen visually matches the sketch (header, columns, first-place
  highlight, TIE chips, big points, footer, empty states).
