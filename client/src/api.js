const API_ROOT = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const response = await fetch(`${API_ROOT}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || 'Something went wrong. Please try again.');
  }
  return payload.data;
}

export const api = {
  getToday: (date) => request(`/api/today?date=${encodeURIComponent(date)}`),
  getHistory: (date) => request(`/api/history?date=${encodeURIComponent(date)}`),
  getCompletion: (habitId, date) => request(`/api/habits/${habitId}/completions/${date}`),
  setCompletion: (habitId, date, completed) => request(`/api/habits/${habitId}/completions/${date}`, {
    method: 'PUT',
    body: JSON.stringify({ completed })
  }),
  getStreaks: (habitId, date) => request(`/api/habits/${habitId}/completions/streaks?date=${encodeURIComponent(date)}`),
  getHabits: (archived = 'false') => request(`/api/habits?archived=${archived}`),
  createHabit: (habit) => request('/api/habits', { method: 'POST', body: JSON.stringify(habit) }),
  updateHabit: (habitId, habit) => request(`/api/habits/${habitId}`, { method: 'PATCH', body: JSON.stringify(habit) }),
  archiveHabit: (habitId) => request(`/api/habits/${habitId}/archive`, { method: 'POST' })
};
