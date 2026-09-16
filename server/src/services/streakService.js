const { assertDateKey, isScheduledDate, shiftDateKey } = require('../utils/date');

function invalidInput(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function validateFrequency(frequency) {
  if (!['daily', 'weekdays'].includes(frequency)) {
    throw invalidInput('frequency must be daily or weekdays');
  }
}

function completionDates(completions) {
  const completed = new Set();
  for (const completion of completions || []) {
    const dateKey = typeof completion === 'string' ? completion : completion.dateKey;
    if (!dateKey) continue;
    assertDateKey(dateKey);
    if (typeof completion === 'string' || completion.completed !== false) {
      completed.add(dateKey);
    }
  }
  return completed;
}

function calculateCurrentStreak({ frequency, completions = [], asOfDate }) {
  validateFrequency(frequency);
  assertDateKey(asOfDate);
  const completedDates = completionDates(completions);
  let dateKey = asOfDate;

  while (!isScheduledDate(frequency, dateKey)) {
    dateKey = shiftDateKey(dateKey, -1);
  }

  let streak = 0;
  while (dateKey >= '0000-01-01') {
    if (isScheduledDate(frequency, dateKey)) {
      if (!completedDates.has(dateKey)) break;
      streak += 1;
    }
    dateKey = shiftDateKey(dateKey, -1);
  }
  return streak;
}

function calculateBestStreak({ frequency, completions = [], asOfDate }) {
  validateFrequency(frequency);
  assertDateKey(asOfDate);
  const completedDates = completionDates(completions);
  const historicalDates = [...completedDates].filter((dateKey) => dateKey <= asOfDate);
  if (historicalDates.length === 0) return 0;

  let dateKey = historicalDates.sort()[0];
  let currentRun = 0;
  let bestRun = 0;

  while (dateKey <= asOfDate) {
    if (isScheduledDate(frequency, dateKey)) {
      if (completedDates.has(dateKey)) {
        currentRun += 1;
        bestRun = Math.max(bestRun, currentRun);
      } else {
        currentRun = 0;
      }
    }
    dateKey = shiftDateKey(dateKey, 1);
  }
  return bestRun;
}

function calculateStreaks({ frequency, completions = [], asOfDate }) {
  return {
    currentStreak: calculateCurrentStreak({ frequency, completions, asOfDate }),
    bestStreak: calculateBestStreak({ frequency, completions, asOfDate })
  };
}

module.exports = { calculateCurrentStreak, calculateBestStreak, calculateStreaks };