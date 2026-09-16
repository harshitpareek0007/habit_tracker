const Completion = require('../models/Completion');
const { getHabitOrThrow } = require('./habitService');
const { assertDateKey, dateKeyFromDate, isScheduledDate } = require('../utils/date');
const { calculateStreaks } = require('./streakService');

async function validateCompletionDate(habitId, dateKey) {
  assertDateKey(dateKey);
  const habit = await getHabitOrThrow(habitId);
  if (habit.archivedAt) {
    const error = new Error('Archived habits cannot receive new completions');
    error.statusCode = 409;
    throw error;
  }
  if (!isScheduledDate(habit.frequency, dateKey)) {
    const error = new Error('Habit is not scheduled for this date');
    error.statusCode = 400;
    throw error;
  }
  return habit;
}

async function listCompletions(habitId, query) {
  await getHabitOrThrow(habitId);
  const filter = { habitId };
  if (query.from || query.to) {
    filter.dateKey = {};
    if (query.from) filter.dateKey.$gte = assertDateKey(query.from);
    if (query.to) filter.dateKey.$lte = assertDateKey(query.to);
  }
  return Completion.find(filter).sort({ dateKey: -1 }).lean();
}

async function getCompletion(habitId, dateKey) {
  await getHabitOrThrow(habitId);
  assertDateKey(dateKey);
  return Completion.findOne({ habitId, dateKey }).lean();
}

async function upsertCompletion(habitId, dateKey, completed) {
  await validateCompletionDate(habitId, dateKey);
  return Completion.findOneAndUpdate(
    { habitId, dateKey },
    { $set: { completed, completedAt: completed ? new Date() : null } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  ).lean();
}

async function getStreaks(habitId, asOfDate) {
  const habit = await getHabitOrThrow(habitId);
  const dateKey = asOfDate || dateKeyFromDate(new Date(), habit.timezone);
  assertDateKey(dateKey);
  const completions = await Completion.find({ habitId }).select('dateKey completed').lean();
  return {
    habitId: habit._id,
    frequency: habit.frequency,
    archived: Boolean(habit.archivedAt),
    asOfDate: dateKey,
    ...calculateStreaks({ frequency: habit.frequency, completions, asOfDate: dateKey })
  };
}

module.exports = { listCompletions, getCompletion, upsertCompletion, getStreaks };
