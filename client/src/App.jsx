import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, ClipboardList, History as HistoryIcon, Leaf, Plus, Search, Sparkles, UserRound } from 'lucide-react';
import { api } from './api';
import HabitCard from './components/HabitCard';
import MorningReminder from './components/MorningReminder';

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function useLocalDateKey() {
  const [date, setDate] = useState(() => localDateKey());
  useEffect(() => {
    const timer = window.setInterval(() => {
      const nextDate = localDateKey();
      setDate((currentDate) => currentDate === nextDate ? currentDate : nextDate);
    }, 30000);
    return () => window.clearInterval(timer);
  }, []);
  return date;
}

function useLocalClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

function greetingForHour(hour) {
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
}

function readableDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(date);
}

function shiftDateKey(dateKey, days) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function dateFromKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

const WEEKDAYS = [
  ['Sunday', 0], ['Monday', 1], ['Tuesday', 2], ['Wednesday', 3],
  ['Thursday', 4], ['Friday', 5], ['Saturday', 6]
];

function storedChallengeDuration() {
  const value = Number(window.localStorage.getItem('habit-tracker-challenge-duration'));
  return Number.isInteger(value) && value > 0 ? value : 75;
}

function useTodayData() {
  const date = useLocalDateKey();
  const [state, setState] = useState({ status: 'loading', items: [], error: '' });

  async function load() {
    setState((current) => ({ ...current, status: 'loading', error: '' }));
    try {
      const habits = await api.getToday(date);
      const items = await Promise.all(habits.map(async (habit) => {
        const [completion, streaks] = await Promise.all([
          api.getCompletion(habit._id, date),
          api.getStreaks(habit._id, date)
        ]);
        return { habit, completion, streaks };
      }));
      setState({ status: 'ready', items, error: '' });
    } catch (error) {
      setState({ status: 'error', items: [], error: error.message });
    }
  }

  useEffect(() => { load(); }, [date]);
  return { ...state, date, reload: load };
}

function Shell({ children, completed, total, profileName, challengeDuration }) {
  const location = useLocation();
  const pageLabel = location.pathname === '/habits' ? 'Habit library' : location.pathname === '/history' ? 'History' : location.pathname === '/profile' ? 'Profile' : 'Today';
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/">
          <span className="brand__mark"><Leaf size={19} /></span>
          <span>{profileName}'s<br /><b>{challengeDuration}-day challenge</b></span>
        </Link>
        <nav className="sidebar__nav" aria-label="Primary navigation">
          <NavLink end to="/"><CalendarDays size={18} /> Today</NavLink>
          <NavLink to="/habits"><ClipboardList size={18} /> Habit library</NavLink>
          <NavLink to="/history"><HistoryIcon size={18} /> History</NavLink>
          <NavLink to="/profile"><UserRound size={18} /> Profile</NavLink>
        </nav>
        <div className="sidebar__bottom">
          <div className="mini-progress"><span style={{ width: `${total ? (completed / total) * 100 : 0}%` }} /></div>
          <small>{total ? `${completed} of ${total} done today` : 'Your day is yours'}</small>
          <span className="sidebar__version">A quiet practice, every day.</span>
        </div>
      </aside>
      <main className="main-content">
        <header className="mobile-header">
          <Link className="brand" to="/"><span className="brand__mark"><Leaf size={17} /></span><b>{challengeDuration}-day challenge</b></Link>
          <NavLink to="/habits" aria-label="Open habit library"><ClipboardList size={19} /></NavLink>
          <NavLink to="/history" aria-label="Open history"><HistoryIcon size={19} /></NavLink>
          <NavLink to="/profile" aria-label="Open profile"><UserRound size={19} /></NavLink>
        </header>
        <div className="content-wrap">
          <div className="page-kicker"><span>{pageLabel}</span><span className="date-chip">{readableDate()}</span></div>
          {children}
        </div>
      </main>
    </div>
  );
}

