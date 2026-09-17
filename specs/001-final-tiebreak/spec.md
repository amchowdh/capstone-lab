# Feature Specification: Final Tie-Break for Session Winners

**Feature Branch**: `001-final-tiebreak`

**Created**: 2026-09-17

**Status**: Draft

**Input**: User description: "Final tie-break to determine session winners. When a session is closed and two or more teams remain tied on total points (and on the existing best-single-round tiebreak), the final standings must resolve to a clear, deterministic outcome — either a single winner per a defined rule, or an explicitly defined shared-win. This applies ONLY to final/closed standings; mid-game ties stay as cosmetic joint ranks."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Decisive final result at session close (Priority: P1)

When a host closes a trivia session, the final standings must present an
unambiguous outcome at the top — a single winning team, or an explicitly labeled
shared win — even when teams are tied on total points (and on the best-single-round
tiebreak already in use).

**Why this priority**: The whole point of a trivia night is crowning a winner. An
ambiguous "who won?" at the end is the pain this feature removes.

**Independent Test**: Close a session in which two teams are tied on total points
and on best-round score; verify the final standings resolve to a defined outcome
(single winner or explicit shared win).

**Acceptance Scenarios**:

1. **Given** a closed session where teams A and B have equal total points and equal
   best-round scores, **When** the final standings are shown, **Then** the outcome
   at rank 1 is decisive (a single team, or an explicitly labeled shared win).
2. **Given** the same closed session viewed twice, **When** the standings are
   computed each time, **Then** the final ranking is identical (deterministic).

---

### User Story 2 - Mid-game ties stay cosmetic (Priority: P2)

While a session is still in progress, tied teams should share a rank (joint rank)
without any winner being decided prematurely.

**Why this priority**: Mid-game ties are normal and expected; forcing a winner
mid-game would misrepresent the standings.

**Independent Test**: With an active (not closed) session where two teams are tied,
verify they share a rank and no final tie-break is applied.

**Acceptance Scenarios**:

1. **Given** an active session with two teams tied on total points, **When** the
   leaderboard is shown, **Then** both teams share the same rank and are marked tied.

---

### User Story 3 - The result explains itself (Priority: P3)

The final standings should make clear how (or whether) a tie was broken, so the
host can announce the result confidently.

**Why this priority**: Transparency avoids disputes; teams accept a result they
can understand.

**Independent Test**: In a closed session where a tie was broken, verify the
displayed result communicates the basis of the resolution.

**Acceptance Scenarios**:

1. **Given** a closed session where a tie was resolved, **When** the final standings
   are shown, **Then** the result indicates the tie was broken (and, where relevant,
   on what basis).

---

### Edge Cases

- **Three or more teams mutually tied**: the rule must extend to break (or
  explicitly share) among all tied teams, not just two.
- **Still tied after the rule**: a defined fallback must apply (see FR-005).
- **No rounds or no scores**: closing an empty session must not error; all teams
  are trivially tied at zero and the fallback applies.
- **Single team**: that team is unambiguously first.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: When a session is **closed**, the system MUST produce final standings
  that resolve teams tied on total points AND on best-single-round score into a
  deterministic outcome (a single winner or an explicitly defined shared win).
- **FR-002**: The final tie-break MUST apply **only** when the session status is
  `closed`; while a session is active, tied teams MUST retain cosmetic joint ranks
  (existing behavior).
- **FR-003**: The final tie-break MUST be **deterministic** — identical inputs
  always yield identical final standings.
- **FR-004**: The system MUST resolve a remaining final tie using
  [NEEDS CLARIFICATION: which rule should decide the winner? e.g. highest score in
  the last round / highest score in a designated hard-or-"lightning" round /
  head-to-head result in a specific category / an explicit joint win].
- **FR-005**: When teams remain tied even after applying the chosen rule, the
  system MUST [NEEDS CLARIFICATION: fallback behavior — declare an explicit joint
  win / keep a stable deterministic order / require the host to choose manually].
- **FR-006**: The final standings MUST convey how (or whether) a top tie was
  resolved so the result is explainable to participants.
- **FR-007**: Support for designating a special round (e.g. a "lightning"/hard
  round) as the tie-break basis is [NEEDS CLARIFICATION: in scope — requiring a new
  per-round attribute — or out of scope, resolving ties only from existing
  round/score data?].

### Key Entities *(include if feature involves data)*

- **Session**: has a status (`pending` | `active` | `closed`); the tie-break
  activates at `closed`.
- **Team**: a participant whose final placement is being determined.
- **Round / Score**: the per-round points that feed totals, best-round score, and
  any round-specific tie-break basis.
- **Final Standing**: a team's resolved final rank plus an indication of how a tie
  (if any) was broken.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of closed sessions present a decisive top result — a single #1
  or an explicitly labeled shared #1 — with no unexplained tie at the top.
- **SC-002**: Re-computing the final standings of the same closed session yields an
  identical ranking every time (fully deterministic).
- **SC-003**: For a resolved tie, a host can state *why* a team placed ahead from
  the displayed result alone, without external notes.
- **SC-004**: 100% of active (non-closed) sessions still display tied teams as
  joint ranks (no premature winner).

## Assumptions

- Builds on the existing in-memory Session/Team/Round/Score model and the current
  best-single-round tiebreak (Step 5); this feature adds only the **final**
  resolution layer.
- A session's `closed` status is the trigger. A minimal "close session" capability
  is assumed available (or added as a thin prerequisite) — this spec does not
  redefine the closing workflow.
- Unless clarification puts a designated special round in scope (FR-007), the
  tie-break uses existing round/score data only.
