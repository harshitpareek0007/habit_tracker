const Habit = require('../models/Habit');
const { listHabits, getHabitOrThrow, todayHabits } = require('../services/habitService');
const { assertDateKey } = require('../utils/date');

function habitFields(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    const error = new Error('Request body must be a JSON object');
    error.statusCode = 400;
    throw error;
  }
  const fields = {};
  for (const field of ['name', 'description', 'frequency', 'timezone']) {
    if (Object.prototype.hasOwnProperty.call(body, field)) fields[field] = body[field];
  }
  return fields;
}

async function getHabits(request, response) {
  const habits = await listHabits(request.query);
  response.json({ success: true, data: habits });
}

async function getHabit(request, response) {
  const habit = await getHabitOrThrow(request.params.habitId);
  response.json({ success: true, data: habit });
}

async function createHabit(request, response) {
  const habit = await Habit.create(habitFields(request.body));
  response.status(201).json({ success: true, data: habit });
}

async function updateHabit(request, response) {
  const habit = await getHabitOrThrow(request.params.habitId);
  Object.assign(habit, habitFields(request.body));
  const updatedHabit = await habit.save();
  response.json({ success: true, data: updatedHabit });
}

async function archiveHabit(request, response) {
  const habit = await getHabitOrThrow(request.params.habitId);
  habit.archivedAt = new Date();
  response.json({ success: true, data: await habit.save() });
}

async function restoreHabit(request, response) {
  const habit = await getHabitOrThrow(request.params.habitId);
  habit.archivedAt = null;
  response.json({ success: true, data: await habit.save() });
}

async function getTodayHabits(request, response) {
  if (request.query.date) assertDateKey(request.query.date);
  const habits = await todayHabits(request.query.date);
  response.json({ success: true, data: habits });
}

module.exports = {
  getHabits,
  getHabit,
  createHabit,
  updateHabit,
  archiveHabit,
  restoreHabit,
  getTodayHabits
};
