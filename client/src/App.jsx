import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, ChevronRight, ClipboardList, Leaf, Plus, Search, Sparkles } from 'lucide-react';
import { api } from './api';
import HabitCard from './components/HabitCard';
import MorningReminder from './components/MorningReminder';

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function readableDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(date);
}

function useTodayData() {
  const date = localDateKey();
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

function Shell({ children, completed, total }) {
  const location = useLocation();
  const pageLabel = location.pathname === '/habits' ? 'Habit library' : 'Today';
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/">
          <span className="brand__mark"><Leaf size={19} /></span>
          <span>Ananya's<br /><b>75-day challenge</b></span>
        </Link>
        <nav className="sidebar__nav" aria-label="Primary navigation">
          <NavLink end to="/"><CalendarDays size={18} /> Today</NavLink>
          <NavLink to="/habits"><ClipboardList size={18} /> Habit library</NavLink>
        </nav>
        <div className="sidebar__bottom">
          <div className="mini-progress"><span style={{ width: `${total ? (completed / total) * 100 : 0}%` }} /></div>
          <small>{total ? `${completed} of ${total} done today` : 'Your day is yours'}</small>
          <span className="sidebar__version">A quiet practice, every day.</span>
        </div>
      </aside>
      <main className="main-content">
        <header className="mobile-header">
          <Link className="brand" to="/"><span className="brand__mark"><Leaf size={17} /></span><b>75-day challenge</b></Link>
          <NavLink to="/habits" aria-label="Open habit library"><ClipboardList size={19} /></NavLink>
        </header>
        <div className="content-wrap">
          <div className="page-kicker"><span>{pageLabel}</span><span className="date-chip">{readableDate()}</span></div>
          {children}
        </div>
      </main>
    </div>
  );
}

function Dashboard({ data, onToggle, busyId }) {
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
          <h1>Good morning<span className="accent-dot">.</span></h1>
          <p className="hero-copy">Small promises, kept consistently, become a life you can feel.</p>
        </div>
        <div className="date-block"><span>{new Date().getDate()}</span><div>{new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date()).toUpperCase()}<br /><b>{new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date()).toUpperCase()}</b></div></div>
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

function Library({ onCreated }) {
  const [habits, setHabits] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', description: '', frequency: 'daily' });
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
      await api.createHabit(form);
      setForm({ name: '', description: '', frequency: 'daily' });
      setStatus('saved'); await load(); onCreated();
    } catch (saveError) { setStatus('idle'); setError(saveError.message); }
  }

  async function archive(id) {
    try { await api.archiveHabit(id); await load(); onCreated(); } catch (archiveError) { setError(archiveError.message); }
  }

  const visible = habits.filter((habit) => habit.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <>
      <section className="hero-row compact"><div><p className="eyebrow"><ClipboardList size={14} /> Keep it intentional</p><h1>Habit library<span className="accent-dot">.</span></h1><p className="hero-copy">Shape the list around the person you're becoming.</p></div></section>
      <div className="library-layout">
        <form className="create-form" onSubmit={create}><div className="eyebrow">Add a ritual</div><h2>Make it yours</h2><label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Drink water" required maxLength={120} /></label><label>Note <span>(optional)</span><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="A little context helps" maxLength={500} rows="3" /></label><label>Frequency<select value={form.frequency} onChange={(event) => setForm({ ...form, frequency: event.target.value })}><option value="daily">Every day</option><option value="weekdays">Monday - Friday</option></select></label>{error && <p className="form-error">{error}</p>}<button className="primary-button" disabled={status === 'saving'}><Plus size={17} /> {status === 'saving' ? 'Adding...' : 'Add habit'}</button></form>
        <section className="library-list"><div className="list-toolbar"><div><span className="eyebrow">Active habits</span><h2>{habits.length} in your practice</h2></div><label className="search-field"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search habits" aria-label="Search habits" /></label></div>{visible.length ? visible.map((habit) => <div className="library-item" key={habit._id}><div><strong>{habit.name}</strong><span>{habit.frequency === 'weekdays' ? 'Monday - Friday' : 'Every day'}{habit.description ? ` · ${habit.description}` : ''}</span></div><button className="quiet-button" onClick={() => archive(habit._id)}>Archive <ChevronRight size={15} /></button></div>) : <div className="empty-state"><ClipboardList size={25} /><strong>No habits found</strong><p>Try another search or add a new ritual.</p></div>}</section>
      </div>
    </>
  );
}

function LoadingView() { return <div className="state-card"><div className="loader" /><h2>Gathering your day</h2><p>Checking in with your habits...</p></div>; }
function ErrorView({ message, onRetry }) { return <div className="state-card state-card--error"><h2>Today's view is resting</h2><p>{message}</p><button className="primary-button" onClick={onRetry}>Try again</button></div>; }
function EmptyToday() { return <div className="state-card"><Sparkles size={28} /><h2>A clear morning</h2><p>No habits are scheduled today. Add one to begin your practice.</p><Link className="primary-button" to="/habits"><Plus size={17} /> Add a habit</Link></div>; }

export default function App() {
  const data = useTodayData();
  const [busyId, setBusyId] = useState('');
  const completed = data.items.filter(({ completion }) => completion?.completed).length;

  async function toggle(habitId, completedState) {
    setBusyId(habitId);
    try { await api.setCompletion(habitId, data.date, completedState); await data.reload(); } catch (error) { window.alert(error.message); } finally { setBusyId(''); }
  }

  return <Shell completed={completed} total={data.items.length}><Routes><Route path="/" element={<Dashboard data={data} onToggle={toggle} busyId={busyId} />} /><Route path="/habits" element={<Library onCreated={data.reload} />} /></Routes></Shell>;
}
