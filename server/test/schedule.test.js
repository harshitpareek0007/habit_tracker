const test = require('node:test');
const assert = require('node:assert/strict');
const { isScheduledDate } = require('../src/utils/date');

test('daily frequency schedules all seven days', () => {
  for (const dateKey of ['2026-09-13', '2026-09-14', '2026-09-15', '2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19']) {
    assert.equal(isScheduledDate('daily', dateKey), true);
  }
});

test('monSat frequency schedules Monday through Saturday but not Sunday', () => {
  assert.equal(isScheduledDate('monSat', '2026-09-14'), true);
  assert.equal(isScheduledDate('monSat', '2026-09-19'), true);
  assert.equal(isScheduledDate('monSat', '2026-09-13'), false);
});

test('specific days schedule only selected weekdays', () => {
  assert.equal(isScheduledDate('specificDays', '2026-09-14', [1, 3, 5]), true);
  assert.equal(isScheduledDate('specificDays', '2026-09-15', [1, 3, 5]), false);
  assert.equal(isScheduledDate('specificDays', '2026-09-16', [1, 3, 5]), true);
  assert.equal(isScheduledDate('specificDays', '2026-09-17', [1, 3, 5]), false);
  assert.equal(isScheduledDate('specificDays', '2026-09-18', [1, 3, 5]), true);
  assert.equal(isScheduledDate('specificDays', '2026-09-19', [1, 3, 5]), false);
  assert.equal(isScheduledDate('specificDays', '2026-09-13', [1, 3, 5]), false);
});

test('specific days support Monday-only and weekend-only habits', () => {
  assert.equal(isScheduledDate('specificDays', '2026-09-14', [1]), true);
  assert.equal(isScheduledDate('specificDays', '2026-09-16', [1]), false);
  assert.equal(isScheduledDate('specificDays', '2026-09-12', [0, 6]), true);
  assert.equal(isScheduledDate('specificDays', '2026-09-13', [0, 6]), true);
  assert.equal(isScheduledDate('specificDays', '2026-09-14', [0, 6]), false);
});
