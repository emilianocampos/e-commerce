'use client';

import { useState } from 'react';
import { updateShippingStatus } from '@/actions/orders';
import { showToast } from 'nextjs-toast-notify';
import { useRouter } from 'next/navigation';

export function ShippingStatusSelect({ orderId, initialStatus }: { orderId: string, initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setIsLoading(true);
    try {
      await updateShippingStatus(orderId, newStatus);
      setStatus(newStatus);
      showToast.success('Estado actualizado', { position: 'top-center' });
      router.refresh();
    } catch (error: any) {
      showToast.error(error.message, { position: 'top-center' });
      setStatus(initialStatus); // revert
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={isLoading}
      className={`text-xs font-semibold uppercase tracking-wider rounded px-2.5 py-1.5 border transition-colors ${
        status === 'pending' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
        status === 'preparing' ? 'bg-orange-50 text-orange-800 border-orange-200' :
        status === 'shipped' ? 'bg-blue-50 text-blue-800 border-blue-200' :
        status === 'delivered' ? 'bg-green-50 text-green-800 border-green-200' :
        'bg-red-50 text-red-800 border-red-200'
      } outline-none focus:ring-2 focus:ring-zinc-900 cursor-pointer`}
    >
      <option value="pending">Pendiente</option>
      <option value="preparing">En Preparación</option>
      <option value="shipped">Enviado</option>
      <option value="delivered">Entregado</option>
      <option value="cancelled">Cancelado</option>
    </select>
  );
}
