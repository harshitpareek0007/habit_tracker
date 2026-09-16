const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateCurrentStreak,
  calculateBestStreak,
  calculateStreaks
} = require('../src/services/streakService');

function completionDates(...dateKeys) {
  return dateKeys.map((dateKey) => ({ dateKey, completed: true }));
}

test('daily habit has no streak without completion history', () => {
  assert.deepEqual(
    calculateStreaks({ frequency: 'daily', completions: [], asOfDate: '2026-09-16' }),
    { currentStreak: 0, bestStreak: 0 }
  );
});

test('daily habit counts consecutive completed calendar days', () => {
  const completions = completionDates('2026-09-14', '2026-09-15', '2026-09-16');
  assert.equal(calculateCurrentStreak({ frequency: 'daily', completions, asOfDate: '2026-09-16' }), 3);
  assert.equal(calculateBestStreak({ frequency: 'daily', completions, asOfDate: '2026-09-16' }), 3);
});

test('daily missed day resets current streak but preserves best streak', () => {
  const completions = completionDates('2026-09-14', '2026-09-15', '2026-09-17');
  assert.deepEqual(
    calculateStreaks({ frequency: 'daily', completions, asOfDate: '2026-09-17' }),
    { currentStreak: 1, bestStreak: 2 }
  );
});

test('daily incomplete today returns zero current streak', () => {
  const completions = completionDates('2026-09-14', '2026-09-15');
  assert.equal(calculateCurrentStreak({ frequency: 'daily', completions, asOfDate: '2026-09-16' }), 0);
  assert.equal(calculateBestStreak({ frequency: 'daily', completions, asOfDate: '2026-09-16' }), 2);
});

test('daily non-consecutive history finds the historical best', () => {
  const completions = completionDates(
    '2026-09-01',
    '2026-09-02',
    '2026-09-05',
    '2026-09-06',
    '2026-09-07',
    '2026-09-20'
  );
  assert.equal(calculateBestStreak({ frequency: 'daily', completions, asOfDate: '2026-09-10' }), 3);
  assert.equal(calculateCurrentStreak({ frequency: 'daily', completions, asOfDate: '2026-09-10' }), 0);
});

test('future completions do not affect current or best streak', () => {
  const completions = completionDates('2026-09-17', '2026-09-18');
  assert.deepEqual(
    calculateStreaks({ frequency: 'daily', completions, asOfDate: '2026-09-16' }),
    { currentStreak: 0, bestStreak: 0 }
  );
});

test('weekday streak continues across Saturday and Sunday', () => {
  const completions = completionDates(
    '2026-09-07',
    '2026-09-08',
    '2026-09-09',
    '2026-09-10',
    '2026-09-11',
    '2026-09-14',
    '2026-09-15'
  );
  assert.deepEqual(
    calculateStreaks({ frequency: 'weekdays', completions, asOfDate: '2026-09-15' }),
    { currentStreak: 7, bestStreak: 7 }
  );
});

test('specific Monday Wednesday Friday streak skips Tuesday and Thursday', () => {
  const completions = completionDates('2026-09-07', '2026-09-09', '2026-09-11', '2026-09-14');
  assert.deepEqual(
    calculateStreaks({ frequency: 'specificDays', weekdays: [1, 3, 5], completions, asOfDate: '2026-09-14' }),
    { currentStreak: 4, bestStreak: 4 }
  );
});

test('specific weekend schedule treats Saturday and Sunday as scheduled', () => {
  const completions = completionDates('2026-09-12', '2026-09-13');
  assert.deepEqual(
    calculateStreaks({ frequency: 'specificDays', weekdays: [0, 6], completions, asOfDate: '2026-09-13' }),
    { currentStreak: 2, bestStreak: 2 }
  );
});

test('monSat streak skips Sunday without breaking the run', () => {
  const completions = completionDates('2026-09-12', '2026-09-14', '2026-09-15');
  assert.deepEqual(
    calculateStreaks({ frequency: 'monSat', completions, asOfDate: '2026-09-15' }),
    { currentStreak: 3, bestStreak: 3 }
  );
});

test('weekday current streak on weekend uses the latest scheduled day', () => {
  const completions = completionDates('2026-09-11');
  assert.equal(calculateCurrentStreak({ frequency: 'weekdays', completions, asOfDate: '2026-09-13' }), 1);
});

test('missed weekday breaks current streak and preserves earlier best', () => {
  const completions = completionDates('2026-09-07', '2026-09-08', '2026-09-10');
  assert.deepEqual(
    calculateStreaks({ frequency: 'weekdays', completions, asOfDate: '2026-09-10' }),
    { currentStreak: 1, bestStreak: 2 }
  );
});

test('missed Friday breaks a weekday run before Monday', () => {
  const completions = completionDates('2026-09-10', '2026-09-14', '2026-09-15');
  assert.deepEqual(
    calculateStreaks({ frequency: 'weekdays', completions, asOfDate: '2026-09-15' }),
    { currentStreak: 2, bestStreak: 2 }
  );
});

test('duplicate and false completion records do not inflate streaks', () => {
  const completions = [
    { dateKey: '2026-09-14', completed: true },
    { dateKey: '2026-09-14', completed: true },
    { dateKey: '2026-09-15', completed: false },
    { dateKey: '2026-09-16', completed: true }
  ];
  assert.deepEqual(
    calculateStreaks({ frequency: 'daily', completions, asOfDate: '2026-09-16' }),
    { currentStreak: 1, bestStreak: 1 }
  );
});

test('invalid frequency and date are rejected', () => {
  assert.throws(
    () => calculateCurrentStreak({ frequency: 'monthly', completions: [], asOfDate: '2026-09-16' }),
    /frequency must be daily, monSat, weekdays, or specificDays/
  );
  assert.throws(
    () => calculateCurrentStreak({ frequency: 'specificDays', weekdays: [], completions: [], asOfDate: '2026-09-16' }),
    /specificDays requires/
  );
  assert.throws(
    () => calculateBestStreak({ frequency: 'daily', completions: [], asOfDate: 'not-a-date' }),
    /YYYY-MM-DD/
  );
});
