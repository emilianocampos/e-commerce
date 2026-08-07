import Link from 'next/link';
import { Clock, ShoppingBag, ArrowLeft, Info } from 'lucide-react';
import { ClearCartOnSuccess } from '@/components/ClearCartOnSuccess';

export const metadata = {
  title: 'Pago Pendiente | Dravenix',
  description: 'Tu pago está en proceso de acreditación.',
};

export default function PagoPendientePage() {
  return (
    <div className="min-h-[80vh] bg-zinc-950 text-white flex items-center justify-center py-12 px-4">
      <ClearCartOnSuccess />

      <div className="w-full max-w-xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl rounded-3xl p-6 sm:p-10 shadow-2xl shadow-amber-950/20 relative overflow-hidden text-center">
        {/* Glow de fondo ámbar */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-6 shadow-lg shadow-amber-500/20">
          <Clock className="w-10 h-10 stroke-[2.5]" />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          Tu pago está en proceso
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-md mx-auto mb-6">
          Tu pago quedó pendiente de acreditación. Si abonaste mediante un cupón de Rapipago/PagoFácil o transferencia bancaria, la acreditación puede demorar hasta 24-48 hs hábiles.
        </p>

        <div className="bg-amber-950/30 border border-amber-800/40 rounded-2xl p-4 mb-8 text-xs text-amber-300 text-left flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-200 mb-1">¿Qué sucede ahora?</p>
            <p className="text-zinc-400">
              Tan pronto como Mercado Pago nos notifique la acreditación de tu pago, procesaremos inmediatamente tu pedido y te enviaremos la confirmación por e-mail.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/mis-pedidos"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <ShoppingBag className="w-4 h-4" />
            Ver Mis Pedidos
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 border border-zinc-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la Tienda
          </Link>
        </div>
      </div>
    </div>
  );
}
