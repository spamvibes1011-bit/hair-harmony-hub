import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
export type Goal = 'Hair' | 'Skin' | 'Body';
type DemoState = { goal: Goal; applied: boolean; setGoal: (goal: Goal) => void; logApplication: () => void; ready: boolean };
const DemoContext = createContext<DemoState | null>(null);
export function localDay() { const date = new Date(); return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`; }
export function DemoProvider({ children }: { children: ReactNode }) {
 const [goal, setGoal] = useState<Goal>('Hair'); const [applied, setApplied] = useState(false); const [ready, setReady] = useState(false);
 useEffect(() => { try { const stored = JSON.parse(localStorage.getItem('bodywise-dashboard-demo') || '{}'); if (['Hair','Skin','Body'].includes(stored.goal)) setGoal(stored.goal); setApplied(stored.appliedDay === localDay()); } catch { /* use defaults */ } setReady(true); }, []);
 useEffect(() => { if (ready) { try { localStorage.setItem('bodywise-dashboard-demo', JSON.stringify({goal,appliedDay:applied ? localDay() : null})); } catch { /* session state still works */ } } }, [goal,applied,ready]);
 return <DemoContext.Provider value={{goal, applied,setGoal,logApplication:()=>setApplied(true),ready}}>{children}</DemoContext.Provider>;
}
export function useDemo() { const value=useContext(DemoContext); if(!value) throw new Error('Demo provider is required'); return value; }
