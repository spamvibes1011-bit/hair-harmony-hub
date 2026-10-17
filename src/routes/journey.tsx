import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { Camera, Check, ShieldAlert, Info, Images, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemo } from '@/components/bodywise/demo-state';
import { PRODUCTS, getProduct, daysAgo, dayKey, parseDay, fmt } from '@/components/bodywise/products';

type Entry = { id: string; productId: string; date: string; photo?: string | undefined; shedding: string; change: string; comfort: string; notes: string };
const KEY = 'bodywise-journey-v1';
const SHEDDING = ['Less than usual', 'About the same', 'More than usual'];
const CHANGES = ['No visible change yet', 'Slight change', 'Noticeable change'];
const COMFORT = ['Comfortable', 'Mild itch / dryness', 'Uncomfortable'];

function seed(): Entry[] {
  const mk = (o: number, s: number, c: number, f: number, n: string): Entry => ({ id: `seed-${o}`, productId: 'hair-growth-roll-on', date: dayKey(daysAgo(o)), shedding: SHEDDING[s]!, change: CHANGES[c]!, comfort: COMFORT[f]!, notes: n });
  return [mk(24, 2, 0, 0, 'First night with the roll-on. Light, non-greasy feel.'), mk(17, 1, 0, 1, 'Slight dryness near the parting.'), mk(10, 1, 0, 0, ''), mk(3, 0, 1, 0, 'Fewer strands in the shower this week.')];
}

async function shrink(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  const img = new Image(); img.src = url; await img.decode();
  const s = Math.min(1, 480 / Math.max(img.width, img.height));
  const c = document.createElement('canvas'); c.width = img.width * s; c.height = img.height * s;
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
  return c.toDataURL('image/jpeg', 0.7);
}

export const Route = createFileRoute('/journey')({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): { product?: string | undefined } => ({ product: typeof s['product'] === 'string' && getProduct(s['product']) ? s['product'] : undefined }),
  head: () => { const t = 'My Hair Journey | Be Bodywise'; const d = 'Track daily check-ins, photos and progress with your Be Bodywise hair products.'; return { meta: [{ title: t }, { name: 'description', content: d }, { property: 'og:title', content: t }, { property: 'og:description', content: d }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }; },
  component: Journey,
});

function Choice({ label, opts, value, set }: { label: string; opts: string[]; value: string; set: (v: string) => void }) {
  return <fieldset className="flex flex-wrap gap-2"><legend className="mb-2 text-xs font-semibold">{label}</legend>{opts.map(o => <Button type="button" key={o} size="sm" variant={value === o ? 'default' : 'outline'} aria-pressed={value === o} className="text-[11px]" onClick={() => set(o)}>{o}</Button>)}</fieldset>;
}

