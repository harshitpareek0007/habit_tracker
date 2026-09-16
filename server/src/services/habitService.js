const Habit = require('../models/Habit');
const Completion = require('../models/Completion');
const { dateKeyFromDate, isScheduledDate } = require('../utils/date');

function habitFilter({ archived, search }) {
  const filter = {};
  if (archived === 'true') filter.archivedAt = { $ne: null };
  else if (archived !== 'all') filter.archivedAt = null;

  if (search && search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.name = { $regex: escaped, $options: 'i' };
  }
  return filter;
}

async function listHabits(query) {
  return Habit.find(habitFilter(query)).sort({ updatedAt: -1 }).lean();
}

async function getHabitOrThrow(habitId) {
  const habit = await Habit.findById(habitId);
  if (!habit) {
    const error = new Error('Habit not found');
    error.statusCode = 404;
    throw error;
  }
  return habit;
}

async function todayHabits(date) {
  const habits = await Habit.find({ archivedAt: null }).sort({ updatedAt: -1 }).lean();
  return habits
    .filter((habit) => {
      const dateKey = date || dateKeyFromDate(new Date(), habit.timezone);
      return isScheduledDate(habit.frequency, dateKey, habit.weekdays);
    })
    .map((habit) => ({ ...habit, dateKey: date || dateKeyFromDate(new Date(), habit.timezone) }));
}

async function historyForDate(date) {
  const dateKey = date || dateKeyFromDate(new Date(), 'UTC');
  const todayKey = dateKeyFromDate(new Date(), 'UTC');
  if (dateKey > todayKey) return { dateKey, future: true, items: [] };

  const habits = await Habit.find({}).sort({ archivedAt: 1, updatedAt: -1 }).lean();
  const scheduledHabits = habits.filter((habit) => {
    if (habit.archivedAt && dateKey > dateKeyFromDate(habit.archivedAt, habit.timezone)) return false;
    return isScheduledDate(habit.frequency, dateKey, habit.weekdays);
  });
  const completions = await Completion.find({
    habitId: { $in: scheduledHabits.map((habit) => habit._id) },
    dateKey
  }).lean();
  const completionByHabit = new Map(completions.map((completion) => [completion.habitId.toString(), completion]));

  return {
    dateKey,
    future: false,
    scheduledCount: scheduledHabits.length,
    completedCount: completions.filter((completion) => completion.completed).length,
    items: scheduledHabits.map((habit) => ({
      habit,
      completion: completionByHabit.get(habit._id.toString()) || null
    }))
  };
}

module.exports = { listHabits, getHabitOrThrow, todayHabits, historyForDate };
