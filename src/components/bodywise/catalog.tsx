import { Link } from '@tanstack/react-router';
import { Droplets, Sparkles, Heart, ChevronRight, Check } from 'lucide-react';
import type { Goal } from './demo-state';
import { useDemo } from './demo-state';
import { CATALOG, type CatalogItem } from './catalog-data';
export { CATALOG } from './catalog-data';
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
