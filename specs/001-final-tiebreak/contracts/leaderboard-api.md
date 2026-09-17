# Contract — Leaderboard & Close-Session API

## Close a session
`PATCH /api/sessions/:id` (or `POST /api/sessions/:id/close`)

Request body:
```json
{ "status": "closed" }
```

Responses:
- `200` → the updated session `{ id, name, joinCode, status: "closed", ... }`
- `400` → invalid status value
- `404` → session not found

Rules:
- Only `pending`/`active` sessions transition to `closed`.
- Closing an already-closed session is idempotent → `200` with the same session.

## Get leaderboard (extended)
`GET /api/sessions/:id/leaderboard`

Response `200`:
```json
{
  "isFinal": true,
  "roundsTotal": 3,
  "roundsScored": 3,
  "standings": [
    { "teamId": 1, "teamName": "X", "totalPoints": 12, "bestRoundScore": 8, "lastRoundScore": 4, "rank": 1, "tied": false },
    { "teamId": 2, "teamName": "Y", "totalPoints": 12, "bestRoundScore": 8, "lastRoundScore": 2, "rank": 2, "tied": false }
  ]
}
```

Behavior:
- `isFinal` is `true` iff the session status is `closed`.
- When `isFinal`, ranking applies `total → bestRound → lastRound`; teams sharing
  all three share a rank (`tied: true`) = explicit joint win.
- When not final, ranking is `total → bestRound` (existing behavior); mid-game
  ties are cosmetic joint ranks.
- `404` if the session does not exist.
