import { useEffect, useRef, useState } from 'react';
import { Camera, Plus, Package, Square } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { CATALOG } from './catalog-data';
import { productNumber, resolveProductNumber } from './product-numbers';
import { useDemo } from './demo-state';

export function AddProduct() {
  const { ownedIds, addProduct, ready } = useDemo();
  const [open, setOpen] = useState(false);
  const [number, setNumber] = useState('');
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (!open || !scanning) return;
    let cancelled = false;
    let controls: { stop: () => void } | undefined;
    async function start() {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser');
        if (cancelled || !video.current) return;
        const reader = new BrowserMultiFormatReader();
        controls = await reader.decodeFromConstraints({ video: { facingMode: { ideal: 'environment' } }, audio: false }, video.current, result => {
          if (!result || cancelled) return;
          setNumber(result.getText()); setError(''); setScanning(false);
        });
        if (cancelled) controls.stop();
      } catch {
        if (!cancelled) { setError('Camera unavailable or permission denied. Enter the product number instead.'); setScanning(false); }
      }
    }
    void start();
    return () => { cancelled = true; controls?.stop(); };
  }, [open, scanning]);
  const id = resolveProductNumber(number);
  const item = CATALOG.find(p => p.id === id);
  const owned = !!id && ownedIds.includes(id);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!item) { setError('Product number not recognised. Real barcode matching needs your company’s product list.'); return; }
    if (owned) { setError('This product is already in My Products.'); return; }
    addProduct(item.id); toast.success(`${item.name} added`); setOpen(false);
  }
  return <Dialog open={open} onOpenChange={value => { setOpen(value); setScanning(false); setError(''); setNumber(''); }}>
    <DialogTrigger asChild><Button size="icon" aria-label="Add product" title="Add product" disabled={!ready}><Plus /></Button></DialogTrigger>
    <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg">
      <DialogHeader><DialogTitle>Add a product</DialogTitle><DialogDescription>Scan barcode or enter product number</DialogDescription></DialogHeader>
      <Button variant="outline" onClick={() => { setError(''); setScanning(!scanning); }}>{scanning ? <Square /> : <Camera />}{scanning ? 'Stop camera' : 'Scan barcode'}</Button>
      {scanning && <video ref={video} muted playsInline className="aspect-[4/3] w-full rounded-lg bg-secondary object-cover" aria-label="Barcode camera" />}
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-xs font-semibold" htmlFor="product-number">Product number</label>
        <Input id="product-number" inputMode="numeric" value={number} onChange={e => { setNumber(e.target.value); setError(''); }} required />
        {item && <div className="flex items-center gap-3 border-y py-3"><Package size={22} className="shrink-0 text-primary" /><div><p className="text-sm font-semibold">{item.name}</p><p className="text-xs text-muted-foreground">{item.size} · {owned ? 'Already added' : item.goal}</p></div></div>}
        {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={owned || !ready}><Plus />Add to My Products</Button>
      </form>
      <details className="border-t pt-3 text-xs"><summary className="cursor-pointer font-semibold">Demo product numbers</summary><p className="my-3 leading-5 text-muted-foreground">These numbers are for the demo only, not verified company barcodes.</p><ul className="space-y-2">{CATALOG.map(p => <li key={p.id} className="flex justify-between gap-3"><span>{p.name}</span><span className="font-semibold">{productNumber(p.id)}</span></li>)}</ul></details>
    </DialogContent>
  </Dialog>;
}