import { redirect } from 'next/navigation';

export default function OfertasPage() {
  redirect('/shop?on_sale=true');
}