function Dashboard({ data, onToggle, busyId, profileName, now }) {
  const completed = data.items.filter(({ completion }) => completion?.completed).length;
  const pending = data.items.length - completed;
  const progress = data.items.length ? Math.round((completed / data.items.length) * 100) : 0;

  if (data.status === 'loading') return <LoadingView />;
  if (data.status === 'error') return <ErrorView message={data.error} onRetry={data.reload} />;

  return (
    <>
      <section className="hero-row">
        <div>
          <p className="eyebrow"><Sparkles size={14} /> A fresh page</p>
          <h1>{greetingForHour(now.getHours())}, {profileName}<span className="accent-dot">.</span></h1>
          <p className="hero-copy">Small promises, kept consistently, become a life you can feel.</p>
        </div>
        <div className="date-block"><span>{now.getDate()}</span><div>{new Intl.DateTimeFormat('en-US', { month: 'short' }).format(now).toUpperCase()}<br /><b>{new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(now).toUpperCase()}</b></div></div>
      </section>

      <MorningReminder pendingCount={pending} />

      <section className="progress-panel" aria-label="Today's progress">
        <div className="progress-panel__copy"><span className="eyebrow">Today's progress</span><strong>{completed} <em>/ {data.items.length}</em></strong><p>{pending ? `${pending} ${pending === 1 ? 'habit' : 'habits'} left to log` : 'Everything is checked in.'}</p></div>
        <div className="progress-wheel" style={{ '--progress': `${progress * 3.6}deg` }}><div><strong>{progress}%</strong><small>complete</small></div></div>
      </section>

      <section className="section-heading"><div><span className="eyebrow">Your rituals</span><h2>Show up for yourself</h2></div><Link className="text-link" to="/habits">Manage habits <ArrowUpRight size={15} /></Link></section>
      {data.items.length === 0 ? <EmptyToday /> : <div className="habit-grid">{data.items.map((item) => <HabitCard key={item.habit._id} item={item} onToggle={onToggle} busy={busyId === item.habit._id} />)}</div>}
    </>
  );
}

function frequencyLabel(habit) {
  if (habit.frequency === 'specificDays') {
    return (habit.weekdays || []).map((day) => WEEKDAYS.find(([, value]) => value === day)?.[0]).join(', ');
  }
  if (habit.frequency === 'monSat') return 'Monday - Saturday';
  return habit.frequency === 'weekdays' ? 'Monday - Friday' : 'Every day';
}

