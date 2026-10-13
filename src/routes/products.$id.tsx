import { createFileRoute } from '@tanstack/react-router';
import { Placeholder,pageHead } from '@/components/bodywise/placeholder';
export const Route=createFileRoute('/products/$id')({head:()=>pageHead('Product Details','Your Be Bodywise product details and daily care.'),component:Product});
function Product(){const {id}=Route.useParams();return <Placeholder title={id==='hair-growth-roll-on'?'Hair Growth Roll-On Serum':'Hair Fall Control Shampoo'} kind="products" detail="Product details and usage history"/>;}
