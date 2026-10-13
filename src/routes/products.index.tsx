import { createFileRoute, Link } from '@tanstack/react-router';
import { Check, Clock, ChevronRight } from 'lucide-react';
import { pageHead } from '@/components/bodywise/placeholder';
import { useDemo } from '@/components/bodywise/demo-state';
import { PRODUCTS } from '@/components/bodywise/products';

export const Route = createFileRoute('/products/')({ head: () => pageHead('My Products', 'Your purchased Be Bodywise products and personal care routine.'), component: ProductsPage });

function ProductsPage() {
  const { isAppliedToday, history } = useDemo();
  return <main className="page">
    <div className="greeting"><h1>My Products</h1><p>Your purchased products and today’s care status.</p></div>
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {PRODUCTS.map(p => { const done = isAppliedToday(p.id); return <Link key={p.id} to="/products/$id" params={{ id: p.id }} className="product-card block bg-card transition-shadow hover:shadow-md">
        <div className="product-image"><img src={p.image} width={1024} height={1024} alt={`Be Bodywise ${p.name}`} loading="lazy" /><span className={`status absolute right-2 top-2 ${done ? '' : 'pending'}`}>{done ? <Check size={11} /> : <Clock size={11} />} {done ? 'Applied today' : 'To Be Applied'}</span></div>
        <div className="product-body"><h3>{p.name}</h3><p>{p.size} · {p.frequency}</p><p className="mt-3 flex items-center justify-between text-primary"><span>{(history[p.id] ?? []).length} application days</span><ChevronRight size={14} /></p></div>
      </Link>; })}
    </div>
  </main>;
}
