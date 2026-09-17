# Architecture — Trivia Night

Small monorepo: React (MUI) frontend ↔ Express backend with an in-memory store.
Below: the score-entry → leaderboard-update flow that Step 3 focuses on.

## Score entry → leaderboard update (sequence)

```mermaid
sequenceDiagram
    actor Host
    participant FE as Frontend (ManageSession)
    participant API as Express API
    participant Store as In-memory store
    actor Team
    participant LB as Frontend (Leaderboard)

    Host->>FE: enter/edit a team's points for a round
    FE->>API: POST /api/scores {roundId, teamId, points}
    API->>API: validate 0 <= points <= round.maxPoints
    API->>Store: upsertScore(roundId, teamId, points)
    Store-->>API: saved score
    API-->>FE: 201 score

    Team->>LB: open /session/:id/leaderboard
    LB->>API: GET /api/sessions/:id/leaderboard
    API->>Store: listTeams + listScoresBySession + listRounds
    API->>API: computeLeaderboard() — totals, ranks, ties, progress
    API-->>LB: { standings, roundsTotal, roundsScored }
    LB-->>Team: ranked table (missing score = 0, ties share rank)
```

## Leaderboard computation

```mermaid
flowchart TD
    A[Teams in session] --> C[Sum Score.points per team]
    B[Scores for session rounds] --> C
    C --> D[Missing score counts as 0]
    D --> E[Sort by totalPoints desc]
    E --> F[Assign standard competition ranks]
    F --> G[Flag equal-total teams as tied]
    G --> H[Return standings + roundsTotal + roundsScored]
```

> Final tie-break (who wins an equal top score) is deliberately **not** modeled
> here — joint ranks only. The formal rule is added later via the SpecKit
> pipeline (Steps 5–6).
