const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function assertDateKey(dateKey) {
  if (typeof dateKey !== 'string' || !DATE_KEY_PATTERN.test(dateKey)) {
    const error = new Error('date must use YYYY-MM-DD format');
    error.statusCode = 400;
    throw error;
  }

  const date = new Date(`${dateKey}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dateKey) {
    const error = new Error('date must be a valid calendar date');
    error.statusCode = 400;
    throw error;
  }

  return dateKey;
}

function dateKeyFromDate(date = new Date(), timezone = 'UTC') {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function isScheduledDate(frequency, dateKey, weekdays = []) {
  assertDateKey(dateKey);
  if (frequency === 'daily') return true;
  if (frequency === 'monSat') {
    const day = new Date(`${dateKey}T00:00:00.000Z`).getUTCDay();
    return day >= 1 && day <= 6;
  }
  if (frequency === 'weekdays') {
    const day = new Date(`${dateKey}T00:00:00.000Z`).getUTCDay();
    return day >= 1 && day <= 5;
  }
  if (frequency === 'specificDays') {
    const day = new Date(`${dateKey}T00:00:00.000Z`).getUTCDay();
    return weekdays.includes(day);
  }
  return false;
}

function shiftDateKey(dateKey, days) {
  assertDateKey(dateKey);
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

module.exports = {
  DATE_KEY_PATTERN,
  assertDateKey,
  dateKeyFromDate,
  isScheduledDate,
  shiftDateKey
};
