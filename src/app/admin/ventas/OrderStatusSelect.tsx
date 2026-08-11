'use client';

import { useState } from 'react';
import { updateOrderStatus } from '@/actions/orders';
import { showToast } from 'nextjs-toast-notify';
import { useRouter } from 'next/navigation';

export function OrderStatusSelect({ orderId, initialStatus }: { orderId: string, initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus || 'pending');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setIsLoading(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      setStatus(newStatus);
      showToast.success('Estado de compra actualizado', { position: 'top-center' });
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
      className={`text-xs font-bold uppercase tracking-wider rounded px-2.5 py-1.5 border transition-colors ${
        status === 'approved' || status === 'paid' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
        status === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-300' :
        status === 'rejected' || status === 'cancelled' ? 'bg-rose-50 text-rose-800 border-rose-300' :
        'bg-zinc-100 text-zinc-700 border-zinc-300'
      } outline-none focus:ring-2 focus:ring-zinc-900 cursor-pointer`}
    >
      <option value="pending">⏳ Pendiente</option>
      <option value="approved">✅ Aprobado / Pagado</option>
      <option value="rejected">❌ Rechazado</option>
      <option value="cancelled">🚫 Cancelado</option>
    </select>
  );
}
