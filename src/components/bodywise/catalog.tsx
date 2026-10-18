import { Link } from '@tanstack/react-router';
import { Droplets, Sparkles, Heart, ChevronRight, Check } from 'lucide-react';
import serum from '@/assets/roll-on.jpg';
import shampoo from '@/assets/shampoo.jpg';
import type { Goal } from './demo-state';

export type CatalogItem = { id: string; name: string; goal: Goal; size: string; price: number; blurb: string; image?: string; owned?: boolean };

// Demo catalogue — names and prices are illustrative.
export const CATALOG: CatalogItem[] = [
  { id: 'hair-growth-roll-on', name: 'Hair Growth Roll-On Serum', goal: 'Hair', size: '60 ml', price: 649, blurb: 'Targets thinning areas with a no-mess roller.', image: serum, owned: true },
  { id: 'hair-fall-shampoo', name: 'Hair Fall Control Shampoo', goal: 'Hair', size: '250 ml', price: 399, blurb: 'Gentle cleanse that reduces breakage.', image: shampoo, owned: true },
  { id: 'biotin-gummies', name: 'Biotin Hair Gummies', goal: 'Hair', size: '30 gummies', price: 599, blurb: 'Daily biotin and zinc for stronger strands.' },
  { id: 'onion-hair-oil', name: 'Onion Hair Oil', goal: 'Hair', size: '100 ml', price: 349, blurb: 'Lightweight pre-wash scalp oil.' },
  { id: 'anti-dandruff-shampoo', name: 'Anti-Dandruff Shampoo', goal: 'Hair', size: '200 ml', price: 449, blurb: 'Calms flakes and itchy scalp.' },
  { id: 'hair-conditioner', name: 'Hair Repair Conditioner', goal: 'Hair', size: '200 ml', price: 379, blurb: 'Smooths and detangles after every wash.' },
  { id: 'salicylic-face-wash', name: '2% Salicylic Acid Face Wash', goal: 'Skin', size: '100 ml', price: 349, blurb: 'Clears pores and controls oil.' },
  { id: 'vitamin-c-serum', name: '10% Vitamin C Face Serum', goal: 'Skin', size: '30 ml', price: 599, blurb: 'Brightens dull skin and evens tone.' },
  { id: 'niacinamide-serum', name: '5% Niacinamide Serum', goal: 'Skin', size: '30 ml', price: 549, blurb: 'Refines pores and texture.' },
  { id: 'spf-sunscreen', name: 'SPF 50 Gel Sunscreen', goal: 'Skin', size: '50 g', price: 449, blurb: 'Lightweight daily sun protection.' },
  { id: 'body-lotion', name: 'Ceramide Body Lotion', goal: 'Body', size: '200 ml', price: 399, blurb: 'Long-lasting hydration for dry skin.' },
  { id: 'body-wash', name: 'Glycolic Acid Body Wash', goal: 'Body', size: '250 ml', price: 449, blurb: 'Smooths rough, bumpy skin.' },
  { id: 'underarm-roll-on', name: 'Underarm Brightening Roll-On', goal: 'Body', size: '50 ml', price: 499, blurb: 'Evens tone with gentle actives.' },
  { id: 'pcos-gummies', name: 'PCOS Balance Gummies', goal: 'Body', size: '30 gummies', price: 699, blurb: 'Inositol support for hormonal balance.' },
];

const ICONS = { Hair: Droplets, Skin: Sparkles, Body: Heart };

export function CatalogGrid({ items }: { items: CatalogItem[] }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map(p => { const Icon = ICONS[p.goal]; return <article key={p.id} className="product-card bg-card">
    <div className="product-image">{p.image ? <img src={p.image} width={1024} height={1024} alt={`Be Bodywise ${p.name}`} loading="lazy" /> : <div className="flex h-full w-full items-center justify-center bg-accent text-primary"><Icon size={36} /></div>}{p.owned && <span className="status absolute right-2 top-2"><Check size={11} /> Owned</span>}</div>
    <div className="product-body"><p className="text-[10px] font-semibold uppercase text-primary">{p.goal}</p><h3>{p.name}</h3><p>{p.size} · ₹{p.price}</p><p className="mt-2 text-[11px] leading-5 text-muted-foreground">{p.blurb}</p>
      {p.owned && <Link to="/products/$id" params={{ id: p.id }} className="mt-3 flex items-center gap-1 text-xs text-primary">View my product <ChevronRight size={13} /></Link>}</div>
  </article>; })}</div>;
}

export function GoalCatalog({ goal }: { goal: Goal }) {
  const items = CATALOG.filter(p => p.goal === goal);
  return <section className="panel"><div className="section-header"><div><h2 className="section-title">All Be Bodywise {goal.toLowerCase()} products <span className="ml-1 text-xs font-normal text-muted-foreground">({items.length})</span></h2><p className="section-subtitle">Our full {goal.toLowerCase()} care range</p></div><Link to="/shop" className="flex items-center text-xs text-primary">All products <ChevronRight size={14} /></Link></div><CatalogGrid items={items} /></section>;
}
