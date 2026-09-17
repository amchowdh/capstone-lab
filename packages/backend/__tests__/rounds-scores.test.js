const request = require('supertest');
const app = require('../src/app');
const store = require('../src/store');

beforeEach(() => store.reset());

async function newSession() {
  return (await request(app).post('/api/sessions').send({ name: 'Quiz' })).body;
}

async function joinTeam(session, name) {
  return (
    await request(app)
      .post('/api/teams')
      .send({ joinCode: session.joinCode, name })
  ).body.team;
}

describe('Round management (Step 2)', () => {
  it('adds a round with an auto-incremented round number', async () => {
    const session = await newSession();
    const r1 = await request(app)
      .post('/api/rounds')
      .send({ sessionId: session.id, category: 'History', maxPoints: 10 });
    const r2 = await request(app)
      .post('/api/rounds')
      .send({ sessionId: session.id, category: 'Sports', maxPoints: 5 });

    expect(r1.status).toBe(201);
    expect(r1.body.roundNumber).toBe(1);
    expect(r2.body.roundNumber).toBe(2);
  });

  it('rejects a round with no category', async () => {
    const session = await newSession();
    const res = await request(app)
      .post('/api/rounds')
      .send({ sessionId: session.id, maxPoints: 10 });
    expect(res.status).toBe(400);
  });

  it('rejects a round with non-positive maxPoints', async () => {
    const session = await newSession();
    const res = await request(app)
      .post('/api/rounds')
      .send({ sessionId: session.id, category: 'History', maxPoints: 0 });
    expect(res.status).toBe(400);
  });

  it('rejects a round for a missing session', async () => {
    const res = await request(app)
      .post('/api/rounds')
      .send({ sessionId: 9999, category: 'History', maxPoints: 10 });
    expect(res.status).toBe(404);
  });
});

describe('Score entry (Step 2)', () => {
  it('records a score and then edits it in place (upsert)', async () => {
    const session = await newSession();
    const team = await joinTeam(session, 'Aces');
    const round = (
      await request(app)
        .post('/api/rounds')
        .send({ sessionId: session.id, category: 'History', maxPoints: 10 })
    ).body;

    const first = await request(app)
      .post('/api/scores')
      .send({ roundId: round.id, teamId: team.id, points: 7 });
    expect(first.status).toBe(201);
    expect(first.body.points).toBe(7);

    const edit = await request(app)
      .post('/api/scores')
      .send({ roundId: round.id, teamId: team.id, points: 9 });
    expect(edit.body.id).toBe(first.body.id); // same record, edited
    expect(edit.body.points).toBe(9);

    const all = (
      await request(app).get('/api/scores').query({ sessionId: session.id })
    ).body;
    expect(all).toHaveLength(1); // not duplicated
  });

  it('rejects a score above the round maxPoints', async () => {
    const session = await newSession();
    const team = await joinTeam(session, 'Aces');
    const round = (
      await request(app)
        .post('/api/rounds')
        .send({ sessionId: session.id, category: 'History', maxPoints: 10 })
    ).body;

    const res = await request(app)
      .post('/api/scores')
      .send({ roundId: round.id, teamId: team.id, points: 11 });
    expect(res.status).toBe(400);
  });

  it('rejects a negative score', async () => {
    const session = await newSession();
    const team = await joinTeam(session, 'Aces');
    const round = (
      await request(app)
        .post('/api/rounds')
        .send({ sessionId: session.id, category: 'History', maxPoints: 10 })
    ).body;

    const res = await request(app)
      .post('/api/scores')
      .send({ roundId: round.id, teamId: team.id, points: -1 });
    expect(res.status).toBe(400);
  });

  it('returns 404 for a score on a missing round or team', async () => {
    const session = await newSession();
    const team = await joinTeam(session, 'Aces');

    const missingRound = await request(app)
      .post('/api/scores')
      .send({ roundId: 9999, teamId: team.id, points: 5 });
    expect(missingRound.status).toBe(404);

    const round = (
      await request(app)
        .post('/api/rounds')
        .send({ sessionId: session.id, category: 'History', maxPoints: 10 })
    ).body;
    const missingTeam = await request(app)
      .post('/api/scores')
      .send({ roundId: round.id, teamId: 9999, points: 5 });
    expect(missingTeam.status).toBe(404);
  });

  // Regression for issue #1: a team from another session must not be scorable
  // against this round (would corrupt the other session's leaderboard).
  it('rejects a score for a team that is not in the round\'s session', async () => {
    const sessionA = await newSession();
    const roundA = (
      await request(app)
        .post('/api/rounds')
        .send({ sessionId: sessionA.id, category: 'History', maxPoints: 10 })
    ).body;

    const sessionB = await newSession();
    const teamB = await joinTeam(sessionB, 'Outsiders');

    const res = await request(app)
      .post('/api/scores')
      .send({ roundId: roundA.id, teamId: teamB.id, points: 5 });
    expect(res.status).toBe(400);
  });
});
