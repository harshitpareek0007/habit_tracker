import { Check, Circle, Flame, Trophy } from 'lucide-react';

function frequencyLabel(frequency) {
  return frequency === 'weekdays' ? 'Mon - Fri' : 'Every day';
}

export default function HabitCard({ item, onToggle, busy }) {
  const { habit, completion, streaks } = item;
  const completed = completion?.completed === true;

  return (
    <article className={`habit-card ${completed ? 'is-complete' : ''}`}>
      <div className="habit-card__topline">
        <span className="habit-frequency">{frequencyLabel(habit.frequency)}</span>
        <button
          className={`check-button ${completed ? 'checked' : ''}`}
          onClick={() => onToggle(habit._id, !completed)}
          disabled={busy}
          aria-label={completed ? `Mark ${habit.name} incomplete` : `Mark ${habit.name} complete`}
        >
          {completed ? <Check size={21} strokeWidth={2.8} /> : <Circle size={22} strokeWidth={1.5} />}
        </button>
      </div>
      <h3>{habit.name}</h3>
      {habit.description && <p>{habit.description}</p>}
      <div className="habit-card__footer">
        <span><Flame size={15} /> {streaks?.currentStreak ?? 0} day current</span>
        <span><Trophy size={15} /> {streaks?.bestStreak ?? 0} best</span>
      </div>
    </article>
  );
}