function Library({ onCreated }) {
  const [habits, setHabits] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', description: '', frequency: 'daily', weekdays: [] });
  const [editingId, setEditingId] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function load() {
    try { setHabits(await api.getHabits()); } catch (loadError) { setError(loadError.message); }
  }
  useEffect(() => { load(); }, []);

  async function create(event) {
    event.preventDefault();
    setStatus('saving'); setError('');
    try {
      if (editingId) await api.updateHabit(editingId, form);
      else await api.createHabit(form);
      setForm({ name: '', description: '', frequency: 'daily', weekdays: [] });
      setEditingId('');
      setStatus('saved'); await load(); onCreated();
    } catch (saveError) { setStatus('idle'); setError(saveError.message); }
  }

  async function archive(id) {
    try { await api.archiveHabit(id); await load(); onCreated(); } catch (archiveError) { setError(archiveError.message); }
  }

  function edit(habit) {
    setEditingId(habit._id);
    setForm({ name: habit.name, description: habit.description || '', frequency: habit.frequency, weekdays: habit.frequency === 'weekdays' ? [1, 2, 3, 4, 5] : (habit.weekdays || []) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function toggleWeekday(day) {
    setForm((current) => ({ ...current, weekdays: current.weekdays.includes(day) ? current.weekdays.filter((value) => value !== day) : [...current.weekdays, day].sort((a, b) => a - b) }));
  }

  const visible = habits.filter((habit) => habit.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <>
      <section className="hero-row compact"><div><p className="eyebrow"><ClipboardList size={14} /> Keep it intentional</p><h1>Habit library<span className="accent-dot">.</span></h1><p className="hero-copy">Shape the list around the person you're becoming.</p></div></section>
      <div className="library-layout">
        <form className="create-form" onSubmit={create}><div className="eyebrow">{editingId ? 'Edit a ritual' : 'Add a ritual'}</div><h2>{editingId ? 'Refine the practice' : 'Make it yours'}</h2><label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Drink water" required maxLength={120} /></label><label>Note <span>(optional)</span><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="A little context helps" maxLength={500} rows="3" /></label><fieldset className="frequency-group"><legend>Frequency</legend><label className="radio-option"><input type="radio" name="frequency" checked={form.frequency === 'daily'} onChange={() => setForm({ ...form, frequency: 'daily', weekdays: [] })} /> Every day</label><label className="radio-option"><input type="radio" name="frequency" checked={form.frequency === 'monSat'} onChange={() => setForm({ ...form, frequency: 'monSat', weekdays: [] })} /> Mon - Sat</label><label className="radio-option"><input type="radio" name="frequency" checked={form.frequency === 'specificDays'} onChange={() => setForm({ ...form, frequency: 'specificDays' })} /> Specific days</label>{form.frequency === 'specificDays' && <div className="weekday-options">{WEEKDAYS.map(([label, day]) => <label className="day-option" key={label}><input type="checkbox" checked={form.weekdays.includes(day)} onChange={() => toggleWeekday(day)} /> {label}</label>)}</div>}</fieldset>{error && <p className="form-error">{error}</p>}<div className="form-actions"><button className="primary-button" disabled={status === 'saving'}><Plus size={17} /> {status === 'saving' ? 'Saving...' : editingId ? 'Save changes' : 'Add habit'}</button>{editingId && <button type="button" className="quiet-button" onClick={() => { setEditingId(''); setForm({ name: '', description: '', frequency: 'daily', weekdays: [] }); }}>Cancel</button>}</div></form>
        <section className="library-list"><div className="list-toolbar"><div><span className="eyebrow">Active habits</span><h2>{habits.length} in your practice</h2></div><label className="search-field"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search habits" aria-label="Search habits" /></label></div>{visible.length ? visible.map((habit) => <div className="library-item" key={habit._id}><div><strong>{habit.name}</strong><span>{frequencyLabel(habit)}{habit.description ? ` · ${habit.description}` : ''}</span></div><div className="library-item__actions"><button className="quiet-button" onClick={() => edit(habit)}>Edit</button><button className="quiet-button" onClick={() => archive(habit._id)}>Archive <ChevronRight size={15} /></button></div></div>) : <div className="empty-state"><ClipboardList size={25} /><strong>No habits found</strong><p>Try another search or add a new ritual.</p></div>}</section>
      </div>
    </>
  );
}

function LoadingView() { return <div className="state-card"><div className="loader" /><h2>Gathering your day</h2><p>Checking in with your habits...</p></div>; }
function ErrorView({ message, onRetry }) { return <div className="state-card state-card--error"><h2>Today's view is resting</h2><p>{message}</p><button className="primary-button" onClick={onRetry}>Try again</button></div>; }
function EmptyToday() { return <div className="state-card"><Sparkles size={28} /><h2>A clear morning</h2><p>No habits are scheduled today. Add one to begin your practice.</p><Link className="primary-button" to="/habits"><Plus size={17} /> Add a habit</Link></div>; }

function ProfilePage({ profileName, onSave, challengeDuration, onDurationSave }) {
  const [draft, setDraft] = useState(profileName);
  const [duration, setDuration] = useState(String(challengeDuration));
  const [saved, setSaved] = useState(false);
  const [durationSaved, setDurationSaved] = useState(false);

  function save(event) {
    event.preventDefault();
    onSave(draft);
    setDraft(draft.trim() || 'Ananya');
    setSaved(true);
  }

  function saveDuration(event) {
    event.preventDefault();
    onDurationSave(duration);
    setDurationSaved(true);
  }

  return <section className="profile-page"><div className="eyebrow"><UserRound size={14} /> Your profile</div><h1>Make it yours<span className="accent-dot">.</span></h1><p className="hero-copy">Choose the name and challenge rhythm that should greet you each day.</p><form className="profile-form" onSubmit={save}><label htmlFor="display-name">Display name</label><input id="display-name" value={draft} onChange={(event) => { setDraft(event.target.value); setSaved(false); }} maxLength={60} required /><button className="primary-button" type="submit">Save profile</button>{saved && <p className="save-confirmation" role="status">Profile updated.</p>}</form><form className="profile-form" onSubmit={saveDuration}><label htmlFor="challenge-duration">Challenge duration</label><select id="challenge-duration" value={duration} onChange={(event) => { setDuration(event.target.value); setDurationSaved(false); }}><option value="30">30 days</option><option value="45">45 days</option><option value="60">60 days</option><option value="75">75 days</option><option value="90">90 days</option><option value="100">100 days</option></select><button className="primary-button" type="submit">Save challenge</button>{durationSaved && <p className="save-confirmation" role="status">Challenge updated to {duration} days.</p>}</form></section>;
}

function HistoryPage() {
  const today = localDateKey();
  const [date, setDate] = useState(() => shiftDateKey(today, -1));
  const [visibleMonth, setVisibleMonth] = useState(() => monthKey(dateFromKey(shiftDateKey(today, -1))));
  const [retryToken, setRetryToken] = useState(0);
  const [state, setState] = useState({ status: 'loading', data: null, error: '' });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading', data: null, error: '' });
    api.getHistory(date).then((data) => {
      if (active) setState({ status: 'ready', data, error: '' });
    }).catch((error) => {
      if (active) setState({ status: 'error', data: null, error: error.message });
    });
    return () => { active = false; };
  }, [date, retryToken]);

  const dateLabel = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(dateFromKey(date));
  const items = state.data?.items || [];
  const completed = state.data?.completedCount || 0;
  const percentage = items.length ? Math.round((completed / items.length) * 100) : 0;
  const future = state.data?.future;
  const monthDate = new Date(Number(visibleMonth.slice(0, 4)), Number(visibleMonth.slice(5, 7)) - 1, 1);
  const firstDay = monthDate.getDay();
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const calendarDays = Array.from({ length: firstDay + daysInMonth }, (_, index) => index < firstDay ? null : `${visibleMonth}-${String(index - firstDay + 1).padStart(2, '0')}`);
  const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(monthDate);
  const selectedToday = date === today;

  function selectDate(nextDate) {
    if (nextDate <= today) setDate(nextDate);
  }

  return <section className="history-page"><div className="eyebrow"><HistoryIcon size={14} /> Look back</div><h1>History<span className="accent-dot">.</span></h1><p className="hero-copy">Real activity from your scheduled habits, day by day.</p><div className="history-layout"><aside className="history-calendar" aria-label="History calendar"><div className="calendar-heading"><button className="icon-button history-nav" onClick={() => setVisibleMonth((current) => monthKey(new Date(Number(current.slice(0, 4)), Number(current.slice(5, 7)) - 2, 1)))} aria-label="Previous month"><ChevronLeft size={18} /></button><strong>{monthLabel}</strong><button className="icon-button history-nav" onClick={() => setVisibleMonth((current) => monthKey(new Date(Number(current.slice(0, 4)), Number(current.slice(5, 7)), 1)))} aria-label="Next month"><ChevronRight size={18} /></button></div><div className="calendar-weekdays">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div><div className="calendar-grid">{calendarDays.map((day, index) => day ? <button key={day} className={`calendar-day ${day === date ? 'selected' : ''} ${day === today ? 'today' : ''} ${day > today ? 'future' : ''}`} onClick={() => selectDate(day)} disabled={day > today} aria-label={`Select ${day}`}>{Number(day.slice(-2))}</button> : <span className="calendar-blank" key={`blank-${index}`} />)}</div><div className="calendar-legend"><span><i className="legend-dot today-dot" /> Today</span><span><i className="legend-dot selected-dot" /> Selected</span></div></aside><div className="history-details"><div className="history-toolbar"><button className="icon-button history-nav" onClick={() => selectDate(shiftDateKey(date, -1))} aria-label="Previous day"><ChevronLeft size={20} /></button><div><strong>{selectedToday ? 'Today' : date === shiftDateKey(today, -1) ? 'Yesterday' : dateLabel}</strong><span>{dateLabel}</span></div><button className="icon-button history-nav" onClick={() => selectDate(shiftDateKey(date, 1))} disabled={date >= today} aria-label="Next day"><ChevronRight size={20} /></button></div>{state.status === 'loading' && <div className="history-loading" aria-live="polite"><span /><span /><span /></div>}{state.status === 'error' && <div className="history-empty history-error"><HistoryIcon size={25} /><strong>Unable to load history.</strong><button className="primary-button" onClick={() => setRetryToken((current) => current + 1)}>Retry</button></div>}{state.status === 'ready' && (future ? <div className="history-empty"><HistoryIcon size={28} /><strong>No history available for a future date.</strong></div> : items.length === 0 ? <div className="history-empty"><HistoryIcon size={28} /><strong>No habits were scheduled for this date.</strong></div> : <><div className="history-summary"><div><span>Scheduled</span><strong>{items.length}</strong></div><div><span>Completed</span><strong>{completed} / {items.length}</strong></div><div><span>Progress</span><strong>{percentage}%</strong></div></div>{completed === 0 && <p className="history-note">No activity recorded for this date.</p>}<div className="history-list">{items.map(({ habit, completion }) => <div className="history-item" key={habit._id}><div className={`history-status ${completion?.completed ? 'done' : ''}`}>{completion?.completed ? '✓' : '○'}</div><div><strong>{habit.name}</strong><span>{completion?.completed ? 'Completed' : 'Missed'}{habit.archivedAt ? ' · Archived' : ''}</span></div></div>)}</div></>)}</div></div></section>;
}

export default function App() {
  const data = useTodayData();
  const now = useLocalClock();
  const [busyId, setBusyId] = useState('');
  const [profileName, setProfileName] = useState(() => window.localStorage.getItem('habit-tracker-profile-name') || 'Ananya');
  const [challengeDuration, setChallengeDuration] = useState(storedChallengeDuration);
  const completed = data.items.filter(({ completion }) => completion?.completed).length;

  function updateProfileName(value) {
    const nextName = value.trim() || 'Ananya';
    setProfileName(nextName);
    window.localStorage.setItem('habit-tracker-profile-name', nextName);
  }

  function updateChallengeDuration(value) {
    const nextDuration = Number(value);
    if (!Number.isInteger(nextDuration) || nextDuration <= 0) return;
    setChallengeDuration(nextDuration);
    window.localStorage.setItem('habit-tracker-challenge-duration', String(nextDuration));
  }

  async function toggle(habitId, completedState) {
    setBusyId(habitId);
    try { await api.setCompletion(habitId, data.date, completedState); await data.reload(); } catch (error) { window.alert(error.message); } finally { setBusyId(''); }
  }

  return <Shell completed={completed} total={data.items.length} profileName={profileName} challengeDuration={challengeDuration}><Routes><Route path="/" element={<Dashboard data={data} onToggle={toggle} busyId={busyId} profileName={profileName} now={now} />} /><Route path="/habits" element={<Library onCreated={data.reload} />} /><Route path="/history" element={<HistoryPage />} /><Route path="/profile" element={<ProfilePage profileName={profileName} onSave={updateProfileName} challengeDuration={challengeDuration} onDurationSave={updateChallengeDuration} />} /></Routes></Shell>;
}
