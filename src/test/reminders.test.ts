import { describe, expect, it } from 'vitest';
import { ALL_DAYS, nextReminder, reminderDue, validReminder, logProductApplication, type Reminder } from '@/components/bodywise/reminder-schedule';

const daily: Reminder = { productId: 'hair-growth-roll-on', time: '21:00', days: ALL_DAYS, enabled: true, createdAt: new Date(2026, 9, 17, 12).toISOString() };
describe('Product reminders', () => {
  it('schedules a daily reminder at the chosen local time', () => {
    expect(nextReminder(daily, new Date(2026, 9, 17, 20))?.getTime()).toBe(new Date(2026, 9, 17, 21).getTime());
  });
  it('schedules selected weekdays only', () => {
    expect(nextReminder({ ...daily, days: [1, 3] }, new Date(2026, 9, 17, 20))?.getTime()).toBe(new Date(2026, 9, 19, 21).getTime());
  });
  it('moves completed daily applications to the next day', () => {
    expect(nextReminder(daily, new Date(2026, 9, 17, 20), true)?.getTime()).toBe(new Date(2026, 9, 18, 21).getTime());
  });
  it('does not schedule a disabled reminder', () => {
    expect(nextReminder({ ...daily, enabled: false }, new Date(2026, 9, 17, 20))).toBeNull();
  });
  it('becomes due at the chosen time, not before', () => {
    expect(reminderDue(daily, new Date(2026, 9, 17, 20, 59), false, false)).toBe(false);
    expect(reminderDue(daily, new Date(2026, 9, 17, 21), false, false)).toBe(true);
  });
  it('suppresses reminders for completed applications', () => {
    expect(reminderDue(daily, new Date(2026, 9, 17, 21), true, false)).toBe(false);
  });
  it('prioritises safety concerns over application reminders', () => {
    expect(reminderDue(daily, new Date(2026, 9, 17, 21), false, true)).toBe(false);
  });
  it('rejects empty selected-day frequency and invalid time', () => {
    expect(validReminder({ ...daily, days: [] })).toBe(false);
    expect(validReminder({ ...daily, time: '25:00' })).toBe(false);
    expect(validReminder(daily)).toBe(true);
  });
  it('stores one application per product per day in shared history', () => {
    const history = logProductApplication({}, daily.productId, '2026-10-17');
    expect(history[daily.productId]).toEqual(['2026-10-17']);
    expect(logProductApplication(history, daily.productId, '2026-10-17')).toBe(history);
  });
});