import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { Bell, Check, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemo, isConcerning } from './demo-state';
import { dayKey, getProduct } from './products';
import { ALL_DAYS, WEEKDAYS, nextReminder, reminderDue, validReminder, type Reminder } from './reminder-schedule';

const KEY = 'bodywise-reminders-v1';
type ReminderState = { reminders: Reminder[]; ready: boolean; now: Date; save: (r: Reminder) => void; remove: (id: string) => void; toggle: (id: string) => void; enableNotifications: () => Promise<void>; testNotification: () => void; notificationStatus: string; granted: boolean; error: string; due: Reminder[] };
const Context = createContext<ReminderState | null>(null);
export function useReminders() { const state = useContext(Context); if (!state) throw new Error('Reminder provider required'); return state; }

export function ReminderProvider({ children }: { children: ReactNode }) {
  const { ready: demoReady, isAppliedToday, concerns } = useDemo();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [error, setError] = useState('');
  const [granted, setGranted] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState('Reminders appear here while the app is open. Closed-app push is not connected.');
  useEffect(() => {
    try { const stored: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]'); if (Array.isArray(stored)) setReminders(stored.filter(validReminder).filter(r => getProduct(r.productId))); } catch { setError('Saved reminders could not be read.'); }
    setReady(true);
    if ('Notification' in window) setGranted(Notification.permission === 'granted');
    const tick = () => setNow(new Date());
    const timer = window.setInterval(tick, 15000);
    window.addEventListener('focus', tick); document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(timer); window.removeEventListener('focus', tick); document.removeEventListener('visibilitychange', tick); };
  }, []);
  useEffect(() => { if (!ready) return; try { localStorage.setItem(KEY, JSON.stringify(reminders)); setError(''); } catch { setError('Reminders could not be saved on this device. Free some browser storage and try again.'); } }, [reminders, ready]);
  const due = ready && demoReady ? reminders.filter(r => reminderDue(r, now, isAppliedToday(r.productId), concerns.some(c => c.productId === r.productId && isConcerning(c)))) : [];
  const deliver = (productId?: string) => {
    try {
      const product = productId ? getProduct(productId) : undefined;
      const notification = new Notification(product ? `Time to apply ${product.name}` : 'Product reminder notification test', { body: product ? 'Open your product to mark your application as completed.' : 'Browser notifications are enabled while this app is open.', tag: productId ?? 'reminder-test' });
      notification.onclick = () => { window.focus(); if (productId) window.location.assign(`/products/${productId}`); notification.close(); };
      return true;
    } catch { setNotificationStatus('This browser cannot display open-app notifications. In-app reminders still work; closed-app push needs Firebase.'); return false; }
  };
  useEffect(() => {
    const pending = due.filter(r => r.notifiedOn !== dayKey(now));
    if (!pending.length) return;
    if ('Notification' in window && Notification.permission === 'granted') pending.forEach(r => deliver(r.productId));
    setReminders(list => list.map(r => pending.some(p => p.productId === r.productId) ? { ...r, notifiedOn: dayKey(now) } : r));
  }, [now, reminders, ready, demoReady, concerns]);
  const enableNotifications = async () => {
    if (!('Notification' in window) || !window.isSecureContext) { setNotificationStatus('Browser notifications are unavailable here. In-app reminders still work.'); return; }
    if (window.top !== window.self) { setNotificationStatus('Open the app in its own tab to allow notifications. The embedded preview cannot ask permission.'); return; }
    try { const permission = await Notification.requestPermission(); setGranted(permission === 'granted'); setNotificationStatus(permission === 'granted' ? 'Browser permission granted. Reminders need this app open; closed-app push is not connected.' : permission === 'denied' ? 'Notifications are blocked. Allow them in your browser’s site settings; in-app reminders still work.' : 'Permission was not granted. You can enable notifications again later.'); } catch { setNotificationStatus('Permission could not be requested. Open the app in its own tab and check site settings.'); }
  };
  return <Context.Provider value={{ reminders, ready, now, due, error, granted, notificationStatus, enableNotifications, testNotification: () => { if ('Notification' in window && Notification.permission === 'granted') deliver(); }, save: r => setReminders(list => [...list.filter(x => x.productId !== r.productId), r]), remove: id => setReminders(list => list.filter(r => r.productId !== id)), toggle: id => setReminders(list => list.map(r => r.productId === id ? { ...r, enabled: !r.enabled } : r)) }}>{children}</Context.Provider>;
}

function NotificationControls() {
  const { enableNotifications, testNotification, notificationStatus, granted, error } = useReminders();
  return <div className="mt-4 border-t pt-4"><p role="status" className="text-xs leading-5 text-muted-foreground">{notificationStatus}</p><div className="mt-2 flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={enableNotifications}><Bell /> {granted ? 'Notification settings' : 'Enable notifications'}</Button>{granted && <Button variant="ghost" size="sm" onClick={testNotification}>Send test notification</Button>}</div>{error && <p role="alert" className="mt-2 text-xs text-destructive">{error}</p>}</div>;
}

