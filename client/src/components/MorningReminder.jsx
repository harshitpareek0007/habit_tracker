import { Bell, X } from 'lucide-react';
import { useEffect, useState } from 'react';

function todayKey() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export default function MorningReminder({ pendingCount }) {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('morning-reminder') === todayKey());
  const morning = new Date().getHours() < 12;

  useEffect(() => {
    if (localStorage.getItem('morning-reminder') !== todayKey()) setDismissed(false);
  }, []);

  if (dismissed || !morning || pendingCount === 0) return null;

  function dismiss() {
    localStorage.setItem('morning-reminder', todayKey());
    setDismissed(true);
  }

  return (
    <aside className="reminder" aria-label="Morning reminder">
      <div className="reminder__icon"><Bell size={18} /></div>
      <div>
        <strong>Make the morning count.</strong>
        <p>You have {pendingCount} {pendingCount === 1 ? 'habit' : 'habits'} waiting for you.</p>
      </div>
      <button className="icon-button" onClick={dismiss} aria-label="Dismiss morning reminder"><X size={17} /></button>
    </aside>
  );
}
