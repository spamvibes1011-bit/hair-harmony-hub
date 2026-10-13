import serum from '@/assets/roll-on.jpg';
import shampoo from '@/assets/shampoo.jpg';

export type Product = {
  id: string; name: string; image: string; size: string; frequency: string; goal: 'Hair';
  batch: string; manufactured: string; expiry: string; startOffset: number;
  instructions: string[]; seedOffsets: number[];
};

// Dates stay fixed (as printed on a pack); start/history are relative to today so the demo always looks current.
export const PRODUCTS: Product[] = [
  { id: 'hair-growth-roll-on', name: 'Hair Growth Roll-On Serum', image: serum, size: '60 ml', frequency: 'Once daily, preferably at night', goal: 'Hair',
    batch: 'BW-RS2604-118', manufactured: '2026-04-18', expiry: '2028-03-31', startOffset: 24,
    instructions: ['Part dry hair and glide the roll-on along the scalp, focusing on thinning areas.', 'Massage gently with fingertips for 1–2 minutes.', 'Leave on overnight; do not rinse. Avoid contact with eyes.', 'Patch test before first use. Stop if irritation occurs.'],
    seedOffsets: [1, 2, 3, 5, 6, 8, 9, 10, 11, 13, 14, 15, 17, 18, 20, 21, 23, 24] },
  { id: 'hair-fall-shampoo', name: 'Hair Fall Control Shampoo', image: shampoo, size: '250 ml', frequency: '3 times a week', goal: 'Hair',
    batch: 'BW-SH2605-042', manufactured: '2026-05-02', expiry: '2028-04-30', startOffset: 20,
    instructions: ['Wet hair thoroughly with lukewarm water.', 'Lather a coin-sized amount into the scalp for 60 seconds.', 'Rinse well. Follow with the roll-on serum on dry scalp.'],
    seedOffsets: [0, 2, 5, 7, 9, 12, 14, 16, 19] },
];

export const getProduct = (id: string) => PRODUCTS.find(p => p.id === id);

export function dayKey(d = new Date()) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
export function daysAgo(n: number) { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate() - n); }
export function parseDay(key: string) { const [y, m, d] = key.split('-').map(Number); return new Date(y!, m! - 1, d!); }
export function diffDays(a: Date, b: Date) { return Math.round((parseDay(dayKey(b)).getTime() - parseDay(dayKey(a)).getTime()) / 86400000); }
export const fmt = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const CONCERN_TYPES = ['Increased shedding', 'Irritation', 'Product discolouration', 'Packaging problem', 'Other'] as const;
