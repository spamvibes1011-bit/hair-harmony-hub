import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { pageHead } from '@/components/bodywise/placeholder';
import { CATALOG, CatalogGrid } from '@/components/bodywise/catalog';

export const Route = createFileRoute('/shop')({ ssr: false, head: () => pageHead('All Products', 'Browse the full Be Bodywise range of hair, skin and body care products.'), component: ShopPage });

function ShopPage() {
  const [filter, setFilter] = useState<'All' | 'Hair' | 'Skin' | 'Body'>('All');
  const items = filter === 'All' ? CATALOG : CATALOG.filter(p => p.goal === filter);
  return <main className="page">
    <div className="greeting"><h1>All Products</h1><p>The complete Be Bodywise range. Demo catalogue — prices are illustrative.</p></div>
    <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter by goal">{(['All', 'Hair', 'Skin', 'Body'] as const).map(g => <Button key={g} size="sm" variant={filter === g ? 'default' : 'outline'} aria-pressed={filter === g} onClick={() => setFilter(g)}>{g}</Button>)}</div>
    <CatalogGrid items={items} />
  </main>;
}
