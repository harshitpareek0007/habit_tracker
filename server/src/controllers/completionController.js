const {
  listCompletions,
  getCompletion,
  upsertCompletion,
  getStreaks
} = require('../services/completionService');

async function getCompletions(request, response) {
  const completions = await listCompletions(request.params.habitId, request.query);
  response.json({ success: true, data: completions });
}

async function getCompletionByDate(request, response) {
  const completion = await getCompletion(request.params.habitId, request.params.dateKey);
  response.json({ success: true, data: completion });
}

async function updateCompletion(request, response) {
  if (!request.body || typeof request.body.completed !== 'boolean') {
    const error = new Error('completed must be a boolean');
    error.statusCode = 400;
    throw error;
  }
  const completion = await upsertCompletion(
    request.params.habitId,
    request.params.dateKey,
    request.body.completed
  );
  response.json({ success: true, data: completion });
}

async function getHabitStreaks(request, response) {
  const streaks = await getStreaks(request.params.habitId, request.query.date);
  response.json({ success: true, data: streaks });
}

module.exports = { getCompletions, getCompletionByDate, updateCompletion, getHabitStreaks };
