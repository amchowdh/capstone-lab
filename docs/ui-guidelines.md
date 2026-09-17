# UI Guidelines — Trivia Night

## Design system
- **Component library:** Material UI (MUI) v5. Prefer MUI components over custom
  HTML/CSS. Use the `sx` prop for one-off styling; avoid separate CSS files.
- **Theme:** a single `createTheme` in
  [packages/frontend/src/index.js](../packages/frontend/src/index.js) with
  primary color `#1976d2`. Wrap the app in `ThemeProvider` + `CssBaseline`.
- **Layout:** pages render inside a `Container maxWidth="sm"`; forms live in a
  `Paper` with `p: 3`; stack fields vertically with `Stack spacing={2}`.

## Navigation
- Top `AppBar` with the app title (links home) and `Host` / `Join` buttons.
- Routing via `react-router-dom`. Routes: `/` (home), `/create`, `/join`, and
  `/leaderboard` (added in Step 3).

## Interaction patterns
- **Forms:** controlled MUI `TextField`s. Submit on a primary `Button`
  (`variant="contained"`). Disable/guard empty required fields.
- **Feedback:** success and error states use MUI `Alert` (`severity="success"` /
  `"error"`). Show the server's error message when present, else a friendly
  fallback.
- **Empty states:** show a short helper line in `text.secondary` rather than a
  blank area.

## Accessibility
- Every input has a label (visible `label` and/or `aria-label`).
- Interactive elements are real buttons/links, keyboard reachable.
- Color is never the only signal — pair it with text/icons (e.g., a tie is
  labeled "Tie", not only colored).

## Trivia-specific screens
- **Create session:** name + optional date → on success, prominently display the
  generated join code for the host to read aloud.
- **Join session:** join code + team name → on success, a clear "You're in!"
  confirmation.
- **Score entry (host):** per round, list teams with a numeric points field;
  editing an existing score updates it in place.
- **Leaderboard (Step 3):** ranked list of teams with rank, team name, total
  points, and a visible tie indicator.
