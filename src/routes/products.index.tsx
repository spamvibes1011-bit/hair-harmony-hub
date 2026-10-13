import { createFileRoute } from '@tanstack/react-router';
import { Placeholder,pageHead } from '@/components/bodywise/placeholder';
export const Route=createFileRoute('/products/')({head:()=>pageHead('My Products','Your purchased Be Bodywise products and personal care routine.'),component:()=> <Placeholder title="My Products" kind="products"/>});
