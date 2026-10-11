'use client';

import { useState } from 'react';
import { RefreshCw, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { syncOrderPaymentStatus } from '@/actions/orders';
import { showToast } from 'nextjs-toast-notify';
import { useRouter } from 'next/navigation';

interface SyncPaymentButtonProps {
  orderId: string;
  status: string;
}

export function SyncPaymentButton({ orderId, status }: SyncPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const result = await syncOrderPaymentStatus(orderId, true);
      
      if (result.status === 'approved' || result.status === 'paid') {
        showToast.success('¡Pago confirmado en Mercado Pago! Estado actualizado a Aprobado.', { position: 'top-center' });
      } else if (result.status === 'cancelled') {
        showToast.info('Mercado Pago no registra cobro. Orden actualizada a Cancelada.', { position: 'top-center' });
      } else {
        showToast.info(result.message || 'Estado verificado con Mercado Pago.', { position: 'top-center' });
      }
      
      router.refresh();
    } catch (error: any) {
      showToast.error(error.message || 'Error al conectar con Mercado Pago', { position: 'top-center' });
    } finally {
      setIsLoading(false);
    }
  };

  const isApproved = status === 'approved' || status === 'paid';
  const isCancelled = status === 'cancelled' || status === 'rejected';

  return (
    <div className="space-y-2 mt-2">
      {/* Badge Visual de Estado */}
      <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
        isApproved 
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
          : isCancelled 
            ? 'bg-rose-50 border-rose-200 text-rose-800' 
            : 'bg-amber-50 border-amber-200 text-amber-800'
      }`}>
        <div className="flex items-center gap-2">
          {isApproved ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : isCancelled ? (
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          )}
          <div>
            <span className="text-xs font-black tracking-wide uppercase block">
              {isApproved ? 'Pago Aprobado y Acreditado' : isCancelled ? 'Compra Cancelada / No Pagada' : 'Pago Pendiente de Acreditación'}
            </span>
            <span className="text-[11px] opacity-80 block">
              {isApproved 
                ? 'El dinero se acreditó con éxito en Mercado Pago.' 
                : isCancelled 
                  ? 'El cliente no completó el pago o la tarjeta fue rechazada.' 
                  : 'Esperando confirmación de la pasarela.'}
            </span>
          </div>
        </div>
      </div>

      {/* Botón de Sincronización Manual con Mercado Pago */}
      <button
        onClick={handleSync}
        disabled={isLoading}
        type="button"
        className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
      >
        <RefreshCw size={13} className={isLoading ? 'animate-spin text-emerald-600' : 'text-zinc-500'} />
        <span>{isLoading ? 'Consultando Mercado Pago...' : 'Consultar estado real en Mercado Pago'}</span>
      </button>
    </div>
  );
}
