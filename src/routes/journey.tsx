import { createFileRoute } from '@tanstack/react-router';
import { Placeholder,pageHead } from '@/components/bodywise/placeholder';
export const Route=createFileRoute('/journey')({head:()=>pageHead('My Hair Journey','Your personal Be Bodywise hair-care journey.'),component:()=> <Placeholder title="My Hair Journey" kind="journey"/>});
