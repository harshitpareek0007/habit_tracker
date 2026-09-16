const Habit = require('../models/Habit');
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
      return isScheduledDate(habit.frequency, dateKey);
    })
    .map((habit) => ({ ...habit, dateKey: date || dateKeyFromDate(new Date(), habit.timezone) }));
}

module.exports = { listHabits, getHabitOrThrow, todayHabits };
