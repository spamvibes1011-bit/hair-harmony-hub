export type Reminder = { productId: string; time: string; days: number[]; enabled: boolean; createdAt: string; notifiedOn?: string };
export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
export function validReminder(value: unknown): value is Reminder {
  if (!value || typeof value !== 'object') return false;
  const r = value as Reminder;
  return typeof r.productId === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(r.time) && Array.isArray(r.days) && r.days.length > 0 && r.days.every(d => Number.isInteger(d) && d >= 0 && d <= 6) && typeof r.enabled === 'boolean' && Number.isFinite(Date.parse(r.createdAt));
}
export function nextReminder(r: Reminder, now: Date, appliedToday = false): Date | null {
  if (!r.enabled) return null;
  const [hour = 0, minute = 0] = r.time.split(':').map(Number);
  for (let offset = 0; offset <= 7; offset++) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, hour, minute);
    if (r.days.includes(date.getDay()) && date >= now && (offset !== 0 || !appliedToday)) return date;
  }
  return null;
}
export function reminderDue(r: Reminder, now: Date, applied: boolean, paused: boolean): boolean {
  const [hour = 0, minute = 0] = r.time.split(':').map(Number);
  const scheduled = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);
  return r.enabled && !applied && !paused && r.days.includes(now.getDay()) && now >= scheduled && now >= new Date(r.createdAt);
}
export function logProductApplication(history: Record<string, string[]>, id: string, date: string) {
  return (history[id] ?? []).includes(date) ? history : { ...history, [id]: [...(history[id] ?? []), date] };
}