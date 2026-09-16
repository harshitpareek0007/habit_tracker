const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../src/app');
const Habit = require('../src/models/Habit');
const Completion = require('../src/models/Completion');

let mongo;

function body(response) {
  return response.body.data;
}

test.before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

test.after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

test.beforeEach(async () => {
  await Completion.deleteMany({});
  await Habit.deleteMany({});
});

test('health endpoint responds', async () => {
  const response = await request(app).get('/api/health').expect(200);
  assert.equal(response.body.success, true);
});

test('creates a habit and rejects an invalid frequency', async () => {
  const response = await request(app)
    .post('/api/habits')
    .send({ name: 'Read', description: 'Ten pages', frequency: 'daily', timezone: 'UTC' })
    .expect(201);
  assert.equal(body(response).name, 'Read');

  const invalid = await request(app)
    .post('/api/habits')
    .send({ name: 'Invalid', frequency: 'monthly' })
    .expect(400);
  assert.match(invalid.body.message, /frequency/);
});

test('lists, searches, and updates habits', async () => {
  await Habit.create({ name: 'Drink Water', frequency: 'daily' });
  await Habit.create({ name: 'Read', frequency: 'weekdays' });

  const search = await request(app).get('/api/habits?search=water').expect(200);
  assert.equal(body(search).length, 1);
  assert.equal(body(search)[0].name, 'Drink Water');

  const habit = body(await request(app).get('/api/habits').expect(200))[0];
  const update = await request(app)
    .patch(`/api/habits/${habit._id}`)
    .send({ name: 'Updated Habit', frequency: 'weekdays' })
    .expect(200);
  assert.equal(body(update).name, 'Updated Habit');
  assert.equal(body(update).frequency, 'weekdays');
});

test('archives and restores without deleting history', async () => {
  const habit = await Habit.create({ name: 'Workout', frequency: 'daily' });
  await Completion.create({ habitId: habit._id, dateKey: '2026-09-16', completed: true });

  await request(app).post(`/api/habits/${habit._id}/archive`).expect(200);
  assert.equal(body(await request(app).get('/api/habits').expect(200)).length, 0);
  assert.equal(body(await request(app).get('/api/habits?archived=true').expect(200)).length, 1);

  await request(app).post(`/api/habits/${habit._id}/restore`).expect(200);
  const history = await request(app).get(`/api/habits/${habit._id}/completions`).expect(200);
  assert.equal(body(history).length, 1);
});

test('returns daily and weekday habits for the requested date', async () => {
  await Habit.create({ name: 'Daily', frequency: 'daily' });
  await Habit.create({ name: 'Weekday', frequency: 'weekdays' });

  const weekday = await request(app).get('/api/today?date=2026-09-16').expect(200);
  assert.equal(body(weekday).length, 2);
  const weekend = await request(app).get('/api/today?date=2026-09-19').expect(200);
  assert.deepEqual(body(weekend).map((habit) => habit.name), ['Daily']);
});

test('creates and updates one completion per habit/date', async () => {
  const habit = await Habit.create({ name: 'Read', frequency: 'daily' });
  const created = await request(app)
    .put(`/api/habits/${habit._id}/completions/2026-09-16`)
    .send({ completed: true })
    .expect(200);
  assert.equal(body(created).completed, true);

  const updated = await request(app)
    .put(`/api/habits/${habit._id}/completions/2026-09-16`)
    .send({ completed: false })
    .expect(200);
  assert.equal(body(updated).completed, false);

  const history = await request(app).get(`/api/habits/${habit._id}/completions`).expect(200);
  assert.equal(body(history).length, 1);
  const status = await request(app)
    .get(`/api/habits/${habit._id}/completions/2026-09-16`)
    .expect(200);
  assert.equal(body(status).completed, false);
});

test('returns authoritative current and best streaks', async () => {
  const habit = await Habit.create({ name: 'Weekday Read', frequency: 'weekdays' });
  await Completion.create([
    { habitId: habit._id, dateKey: '2026-09-07', completed: true },
    { habitId: habit._id, dateKey: '2026-09-08', completed: true },
    { habitId: habit._id, dateKey: '2026-09-09', completed: true },
    { habitId: habit._id, dateKey: '2026-09-10', completed: true },
    { habitId: habit._id, dateKey: '2026-09-11', completed: true },
    { habitId: habit._id, dateKey: '2026-09-14', completed: true },
    { habitId: habit._id, dateKey: '2026-09-15', completed: true }
  ]);

  const response = await request(app)
    .get(`/api/habits/${habit._id}/completions/streaks?date=2026-09-15`)
    .expect(200);
  assert.deepEqual(body(response), {
    habitId: habit._id.toString(),
    frequency: 'weekdays',
    archived: false,
    asOfDate: '2026-09-15',
    currentStreak: 7,
    bestStreak: 7
  });
});

test('rejects completion on an unscheduled weekday weekend', async () => {
  const habit = await Habit.create({ name: 'Weekday', frequency: 'weekdays' });
  const response = await request(app)
    .put(`/api/habits/${habit._id}/completions/2026-09-19`)
    .send({ completed: true })
    .expect(400);
  assert.match(response.body.message, /scheduled/);
});

test('returns useful errors for invalid and missing habits', async () => {
  const invalid = await request(app).get('/api/habits/not-an-id').expect(400);
  assert.match(invalid.body.message, /Invalid habit ID/);

  const missing = await request(app)
    .get('/api/habits/507f1f77bcf86cd799439011')
    .expect(404);
  assert.equal(missing.body.message, 'Habit not found');
});
