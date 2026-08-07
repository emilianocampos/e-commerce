import Link from 'next/link';
import { XCircle, RefreshCw, ArrowLeft, ShieldAlert } from 'lucide-react';

export const metadata = {
  title: 'Pago No Completado | Dravenix',
  description: 'Hubo un inconveniente al procesar tu pago.',
};

export default function PagoFalloPage() {
  return (
    <div className="min-h-[80vh] bg-zinc-950 text-white flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl rounded-3xl p-6 sm:p-10 shadow-2xl shadow-rose-950/20 relative overflow-hidden text-center">
        {/* Glow de fondo rojo */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500 mb-6 shadow-lg shadow-rose-500/20">
          <XCircle className="w-10 h-10 stroke-[2.5]" />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          El pago no pudo ser completado
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-md mx-auto mb-6">
          Ocurrió un inconveniente durante el procesamiento del pago. No te preocupes, no se ha debitado ningún dinero de tu cuenta.
        </p>

        <div className="bg-rose-950/30 border border-rose-800/40 rounded-2xl p-4 mb-8 text-xs text-rose-300 text-left flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-200 mb-1">Posibles causas:</p>
            <ul className="list-disc list-inside text-zinc-400 space-y-1">
              <li>Fondos insuficientes o saldo no disponible.</li>
              <li>La tarjeta fue rechazada por el banco emisor.</li>
              <li>La operación fue cancelada antes de finalizar.</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/carrito"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar Pago
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 border border-zinc-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
