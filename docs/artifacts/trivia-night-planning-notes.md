# Trivia Night — Planning Conversation (raw notes)

> Raw artifact standing in for a recorded planning call. This is intentionally
> messy and conversational — the kind of source you'd `#file`-reference and ask
> Copilot to synthesize into a PRD. Not a spec; contains open questions and
> mild contradictions on purpose (the tie-break ambiguity is resolved later via
> SpecKit).

**Attendees:** Priya (host / product), Marcus (frequent host), Dana (engineer)

---

**Priya:** Ok so the thing everyone actually cares about on trivia night is the
big leaderboard on the screen at the front of the room. Teams glance up between
rounds. It has to be readable from across a bar.

**Marcus:** Yeah. Rank, team name, total points. Big numbers. The team in first
should pop — people love seeing their name at the top.

**Dana:** So ranked descending by total points. How often does it refresh?

**Marcus:** Right now I re-read scores off a spreadsheet after every round, so
"updates when I enter a score" is fine. Doesn't need to be real-time to the
second, just accurate after each round is scored.

**Priya:** The tricky part is ties. Last week two teams finished on 42 and it was
chaos — nobody knew who won.

**Marcus:** Ties happen ALL the time mid-game. Like three teams on 20 after round
one. That's normal and fine — I just want them clearly marked as tied, same rank,
not one arbitrarily above the other.

**Dana:** So mid-game ties are cosmetic — show them as joint rank. But the FINAL
tie for first, that needs an actual winner?

**Priya:** ...maybe? Honestly we haven't decided. Some hosts do a sudden-death
question. Some compare who did better in a specific round. Some just declare a
joint win and split the bar tab prize.

**Marcus:** I usually break a final tie by whoever scored highest in the LAST
round. Like a "closer" round matters more. But that's just me.

**Priya:** See, I'd compare the hardest category — if we tag a round as the
"lightning round" or whatever, that should count more for tie-breaks.

**Dana:** Those are different rules. I'm not going to guess. For now can the
leaderboard just show joint ranks with a little "TIE" tag, and we decide the
formal final-tie-break rule properly later?

**Priya:** Works. For the screen: first place row highlighted, a little trophy or
star. Tied teams get a small "TIE" chip next to the rank. Show total points on
the right, nice and big.

**Marcus:** And show how many rounds have been scored so far somewhere, so people
know it's still in progress vs final.

**Dana:** Colors?

**Priya:** Keep it on-brand — that blue we use (the 1976d2 primary). First place
row maybe a light highlight. Nothing fancy. Must be legible.

**Dana:** And if there are zero teams or zero rounds?

**Marcus:** Just say something friendly like "waiting for teams" / "no scores
yet." Don't show an empty table.

**Priya:** One more — teams that haven't been scored in a round yet shouldn't be
penalized weirdly; missing score just counts as 0 for now.

**Dana:** Ok. I have enough to write this up. The final-tie-break rule stays an
open question — flagging it.

---

### Open questions (captured)
- **Final tie for first place:** sudden-death? highest score in last round?
  highest score in a designated "lightning"/hard round? joint win? — UNRESOLVED.
- Do lightning/double-point rounds exist yet? (mentioned, not built)
- Missing scores treated as 0 (agreed for now).
