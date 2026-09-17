const request = require('supertest');
const app = require('../src/app');
const store = require('../src/store');

beforeEach(() => store.reset());

async function setup() {
  const session = (
    await request(app).post('/api/sessions').send({ name: 'Quiz' })
  ).body;
  const join = async (name) =>
    (
      await request(app)
        .post('/api/teams')
        .send({ joinCode: session.joinCode, name })
    ).body.team;
  const addRound = async (maxPoints = 10) =>
    (
      await request(app)
        .post('/api/rounds')
        .send({ sessionId: session.id, category: 'Cat', maxPoints })
    ).body;
  const score = (roundId, teamId, points) =>
    request(app).post('/api/scores').send({ roundId, teamId, points });
  const board = async () =>
    (await request(app).get(`/api/sessions/${session.id}/leaderboard`)).body;
  return { session, join, addRound, score, board };
}

describe('Leaderboard (Step 3)', () => {
  it('ranks teams by total points descending', async () => {
    const { join, addRound, score, board } = await setup();
    const a = await join('Alpha');
    const b = await join('Bravo');
    const r1 = await addRound();
    await score(r1.id, a.id, 3);
    await score(r1.id, b.id, 9);

    const { standings } = await board();
    expect(standings.map((s) => s.teamName)).toEqual(['Bravo', 'Alpha']);
    expect(standings[0]).toMatchObject({ totalPoints: 9, rank: 1 });
    expect(standings[1]).toMatchObject({ totalPoints: 3, rank: 2 });
  });

  it('counts a missing score as 0', async () => {
    const { join, addRound, score, board } = await setup();
    const a = await join('Alpha');
    await join('Bravo'); // never scored
    const r1 = await addRound();
    await score(r1.id, a.id, 5);

    const { standings } = await board();
    const bravo = standings.find((s) => s.teamName === 'Bravo');
    expect(bravo.totalPoints).toBe(0);
  });

  it('gives tied teams a shared rank with standard competition gaps (1,2,2,4)', async () => {
    const { join, addRound, score, board } = await setup();
    const a = await join('A');
    const b = await join('B');
    const c = await join('C');
    const dTeam = await join('D');
    const r1 = await addRound(20);
    await score(r1.id, a.id, 20);
    await score(r1.id, b.id, 10);
    await score(r1.id, c.id, 10);
    await score(r1.id, dTeam.id, 5);

    const { standings } = await board();
    const byName = Object.fromEntries(standings.map((s) => [s.teamName, s]));
    expect(byName.A.rank).toBe(1);
    expect(byName.B.rank).toBe(2);
    expect(byName.C.rank).toBe(2);
    expect(byName.B.tied).toBe(true);
    expect(byName.C.tied).toBe(true);
    expect(byName.D.rank).toBe(4); // gap after the tie group
  });

  it('reports rounds-scored progress', async () => {
    const { join, addRound, score, board } = await setup();
    const a = await join('Alpha');
    const r1 = await addRound();
    await addRound(); // second round, unscored
    await score(r1.id, a.id, 5);

    const b = await board();
    expect(b.roundsTotal).toBe(2);
    expect(b.roundsScored).toBe(1);
  });

  it('returns empty standings for a session with no teams', async () => {
    const { board } = await setup();
    const b = await board();
    expect(b.standings).toEqual([]);
    expect(b.roundsScored).toBe(0);
  });
});

describe('Leaderboard tie-break (Step 5)', () => {
  // (a) Equal totals, different best single-round score → ranked distinctly.
  it('breaks a tie by highest single-round score (descending)', async () => {
    const { join, addRound, score, board } = await setup();
    const x = await join('X');
    const y = await join('Y');
    const r1 = await addRound(10);
    const r2 = await addRound(10);
    await score(r1.id, x.id, 8); // X: total 12, best 8
    await score(r2.id, x.id, 4);
    await score(r1.id, y.id, 6); // Y: total 12, best 6
    await score(r2.id, y.id, 6);

    const { standings } = await board();
    const byName = Object.fromEntries(standings.map((s) => [s.teamName, s]));
    expect(standings.map((s) => s.teamName)).toEqual(['X', 'Y']);
    expect(byName.X.rank).toBe(1);
    expect(byName.Y.rank).toBe(2);
    expect(byName.X.tied).toBe(false);
    expect(byName.Y.tied).toBe(false);
  });

  // (b) Equal on BOTH total and best round → still tied, shared rank.
  it('keeps teams tied when total and best-round are both equal', async () => {
    const { join, addRound, score, board } = await setup();
    const p = await join('P');
    const q = await join('Q');
    const r1 = await addRound(10);
    const r2 = await addRound(10);
    await score(r1.id, p.id, 6); // P: total 12, best 6
    await score(r2.id, p.id, 6);
    await score(r1.id, q.id, 6); // Q: total 12, best 6
    await score(r2.id, q.id, 6);

    const { standings } = await board();
    const byName = Object.fromEntries(standings.map((s) => [s.teamName, s]));
    expect(byName.P.rank).toBe(1);
    expect(byName.Q.rank).toBe(1);
    expect(byName.P.tied).toBe(true);
    expect(byName.Q.tied).toBe(true);
  });
});
