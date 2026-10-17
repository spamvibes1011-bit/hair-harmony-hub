import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, Camera, ChevronRight, Clock, Headphones, MessageCircle, Phone, ShieldAlert, Stethoscope, Video, X, CalendarDays, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pageHead } from '@/components/bodywise/placeholder';
import { useDemo, historyOf, isConcerning, NEXT, type Concern } from '@/components/bodywise/demo-state';
import { PRODUCTS, CONCERN_TYPES, getProduct, fmt } from '@/components/bodywise/products';

type Search = { concern?: string | undefined; appointment?: boolean | undefined; product?: string | undefined; symptom?: string | undefined; details?: string | undefined };
export const Route = createFileRoute('/support')({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): Search => ({
    concern: typeof s['concern'] === 'string' ? s['concern'] : undefined,
    appointment: s['appointment'] === true || s['appointment'] === 'true' ? true : undefined,
    product: typeof s['product'] === 'string' ? s['product'] : undefined,
    symptom: typeof s['symptom'] === 'string' ? s['symptom'] : undefined,
    details: typeof s['details'] === 'string' ? s['details'] : undefined,
  }),
  head: () => pageHead('Concerns & Support', 'Report product issues, track their status and reach Be Bodywise care support.'),
  component: Support,
});

const statusCls = (s: Concern['status']) => s === 'Pending' ? 'pending' : s === 'Under Review' ? 'review' : '';
const when = (d: string) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

function shrink(file: File): Promise<string> {
  return new Promise((res, rej) => { const r = new FileReader(); r.onerror = rej; r.onload = () => { const img = new Image(); img.onerror = rej; img.onload = () => { const s = Math.min(1, 640 / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = img.width * s; c.height = img.height * s; c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.7)); }; img.src = r.result as string; }; r.readAsDataURL(file); });
}

