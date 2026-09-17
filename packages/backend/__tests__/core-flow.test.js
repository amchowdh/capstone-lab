const request = require('supertest');
const app = require('../src/app');
const store = require('../src/store');

beforeEach(() => store.reset());

describe('Trivia Night core flow (Step 1 — create session + join)', () => {
  it('lets a host create a session and returns a join code', async () => {
    const res = await request(app)
      .post('/api/sessions')
      .send({ name: 'Friday Night Trivia' });
    expect(res.status).toBe(201);
    expect(res.body.joinCode).toMatch(/^[A-Z0-9]{6}$/);
    expect(res.body.status).toBe('pending');
  });

  it('rejects creating a session without a name', async () => {
    const res = await request(app).post('/api/sessions').send({});
    expect(res.status).toBe(400);
  });

  it('lets a team join via join code', async () => {
    const session = (
      await request(app).post('/api/sessions').send({ name: 'Quiz' })
    ).body;

    const res = await request(app)
      .post('/api/teams')
      .send({ joinCode: session.joinCode, name: 'The Brainiacs' });

    expect(res.status).toBe(201);
    expect(res.body.team.name).toBe('The Brainiacs');
    expect(res.body.session.id).toBe(session.id);
  });

  it('rejects joining with an invalid code', async () => {
    const res = await request(app)
      .post('/api/teams')
      .send({ joinCode: 'ZZZZZZ', name: 'Ghosts' });
    expect(res.status).toBe(404);
  });

  // Step 1 self-correction follow-up: duplicate team names in one session.
  it('rejects a duplicate team name within the same session', async () => {
    const session = (
      await request(app).post('/api/sessions').send({ name: 'Quiz' })
    ).body;
    await request(app)
      .post('/api/teams')
      .send({ joinCode: session.joinCode, name: 'Aces' });

    const dupe = await request(app)
      .post('/api/teams')
      .send({ joinCode: session.joinCode, name: 'aces' }); // case-insensitive

    expect(dupe.status).toBe(409);
  });
});
