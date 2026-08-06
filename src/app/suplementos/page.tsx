import { redirect } from 'next/navigation';

export default function SuplementosPage() {
  redirect('/shop?type=SUPPLEMENT');
}
