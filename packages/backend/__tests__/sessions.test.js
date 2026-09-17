const request = require('supertest');
const app = require('../src/app');
const store = require('../src/store');

beforeEach(() => store.reset());

async function newSession() {
  return (await request(app).post('/api/sessions').send({ name: 'Quiz' })).body;
}

describe('Close session (Step 6 — Foundational)', () => {
  it('closes a session by setting status to "closed"', async () => {
    const session = await newSession();
    const res = await request(app)
      .patch(`/api/sessions/${session.id}`)
      .send({ status: 'closed' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('closed');
  });

  it('rejects an invalid status value', async () => {
    const session = await newSession();
    const res = await request(app)
      .patch(`/api/sessions/${session.id}`)
      .send({ status: 'finished' });
    expect(res.status).toBe(400);
  });

  it('returns 404 for a missing session', async () => {
    const res = await request(app)
      .patch('/api/sessions/9999')
      .send({ status: 'closed' });
    expect(res.status).toBe(404);
  });

  it('is idempotent when closing an already-closed session', async () => {
    const session = await newSession();
    await request(app).patch(`/api/sessions/${session.id}`).send({ status: 'closed' });
    const res = await request(app)
      .patch(`/api/sessions/${session.id}`)
      .send({ status: 'closed' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('closed');
  });
});