function Journey() {
  const { product } = Route.useSearch();
  const navigate = Route.useNavigate();
  const p = getProduct(product ?? 'hair-growth-roll-on')!;
  const { history } = useDemo();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState<string>();
  const [shedding, setShedding] = useState(SHEDDING[1]!);
  const [change, setChange] = useState(CHANGES[0]!);
  const [comfort, setComfort] = useState(COMFORT[0]!);
  const [notes, setNotes] = useState('');
  const [compare, setCompare] = useState<string[]>([]);

  useEffect(() => { try { const s = localStorage.getItem(KEY); setEntries(s ? JSON.parse(s) : seed()); } catch { setEntries(seed()); } setReady(true); }, []);
  useEffect(() => { if (!ready) return; try { localStorage.setItem(KEY, JSON.stringify(entries)); setError(''); } catch { setError('Storage is full — try removing older photos.'); } }, [entries, ready]);

  const mine = useMemo(() => entries.filter(e => e.productId === p.id).sort((a, b) => b.date.localeCompare(a.date)), [entries, p.id]);
  const today = dayKey();
  const todayEntry = mine.find(e => e.date === today);
  const log = history[p.id] ?? [];
  const start = daysAgo(p.startOffset);
  const consistency = Math.min(100, Math.round((log.length / (p.startOffset + 1)) * 100));
  const withPhotos = mine.filter(e => e.photo);
  const recent = mine.slice(0, 3), older = mine.slice(3, 6);
  const score = (list: Entry[], key: 'shedding', good: string) => list.filter(e => e[key] === good).length;
  const insights = [
    `You've used ${p.name} on ${log.length} of ${p.startOffset + 1} days (${consistency}%).`,
    older.length && score(recent, 'shedding', SHEDDING[0]!) > score(older, 'shedding', SHEDDING[0]!) ? 'You have logged "less shedding than usual" more often in recent check-ins.' : 'Your shedding observations look steady across recent check-ins.',
    mine.some(e => e.comfort === COMFORT[2]) ? 'You noted scalp discomfort recently — consider reporting a concern or pausing use.' : 'Scalp comfort has been reported as fine or mild.',
  ];

  const pickPhoto = async (f?: File) => { if (!f) return; try { setPhoto(await shrink(f)); } catch { setError('That image could not be read.'); } };
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: Entry = { id: todayEntry?.id ?? crypto.randomUUID(), productId: p.id, date: today, photo: photo ?? todayEntry?.photo, shedding, change, comfort, notes: notes.trim().slice(0, 500) };
    setEntries(list => [entry, ...list.filter(x => x.id !== entry.id)]);
    setPhoto(undefined); setNotes('');
  };
  const toggleCompare = (id: string) => setCompare(c => c.includes(id) ? c.filter(x => x !== id) : [...c, id].slice(-2));
  const pair = compare.map(id => mine.find(e => e.id === id)).filter(Boolean) as Entry[];

  return <main className="page">
    <div className="mb-6"><h1 className="text-2xl font-bold">My Hair Journey</h1><p className="mt-1 text-xs text-muted-foreground">Daily check-ins linked to your products.</p></div>
    <div className="mb-6 flex flex-wrap gap-2">{PRODUCTS.map(x => <Button key={x.id} size="sm" variant={x.id === p.id ? 'default' : 'outline'} className="text-[11px]" onClick={() => { setCompare([]); navigate({ search: { product: x.id } }); }}>{x.name}</Button>)}</div>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className="space-y-6">
        <section className="panel">
          <div className="flex items-center gap-4"><div className="product-image h-16 w-16 shrink-0 rounded-xl"><img src={p.image} width={1024} height={1024} alt={p.name} /></div><div><h2 className="section-title">{p.name}</h2><p className="section-subtitle">{p.frequency}</p></div></div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">{[['Started', fmt(start)], ['Days used', String(log.length)], ['Consistency', `${consistency}%`]].map(([k, v]) => <div key={k} className="rounded-xl bg-secondary p-3"><p className="text-base font-extrabold">{v}</p><p className="mt-1 text-[10px] text-muted-foreground">{k}</p></div>)}</div>
          <div className="mt-4 flex gap-2"><Button asChild variant="outline" className="flex-1 text-xs"><Link to="/products/$id" params={{ id: p.id }}>View product</Link></Button><Button asChild variant="outline" className="flex-1 text-xs"><Link to="/support" search={(() => { const e = mine[0]; const symptom = e?.comfort === COMFORT[2] || e?.comfort === COMFORT[1] ? 'Irritation' : e?.shedding === SHEDDING[2] ? 'Increased shedding' : undefined; return { product: p.id, symptom: symptom ?? 'Other', details: e ? `From check-in on ${e.date}: shedding ${e.shedding.toLowerCase()}; scalp ${e.comfort.toLowerCase()}; ${e.change.toLowerCase()}.${e.notes ? ' ' + e.notes : ''}` : undefined }; })()}><ShieldAlert /> Report a concern</Link></Button></div>
        </section>
        <section className="panel"><h2 className="section-title mb-1">Today's check-in</h2><p className="section-subtitle mb-4">{todayEntry ? 'Saved — submit again to update today.' : fmt(new Date())}</p>
          <form onSubmit={save} className="space-y-4">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed p-3 text-xs">
              {photo || todayEntry?.photo ? <img src={photo ?? todayEntry?.photo} alt="Today's scalp photo" className="h-14 w-14 rounded-lg object-cover" /> : <Camera size={20} className="text-primary" />}
              <span>{photo ? 'Photo ready — tap to change' : 'Add a photo (optional)'}</span>
              <input type="file" accept="image/*" className="sr-only" onChange={e => pickPhoto(e.target.files?.[0])} />
            </label>
            <Choice label="Shedding" opts={SHEDDING} value={shedding} set={setShedding} />
            <Choice label="Visible changes" opts={CHANGES} value={change} set={setChange} />
            <Choice label="Scalp comfort" opts={COMFORT} value={comfort} set={setComfort} />
            <label className="block text-xs font-semibold">Notes (optional)<textarea value={notes} maxLength={500} onChange={e => setNotes(e.target.value)} rows={2} className="mt-2 w-full rounded-lg border bg-background p-2 text-xs font-normal" placeholder="Anything you noticed today" /></label>
            {error && <p role="alert" className="text-[11px] text-destructive">{error}</p>}
            <Button type="submit" className="h-11 w-full" disabled={!ready}><Check /> Save check-in</Button>
          </form>
        </section>
        <section className="panel"><div className="section-header"><h2 className="section-title">Progress insights</h2><TrendingUp size={18} className="text-primary" /></div>
          <ul className="space-y-2">{insights.map(t => <li key={t} className="rounded-lg bg-secondary p-3 text-xs leading-5">{t}</li>)}</ul>
          <p className="mt-3 flex gap-2 text-[10px] leading-4 text-muted-foreground"><Info size={14} className="shrink-0" /> Based only on what you log. This isn't a diagnosis and results vary — see a dermatologist for medical advice.</p>
        </section>
      </div>
      <div className="space-y-6">
        <section className="panel"><div className="section-header"><div><h2 className="section-title">Compare photos</h2><p className="section-subtitle">Pick two photos in the timeline</p></div><Images size={18} className="text-primary" /></div>
          {pair.length === 2 ? <div className="grid grid-cols-2 gap-3">{[...pair].sort((a, b) => a.date.localeCompare(b.date)).map(e => <figure key={e.id}><img src={e.photo} alt={`Photo from ${e.date}`} className="aspect-square w-full rounded-xl object-cover" /><figcaption className="mt-1 text-center text-[11px] text-muted-foreground">{fmt(parseDay(e.date))}</figcaption></figure>)}</div>
            : <p className="rounded-lg bg-secondary p-4 text-center text-xs text-muted-foreground">{withPhotos.length < 2 ? 'Add photos to at least two check-ins to compare them side by side.' : `Select ${2 - pair.length} more photo${pair.length ? '' : 's'}.`}</p>}
          {pair.length > 0 && <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={() => setCompare([])}><X /> Clear</Button>}
        </section>
        <section className="panel"><h2 className="section-title mb-4">Timeline</h2>
          {log.length > 0 && <details className="mb-5 border-b pb-4"><summary className="cursor-pointer text-xs font-semibold text-primary">Application history · {log.length} days</summary><ul className="mt-3 max-h-48 space-y-2 overflow-auto">{[...log].sort().reverse().map(date => <li key={date} className="flex justify-between text-xs"><span>{fmt(parseDay(date))}</span><span className="flex items-center gap-1 text-primary"><Check size={12} />Applied</span></li>)}</ul></details>}
          {mine.length === 0 ? <p className="text-xs text-muted-foreground">No check-ins yet. Save your first one to start your timeline.</p> :
            <ol className="relative space-y-5 border-l-2 border-accent pl-5">{mine.map(e => <li key={e.id} className="relative">
              <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-primary" />
              <div className="flex items-baseline justify-between"><p className="text-xs font-bold">{fmt(parseDay(e.date))}</p><p className="text-[10px] text-muted-foreground">Day {Math.max(1, p.startOffset - Math.round((Date.now() - parseDay(e.date).getTime()) / 86400000) + 1)}</p></div>
              <div className="mt-2 flex gap-3">
                {e.photo && <button type="button" onClick={() => toggleCompare(e.id)} aria-pressed={compare.includes(e.id)} className={`shrink-0 rounded-lg ${compare.includes(e.id) ? 'ring-2 ring-primary' : ''}`}><img src={e.photo} alt={`Check-in photo ${e.date}`} className="h-16 w-16 rounded-lg object-cover" /></button>}
                <div className="space-y-1 text-[11px] leading-4"><p><b>Shedding:</b> {e.shedding}</p><p><b>Changes:</b> {e.change}</p><p><b>Scalp:</b> {e.comfort}</p>{e.notes && <p className="text-muted-foreground">“{e.notes}”</p>}</div>
              </div>
            </li>)}</ol>}
        </section>
      </div>
    </div>
  </main>;
}