function Support() {
  const search = Route.useSearch(); const navigate = Route.useNavigate();
  const { concerns, addConcern, advanceConcern, ready } = useDemo();
  const prefilled = !!(search.product || search.symptom);
  const [open, setOpen] = useState(prefilled);
  const [productId, setProductId] = useState(search.product && getProduct(search.product) ? search.product : PRODUCTS[0]!.id);
  const [type, setType] = useState<string>(search.symptom && (CONCERN_TYPES as readonly string[]).includes(search.symptom) ? search.symptom : CONCERN_TYPES[0]);
  const [details, setDetails] = useState(search.details ?? '');
  const [severe, setSevere] = useState(false);
  const [photo, setPhoto] = useState<string>();
  const [err, setErr] = useState('');
  useEffect(() => { if (prefilled) setOpen(true); }, [prefilled]);
  const selected = concerns.find(c => c.id === search.concern);
  const urgent = concerns.filter(isConcerning);
  const symptomType = type === 'Irritation' || type === 'Increased shedding';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = addConcern({ productId, type, details: details.trim(), photo, severe: symptomType && severe, source: search.product ? 'journey' : 'support' });
    setOpen(false); setDetails(''); setPhoto(undefined); setSevere(false);
    navigate({ search: { concern: id } });
  };
  const onFile = async (f?: File) => { setErr(''); if (!f) return; if (!f.type.startsWith('image/')) return setErr('Please choose an image file.'); try { setPhoto(await shrink(f)); } catch { setErr('Could not read that photo.'); } };

  return <main className="page">
    <Button asChild variant="link" className="mb-5 p-0"><Link to="/"><ArrowLeft /> Back to Home</Link></Button>
    <div className="mb-6"><h1 className="text-2xl font-bold">Concerns & Support</h1><p className="mt-1 text-xs text-muted-foreground">Report a product issue, follow its progress and reach our care team.</p></div>

    {urgent.length > 0 && <section role="alert" className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
      <h2 className="flex items-center gap-2 text-sm font-bold text-destructive"><AlertTriangle size={16} /> Please pause your routine</h2>
      <p className="mt-2 text-xs leading-5">You reported {urgent.map(c => c.type.toLowerCase()).join(', ')}. Stop using the product and rinse the area with cool water. Daily application reminders are paused until your report is resolved.</p>
      <p className="mt-2 text-xs leading-5">Seek urgent medical care for swelling of the face, lips or eyes, difficulty breathing, blistering or spreading rash.</p>
    </section>}

    {search.appointment && <section className="panel mb-6"><div className="section-header"><div><h2 className="section-title">Your consultation</h2><p className="section-subtitle">Demo appointment</p></div><CalendarDays size={18} className="text-primary" /></div>
      <div className="consultation"><span className="doctor-avatar">RK</span><div><h3 className="text-sm font-bold">Dr. Riya Kapoor</h3><p className="mt-1 text-[11px] text-muted-foreground">Dermatologist</p></div></div>
      <div className="mt-4 space-y-2 border-t pt-4 text-xs"><p className="flex items-center gap-2"><Clock size={14} className="text-muted-foreground" /> Tomorrow · 11:00 AM · 20 min</p><p className="flex items-center gap-2 text-muted-foreground"><Video size={14} /> Video consultation</p><p className="flex items-center gap-2 text-muted-foreground"><MapPin size={14} /> Online · link shared 15 min before</p></div></section>}

    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        {selected && <section className="panel" aria-label="Report details">
          <div className="section-header"><div><h2 className="section-title">{selected.type}</h2><p className="section-subtitle">{getProduct(selected.productId)?.name} · Submitted {fmt(new Date(selected.date))}{selected.demo ? ' · Demo case' : ''}</p></div><Button size="icon" variant="ghost" aria-label="Close" onClick={() => navigate({ search: {} })}><X /></Button></div>
          {selected.details && <p className="text-xs leading-5">{selected.details}</p>}
          {selected.photo && <img src={selected.photo} alt="Attached to report" className="mt-3 max-h-56 rounded-xl object-cover" />}
          <h3 className="mt-5 mb-3 text-xs font-bold">Status history</h3>
          <ol className="space-y-3 border-l-2 border-border pl-4">{historyOf(selected).map((h, i) => <li key={i} className="relative"><span className="absolute -left-[23px] top-0.5 h-3 w-3 rounded-full bg-primary" /><div className="flex items-center gap-2"><span className={`status ${statusCls(h.status)}`}>{h.status}</span><span className="text-[10px] text-muted-foreground">{when(h.date)}</span></div><p className="mt-1 text-[11px] text-muted-foreground">{h.note}</p></li>)}</ol>
          <div className="mt-5 flex flex-wrap gap-2">
            {NEXT[selected.status] && <Button size="sm" variant="outline" className="text-xs" onClick={() => advanceConcern(selected.id)}>Simulate update → {NEXT[selected.status]}</Button>}
            <Button asChild size="sm" variant="ghost" className="text-xs"><Link to="/products/$id" params={{ id: selected.productId }}>View product <ChevronRight /></Link></Button>
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">Status updates are simulated in this demo.</p>
        </section>}

        <section className="panel">
          <div className="section-header"><div><h2 className="section-title">Report a concern</h2><p className="section-subtitle">{prefilled ? 'Prefilled from My Hair Journey — please review' : 'Tell us what happened'}</p></div><ShieldAlert size={18} className="text-primary" /></div>
          {open ? <form onSubmit={submit} className="space-y-4">
            <label className="block text-xs font-semibold">Product<select value={productId} onChange={e => setProductId(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3 text-xs font-normal">{PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
            <fieldset className="flex flex-wrap gap-2"><legend className="mb-2 text-xs font-semibold">Type of concern</legend>{CONCERN_TYPES.map(t => <Button type="button" key={t} size="sm" variant={type === t ? 'default' : 'outline'} aria-pressed={type === t} className="text-[11px]" onClick={() => setType(t)}>{t}</Button>)}</fieldset>
            <label className="block text-xs font-semibold">Details<textarea required maxLength={500} value={details} onChange={e => setDetails(e.target.value)} rows={3} className="mt-1.5 w-full rounded-lg border bg-background p-3 text-xs font-normal" placeholder="When did you notice it? Anything else we should know?" /></label>
            {symptomType && <label className="flex items-start gap-2 rounded-lg bg-warning-soft p-3 text-[11px] leading-4"><input type="checkbox" checked={severe} onChange={e => setSevere(e.target.checked)} className="mt-0.5" /> Symptoms are severe or getting worse (burning, swelling, oozing, spreading rash, sudden patchy loss)</label>}
            {symptomType && <p className="flex gap-2 text-[10px] leading-4 text-warning"><AlertTriangle size={14} className="shrink-0" /> Stop use if irritation occurs. If symptoms are severe, consult a qualified healthcare professional.</p>}
            <div><span className="text-xs font-semibold">Photo (optional)</span>
              {photo ? <div className="mt-1.5 flex items-center gap-3"><img src={photo} alt="Attachment preview" className="h-20 w-20 rounded-lg object-cover" /><Button type="button" size="sm" variant="ghost" onClick={() => setPhoto(undefined)}>Remove</Button></div>
                : <label className="mt-1.5 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed p-4 text-xs text-muted-foreground"><Camera size={16} /> Attach a photo<input type="file" accept="image/*" className="sr-only" onChange={e => onFile(e.target.files?.[0])} /></label>}
              {err && <p className="mt-1 text-[11px] text-destructive">{err}</p>}</div>
            <div className="flex gap-2"><Button type="submit" className="flex-1" disabled={!ready}>Submit concern</Button><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button></div>
          </form> : <Button className="w-full" onClick={() => setOpen(true)}><ShieldAlert /> Report a new concern</Button>}
        </section>

        <section className="panel"><div className="section-header"><div><h2 className="section-title">My reports</h2><p className="section-subtitle">{concerns.length} total · cases marked Demo are sample data</p></div></div>
          {concerns.length ? <ul>{concerns.map(c => <li key={c.id}><Link to="/support" search={{ concern: c.id }} className="issue-row"><div className="min-w-0"><h3 className="flex items-center gap-1.5 text-xs font-semibold">{isConcerning(c) && <AlertTriangle size={12} className="text-destructive" />}{c.type}</h3><p className="mt-1 text-[10px] text-muted-foreground">{getProduct(c.productId)?.name} · {fmt(new Date(c.date))}{c.demo ? ' · Demo' : ''}{c.photo ? ' · 📷' : ''}</p></div><span className={`status ${statusCls(c.status)}`}>{c.status}</span></Link></li>)}</ul>
            : <p className="py-6 text-center text-xs text-muted-foreground">No reports yet. We hope it stays that way.</p>}
        </section>
      </div>

      <div className="space-y-6">
        <section className="panel"><h2 className="section-title">Safety guidance</h2>
          <ul className="mt-3 space-y-2 text-xs leading-5 text-muted-foreground">
            <li>• Patch test before first use, and stop if redness, itching or burning occurs.</li>
            <li>• Some temporary shedding can happen early on, but sudden or patchy hair loss should be checked by a professional.</li>
            <li>• Keep products away from eyes; rinse with water if contact occurs.</li>
            <li>• Don't use a product past its expiry date or if it looks or smells different.</li>
          </ul>
          <p className="mt-3 text-[10px] text-muted-foreground">This app does not diagnose conditions or provide medical advice.</p>
        </section>
        <section className="panel"><h2 className="section-title">Professional support</h2><p className="section-subtitle mb-3">Demo contact options</p>
          <div className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start text-xs"><Link to="/support" search={{ appointment: true }}><Stethoscope /> Book a dermatologist consultation</Link></Button>
            <Button variant="outline" className="w-full justify-start text-xs" onClick={() => alert('Demo: chat would open here.')}><MessageCircle /> Chat with a care specialist</Button>
            <Button variant="outline" className="w-full justify-start text-xs" onClick={() => alert('Demo: care line 1800-000-0000 (not a real number).')}><Phone /> Call care line (demo)</Button>
          </div>
          <p className="mt-3 flex gap-2 text-[10px] leading-4 text-muted-foreground"><Headphones size={14} className="shrink-0" /> For emergencies, contact local emergency services immediately.</p>
        </section>
      </div>
    </div>
    
  </main>;
}