export function ProductReminder({ productId }: { productId: string }) {
  const { reminders, save, toggle, remove, ready, now } = useReminders();
  const { isAppliedToday, concerns } = useDemo();
  const reminder = reminders.find(r => r.productId === productId);
  const [editing, setEditing] = useState(false);
  const [time, setTime] = useState('21:00');
  const [daily, setDaily] = useState(true);
  const [days, setDays] = useState<number[]>(ALL_DAYS);
  const paused = concerns.some(c => c.productId === productId && isConcerning(c));
  const next = reminder ? nextReminder(reminder, now, isAppliedToday(productId)) : null;
  const edit = () => { setTime(reminder?.time ?? '21:00'); setDays(reminder?.days ?? ALL_DAYS); setDaily(!reminder || reminder.days.length === 7); setEditing(true); };
  return <section className="panel"><div className="section-header"><h2 className="section-title">Application reminder</h2><Bell size={18} className="text-primary" /></div>
    {editing ? <form className="space-y-4" onSubmit={e => { e.preventDefault(); if (!daily && !days.length) return; save({ productId, time, days: daily ? ALL_DAYS : days, enabled: true, createdAt: new Date().toISOString(), ...(reminder?.notifiedOn ? { notifiedOn: reminder.notifiedOn } : {}) }); setEditing(false); }}>
      <label className="block text-xs font-semibold">Reminder time<input type="time" required value={time} onChange={e => setTime(e.target.value)} className="mt-2 block w-full rounded-md border bg-background p-3 text-sm" /></label>
      <fieldset className="flex gap-2"><legend className="mb-2 text-xs font-semibold">Frequency</legend><Button type="button" size="sm" variant={daily ? 'default' : 'outline'} aria-pressed={daily} onClick={() => setDaily(true)}>Daily</Button><Button type="button" size="sm" variant={!daily ? 'default' : 'outline'} aria-pressed={!daily} onClick={() => setDaily(false)}>Selected days</Button></fieldset>
      {!daily && <fieldset className="flex flex-wrap gap-2"><legend className="mb-2 text-xs font-semibold">Days</legend>{WEEKDAYS.map((day, index) => <label key={day} className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={days.includes(index)} onChange={() => setDays(list => list.includes(index) ? list.filter(d => d !== index) : [...list, index])} />{day}</label>)}</fieldset>}
      <p className="text-xs text-muted-foreground">Local time on this device. {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
      {!daily && !days.length && <p role="alert" className="text-xs text-destructive">Choose at least one day.</p>}
      <div className="flex gap-2"><Button type="submit" disabled={!ready || (!daily && !days.length)}><Check />Save reminder</Button><Button type="button" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button></div>
    </form> : reminder ? <div><p className="text-lg font-bold">{reminder.time} <span className="text-xs font-normal text-muted-foreground">{reminder.days.length === 7 ? 'Daily' : reminder.days.map(d => WEEKDAYS[d]).join(', ')}</span></p><p className="mt-2 text-xs text-muted-foreground">{paused ? 'Paused for safety — see Support.' : !reminder.enabled ? 'Reminder disabled' : next ? `Next: ${next.toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : ''}</p><div className="mt-3 flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={edit}><Pencil />Edit reminder</Button><Button variant="outline" size="sm" onClick={() => toggle(productId)}>{reminder.enabled ? 'Disable reminder' : 'Enable reminder'}</Button><Button variant="ghost" size="icon" aria-label="Delete reminder" title="Delete reminder" onClick={() => remove(productId)}><Trash2 /></Button></div></div> : <Button variant="outline" className="w-full" disabled={!ready} onClick={edit}><Bell />Set Reminder</Button>}
    <NotificationControls />
  </section>;
}

export function DashboardReminders() {
  const { reminders, due, now, ready } = useReminders();
  const { isAppliedToday, applyToday, concerns } = useDemo();
  const available = reminders.filter(r => !concerns.some(c => c.productId === r.productId && isConcerning(c)));
  const upcoming = available.map(r => ({ reminder: r, date: nextReminder(r, now, isAppliedToday(r.productId)) })).filter(item => item.date !== null).sort((a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0));
  const next = upcoming[0];
  return <section className="panel"><div className="section-header"><h2 className="section-title">Application reminders</h2><Bell size={18} className="text-primary" /></div>{due.map(r => <div role="alert" key={r.productId} className="mb-4 border-b pb-4"><h3 className="text-sm font-semibold">Time to apply {getProduct(r.productId)?.name}</h3><p className="mt-1 text-xs text-muted-foreground">Scheduled for {r.time}</p><Button className="mt-3" onClick={() => applyToday(r.productId)}><Check />Mark completed</Button></div>)}{ready && next?.date ? <div><p className="text-xs text-muted-foreground">Next reminder</p><Link to="/products/$id" params={{ id: next.reminder.productId }} className="mt-1 block text-sm font-semibold text-primary">{getProduct(next.reminder.productId)?.name}</Link><p className="mt-2 text-xs">{next.date.toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p></div> : !due.length && <p className="text-xs text-muted-foreground">{reminders.length ? 'No active reminders. Manage them on your product page.' : 'No reminders set.'}</p>}<Button asChild variant="link" className="mt-2 h-auto p-0 text-xs"><Link to="/products">Manage product reminders</Link></Button></section>;
}