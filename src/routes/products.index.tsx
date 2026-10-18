import { createFileRoute, Link } from '@tanstack/react-router';
import { Check, Clock, ChevronRight, Package } from 'lucide-react';
import { pageHead } from '@/components/bodywise/placeholder';
import { useDemo } from '@/components/bodywise/demo-state';
import { getProduct } from '@/components/bodywise/products';
import { AddProduct } from '@/components/bodywise/add-product';

export const Route = createFileRoute('/products/')({ head: () => pageHead('My Products', 'Your purchased Be Bodywise products and personal care routine.'), component: ProductsPage });

function ProductsPage() {
  const { isAppliedToday, history, ownedIds } = useDemo();
  const products = ownedIds.map(getProduct).filter(p => p !== undefined);
  return <main className="page">
    <div className="greeting flex items-center justify-between gap-3"><div><h1>My Products</h1><p>Your purchased products and today’s care status.</p></div><AddProduct /></div>
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map(p => { const done = isAppliedToday(p.id); return <Link key={p.id} to="/products/$id" params={{ id: p.id }} className="product-card block bg-card transition-shadow hover:shadow-md">
        <div className="product-image">{p.image ? <img src={p.image} width={1024} height={1024} alt={`Be Bodywise ${p.name}`} loading="lazy" /> : <div className="flex h-full items-center justify-center bg-accent text-primary"><Package size={36} /></div>}<span className={`status absolute right-2 top-2 ${done ? '' : 'pending'}`}>{done ? <Check size={11} /> : <Clock size={11} />} {done ? 'Applied today' : 'To Be Applied'}</span></div>
        <div className="product-body"><h3>{p.name}</h3><p>{p.size} · {p.frequency}</p><p className="mt-3 flex items-center justify-between text-primary"><span>{(history[p.id] ?? []).length} application days</span><ChevronRight size={14} /></p></div>
      </Link>; })}
    </div>
  </main>;
}
