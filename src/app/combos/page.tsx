import { redirect } from 'next/navigation';

export default function CombosPage() {
  redirect('/shop?type=COMBO');
}
