import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowLeft, Check, CalendarDays, ShieldAlert, ChartNoAxesCombined, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemo } from '@/components/bodywise/demo-state';
import { getProduct, parseDay, diffDays, daysAgo, fmt, CONCERN_TYPES } from '@/components/bodywise/products';

export const Route = createFileRoute('/products/$id')({
  loader: ({ params }) => { const p = getProduct(params.id); if (!p) throw notFound(); return { name: p.name }; },
  head: ({ loaderData }) => { const t = `${loaderData?.name ?? 'Product'} | Be Bodywise`; const d = 'Batch details, usage instructions and your application history.'; return { meta: [{ title: t }, { name: 'description', content: d }, { property: 'og:title', content: t }, { property: 'og:description', content: d }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }; },
  notFoundComponent: () => <main className="page text-center"><h1 className="text-2xl font-bold">Product not found</h1><Button asChild className="mt-6"><Link to="/products">Back to My Products</Link></Button></main>,
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams(); const p = getProduct(id)!;
  const { history, isAppliedToday, applyToday, ready, concerns, addConcern } = useDemo();
  const [open, setOpen] = useState(false); const [type, setType] = useState<string>(CONCERN_TYPES[0]); const [details, setDetails] = useState(''); const [sent, setSent] = useState(false);
  const today = new Date(); const expiry = parseDay(p.expiry); const left = diffDays(today, expiry);
  const start = daysAgo(p.startOffset); const log = [...(history[p.id] ?? [])].sort().reverse(); const done = isAppliedToday(p.id);
  const mine = concerns.filter(c => c.productId === p.id);
  const submit = (e: React.FormEvent) => { e.preventDefault(); addConcern({ productId: p.id, type, details: details.trim() }); setDetails(''); setOpen(false); setSent(true); };
  const Row = ({ k, v }: { k: string; v: string }) => <div className="flex justify-between gap-3 border-b py-2.5 text-xs last:border-0"><span className="text-muted-foreground">{k}</span><span className="text-right font-semibold">{v}</span></div>;

  return <main className="page">
    <Button asChild variant="link" className="mb-5 p-0"><Link to="/products"><ArrowLeft /> My Products</Link></Button>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
      <div className="space-y-6">
        <section className="panel"><div className="product-image h-64 rounded-xl"><img src={p.image} width={1024} height={1024} alt={`Be Bodywise ${p.name}`} /></div>
          <h1 className="mt-5 text-2xl font-bold">{p.name}</h1><p className="mt-1 text-xs text-muted-foreground">{p.size} · {p.frequency}</p>
          <Button className="mt-5 h-11 w-full" variant={done ? 'secondary' : 'default'} disabled={done || !ready} onClick={() => applyToday(p.id)}><Check /> {done ? 'Applied today' : 'Apply Today'}</Button>
          {done && <p role="status" className="mt-2 text-center text-[11px] text-primary">Saved. Your dashboard tracker is updated.</p>}
        </section>
        <section className="panel"><h2 className="section-title mb-3">Pack details</h2>
          <Row k="Batch number" v={p.batch} /><Row k="Manufactured" v={fmt(parseDay(p.manufactured))} /><Row k="Expiry" v={fmt(expiry)} />
          <Row k="Days until expiry" v={left > 0 ? `${left} days` : 'Expired — do not use'} />
          <p className="mt-3 flex gap-2 rounded-lg bg-secondary p-3 text-[10px] leading-4 text-muted-foreground"><Info size={14} className="shrink-0" /> Demo data only. Batch details are simulated for illustration and do not verify or authenticate a real product.</p>
        </section>
      </div>
      <div className="space-y-6">
        <section className="panel"><h2 className="section-title">How to use</h2><p className="section-subtitle mb-4">Recommended: {p.frequency}</p>
          <ol className="space-y-3">{p.instructions.map((s, i) => <li key={i} className="flex gap-3 text-xs leading-5"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-primary">{i + 1}</span>{s}</li>)}</ol>
        </section>
        <section className="panel"><div className="section-header"><div><h2 className="section-title">Usage journey</h2><p className="section-subtitle">Every application counts</p></div><CalendarDays size={18} className="text-primary" /></div>
          <div className="grid grid-cols-3 gap-3 text-center">{[['Started', fmt(start)], ['Days since start', String(p.startOffset)], ['Application days', String(log.length)]].map(([k, v]) => <div key={k} className="rounded-xl bg-secondary p-3"><p className="text-base font-extrabold">{v}</p><p className="mt-1 text-[10px] text-muted-foreground">{k}</p></div>)}</div>
          <h3 className="mt-5 mb-2 text-xs font-bold">Application history</h3>
          <ul className="max-h-48 space-y-1 overflow-auto pr-1">{log.length ? log.map(d => <li key={d} className="flex items-center justify-between rounded-md px-2 py-1.5 text-xs odd:bg-secondary"><span>{parseDay(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span><span className="status"><Check size={11} /> Applied</span></li>) : <li className="text-xs text-muted-foreground">No applications logged yet.</li>}</ul>
          <Button asChild variant="outline" className="mt-5 w-full text-xs"><Link to="/journey" search={{ product: p.id }}><ChartNoAxesCombined /> View my hair journey</Link></Button>
        </section>
        <section className="panel"><div className="section-header"><div><h2 className="section-title">Something not right?</h2><p className="section-subtitle">Tell us and we’ll look into it</p></div><ShieldAlert size={18} className="text-primary" /></div>
          {sent && <p role="status" className="mb-3 rounded-lg bg-accent p-3 text-xs text-primary">Concern submitted. Status: Pending.</p>}
          {open ? <form onSubmit={submit} className="space-y-3">
            <fieldset className="flex flex-wrap gap-2"><legend className="mb-2 text-xs font-semibold">Type of concern</legend>{CONCERN_TYPES.map(t => <Button type="button" key={t} size="sm" variant={type === t ? 'default' : 'outline'} aria-pressed={type === t} className="text-[11px]" onClick={() => setType(t)}>{t}</Button>)}</fieldset>
            <label className="block text-xs font-semibold">Details<textarea required maxLength={500} value={details} onChange={e => setDetails(e.target.value)} rows={3} className="mt-1.5 w-full rounded-lg border bg-background p-3 text-xs font-normal" placeholder="When did you notice it? Anything else we should know?" /></label>
            {(type === 'Irritation' || type === 'Increased shedding') && <p className="flex gap-2 text-[10px] leading-4 text-warning"><AlertTriangle size={14} className="shrink-0" /> If symptoms are severe, stop use and consult a qualified healthcare professional.</p>}
            <div className="flex gap-2"><Button type="submit" className="flex-1">Submit concern</Button><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button></div>
          </form> : <Button variant="outline" className="w-full" onClick={() => { setOpen(true); setSent(false); }}><ShieldAlert /> Report a Concern</Button>}
          {mine.length > 0 && <ul className="mt-4">{mine.map(c => <li key={c.id} className="issue-row"><div><h3 className="text-xs font-semibold">{c.type}</h3><p className="mt-1 text-[10px] text-muted-foreground">{fmt(new Date(c.date))} · {c.details}</p></div><span className="status pending">{c.status}</span></li>)}</ul>}
        </section>
      </div>
    </div>
  </main>;
}
