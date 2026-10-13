import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { PRODUCTS, dayKey, daysAgo } from './products';
export type Goal = 'Hair' | 'Skin' | 'Body';
export type Concern = { id: string; productId: string; type: string; details: string; date: string; status: 'Pending' | 'Under Review' | 'Resolved' };
type History = Record<string, string[]>;
type DemoState = {
  goal: Goal; applied: boolean; setGoal: (goal: Goal) => void; logApplication: () => void; ready: boolean;
  history: History; isAppliedToday: (id: string) => boolean; applyToday: (id: string) => void;
  concerns: Concern[]; addConcern: (c: Omit<Concern, 'id' | 'date' | 'status'>) => void;
};
const KEY = 'bodywise-demo-v2';
const DemoContext = createContext<DemoState | null>(null);
export function localDay() { return dayKey(); }
function seedHistory(): History { return Object.fromEntries(PRODUCTS.map(p => [p.id, p.seedOffsets.map(o => dayKey(daysAgo(o)))])); }
export function DemoProvider({ children }: { children: ReactNode }) {
  const [goal, setGoal] = useState<Goal>('Hair');
  const [history, setHistory] = useState<History>(seedHistory);
  const [concerns, setConcerns] = useState<Concern[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => { try { const s = JSON.parse(localStorage.getItem(KEY) || '{}'); if (['Hair', 'Skin', 'Body'].includes(s.goal)) setGoal(s.goal); if (s.history) setHistory({ ...seedHistory(), ...s.history }); if (Array.isArray(s.concerns)) setConcerns(s.concerns); } catch { /* defaults */ } setReady(true); }, []);
  useEffect(() => { if (ready) { try { localStorage.setItem(KEY, JSON.stringify({ goal, history, concerns })); } catch { /* session only */ } } }, [goal, history, concerns, ready]);
  const isAppliedToday = (id: string) => (history[id] ?? []).includes(dayKey());
  const applyToday = (id: string) => setHistory(h => (h[id] ?? []).includes(dayKey()) ? h : { ...h, [id]: [...(h[id] ?? []), dayKey()] });
  const addConcern: DemoState['addConcern'] = c => setConcerns(list => [{ ...c, id: crypto.randomUUID(), date: new Date().toISOString(), status: 'Pending' }, ...list]);
  return <DemoContext.Provider value={{ goal, setGoal, ready, history, isAppliedToday, applyToday, concerns, addConcern, applied: isAppliedToday('hair-growth-roll-on'), logApplication: () => applyToday('hair-growth-roll-on') }}>{children}</DemoContext.Provider>;
}
export function useDemo() { const value = useContext(DemoContext); if (!value) throw new Error('Demo provider is required'); return value; }
