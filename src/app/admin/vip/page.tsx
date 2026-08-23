import { getVipCards } from '@/actions/vip';
import { VipCardsManager } from './VipCardsManager';

export const metadata = {
  title: 'Tarjetas VIP | Panel de Administración Klonfark',
  description: 'Gestión y emisión de tarjetas para clientes VIP.',
};

export default async function AdminVipPage() {
  const cards = await getVipCards();

  return (
    <div className="max-w-7xl mx-auto">
      <VipCardsManager initialCards={cards} />
    </div>
  );
}
