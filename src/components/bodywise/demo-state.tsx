import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { PRODUCTS, dayKey, daysAgo } from './products';
import { logProductApplication } from './reminder-schedule';
import { addOwnedProduct, PRODUCT_IDS } from './product-numbers';
export type Goal = 'Hair' | 'Skin' | 'Body';
export type Status = 'Pending' | 'Under Review' | 'Resolved';
export type StatusEvent = { status: Status; date: string; note: string };
export type Concern = { id: string; productId: string; type: string; details: string; date: string; status: Status; photo?: string | undefined; severe?: boolean | undefined; source?: 'journey' | 'product' | 'support' | undefined; demo?: boolean | undefined; history?: StatusEvent[] | undefined };
type History = Record<string, string[]>;
type NewConcern = { productId: string; type: string; details: string; photo?: string | undefined; severe?: boolean | undefined; source?: Concern['source'] };
type DemoState = {
  ownedIds: string[]; addProduct: (id: string) => void;
  goal: Goal; applied: boolean; setGoal: (goal: Goal) => void; logApplication: () => void; ready: boolean;
  history: History; isAppliedToday: (id: string) => boolean; applyToday: (id: string) => void;
  concerns: Concern[]; addConcern: (c: NewConcern) => string; advanceConcern: (id: string) => void;
};
const KEY = 'bodywise-demo-v2';
const DemoContext = createContext<DemoState | null>(null);
export function localDay() { return dayKey(); }
export const NEXT: Record<Status, Status | null> = { Pending: 'Under Review', 'Under Review': 'Resolved', Resolved: null };
const NOTES: Record<Status, string> = { Pending: 'Report received. A care specialist will review it shortly.', 'Under Review': 'A care specialist is reviewing your report and batch details.', Resolved: 'Reviewed and closed. Guidance shared with you.' };
/** Concerning = open report flagged severe or describing irritation. Overrides routine reminders. */
export const isConcerning = (c: Concern) => c.status !== 'Resolved' && (!!c.severe || c.type === 'Irritation');
export function historyOf(c: Concern): StatusEvent[] { return c.history?.length ? c.history : [{ status: c.status, date: c.date, note: NOTES[c.status] }]; }
function iso(o: number, h = 10) { const d = daysAgo(o); d.setHours(h); return d.toISOString(); }
function seedConcerns(): Concern[] {
  return [
    { id: 'demo-1', demo: true, productId: 'hair-growth-roll-on', type: 'Packaging problem', details: 'Roller ball felt loose and leaked slightly in the box.', date: iso(4), status: 'Under Review', history: [{ status: 'Pending', date: iso(4), note: NOTES.Pending }, { status: 'Under Review', date: iso(3, 15), note: NOTES['Under Review'] }] },
    { id: 'demo-2', demo: true, productId: 'hair-fall-shampoo', type: 'Product discolouration', details: 'Shampoo looked slightly darker than my previous bottle.', date: iso(2), status: 'Pending', history: [{ status: 'Pending', date: iso(2), note: NOTES.Pending }] },
    { id: 'demo-3', demo: true, productId: 'hair-growth-roll-on', type: 'Other', details: 'Delivery seal looked opened on arrival.', date: iso(11), status: 'Resolved', history: [{ status: 'Pending', date: iso(11), note: NOTES.Pending }, { status: 'Under Review', date: iso(10), note: NOTES['Under Review'] }, { status: 'Resolved', date: iso(8), note: 'Replacement dispatched. Seal variation confirmed as packaging-line issue (demo).' }] },
  ];
}
function seedHistory(): History { return Object.fromEntries(PRODUCTS.map(p => [p.id, p.seedOffsets.map(o => dayKey(daysAgo(o)))])); }
export function DemoProvider({ children }: { children: ReactNode }) {
  const [goal, setGoal] = useState<Goal>('Hair');
  const [ownedIds, setOwnedIds] = useState<string[]>(PRODUCTS.map(p => p.id));
  const [history, setHistory] = useState<History>(seedHistory);
  const [concerns, setConcerns] = useState<Concern[]>(seedConcerns);
  const [ready, setReady] = useState(false);
  useEffect(() => { try { const s = JSON.parse(localStorage.getItem(KEY) || '{}'); if (Array.isArray(s.ownedIds)) setOwnedIds([...new Set([...PRODUCTS.map(p => p.id), ...s.ownedIds.filter((id: unknown) => PRODUCT_IDS.some(value => value === id))])]); if (['Hair', 'Skin', 'Body'].includes(s.goal)) setGoal(s.goal); if (s.history) setHistory({ ...seedHistory(), ...s.history }); if (Array.isArray(s.concerns)) { const seeds = seedConcerns().filter(d => !s.concerns.some((c: Concern) => c.id === d.id)); setConcerns([...s.concerns, ...seeds]); } } catch { /* defaults */ } setReady(true); }, []);
  useEffect(() => { if (ready) { try { localStorage.setItem(KEY, JSON.stringify({ goal, history, concerns, ownedIds })); } catch { /* session only */ } } }, [goal, history, concerns, ownedIds, ready]);
  const isAppliedToday = (id: string) => (history[id] ?? []).includes(dayKey());
  const applyToday = (id: string) => setHistory(h => logProductApplication(h, id, dayKey()));
  const addConcern: DemoState['addConcern'] = c => { const id = crypto.randomUUID(); const date = new Date().toISOString(); setConcerns(list => [{ ...c, id, date, status: 'Pending', history: [{ status: 'Pending', date, note: NOTES.Pending }] }, ...list]); return id; };
  const advanceConcern = (id: string) => setConcerns(list => list.map(c => { const n = NEXT[c.status]; if (c.id !== id || !n) return c; const date = new Date().toISOString(); return { ...c, status: n, history: [...historyOf(c), { status: n, date, note: NOTES[n] }] }; }));
  return <DemoContext.Provider value={{ ownedIds, addProduct: id => setOwnedIds(ids => addOwnedProduct(ids, id)), goal, setGoal, ready, history, isAppliedToday, applyToday, concerns, addConcern, advanceConcern, applied: isAppliedToday('hair-growth-roll-on'), logApplication: () => applyToday('hair-growth-roll-on') }}>{children}</DemoContext.Provider>;
}
export function useDemo() { const value = useContext(DemoContext); if (!value) throw new Error('Demo provider is required'); return value; }
