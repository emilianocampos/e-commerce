import Link from 'next/link';
import Image from 'next/image';
import { getOrderById } from '@/actions/orders';
import { formatCurrency } from '@/lib/utils';
import { CheckCircle2, ShoppingBag, ArrowLeft, PackageCheck, Mail, ShieldCheck } from 'lucide-react';
import { ClearCartOnSuccess } from '@/components/ClearCartOnSuccess';

export const metadata = {
  title: '¡Pago Exitoso! | Dravenix',
  description: 'Tu compra ha sido procesada con éxito en Dravenix.',
};

interface SuccessPageProps {
  searchParams: Promise<{
    external_reference?: string;
    payment_id?: string;
    collection_id?: string;
    status?: string;
    collection_status?: string;
  }>;
}

export default async function PagoExitoPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const orderId = params.external_reference;
  const mpPaymentId = params.payment_id || params.collection_id;

  let order = null;
  if (orderId) {
    order = await getOrderById(orderId);
  }

  return (
    <div className="min-h-[80vh] bg-zinc-950 text-white flex items-center justify-center py-12 px-4">
      {/* Resetea el carrito local */}
      <ClearCartOnSuccess />

      <div className="w-full max-w-2xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl rounded-3xl p-6 sm:p-10 shadow-2xl shadow-emerald-950/20 relative overflow-hidden">
        {/* Glow de fondo verde */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header de Éxito */}
        <div className="text-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-6 shadow-lg shadow-emerald-500/20 animate-bounce-short">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            ¡Pago confirmado con éxito!
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg max-w-md mx-auto">
            ¡Muchas gracias por tu compra! Ya estamos preparando tu pedido para despacharlo lo antes posible.
          </p>
        </div>

        {/* Detalles de la Transacción */}
        <div className="mt-8 pt-6 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-zinc-850/60 rounded-2xl p-4 border border-zinc-800">
            <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block mb-1">
              Referencia del Pedido
            </span>
            <span className="font-mono text-zinc-200 font-semibold text-base break-all">
              {orderId ? `#${orderId.slice(0, 8).toUpperCase()}` : '#COMPRA-OK'}
            </span>
          </div>

          {mpPaymentId && (
            <div className="bg-zinc-850/60 rounded-2xl p-4 border border-zinc-800">
              <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block mb-1">
                ID de Pago Mercado Pago
              </span>
              <span className="font-mono text-emerald-400 font-semibold text-base">
                #{mpPaymentId}
              </span>
            </div>
          )}
        </div>

        {/* Resumen de Productos de la Orden si existe */}
        {order && order.order_items && order.order_items.length > 0 && (
          <div className="mt-6 bg-zinc-950/60 rounded-2xl p-5 border border-zinc-800/80">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-emerald-400" />
              Detalle de los productos comprados
            </h3>

            <div className="divide-y divide-zinc-800/60 max-h-60 overflow-y-auto pr-1">
              {order.order_items.map((item: any) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
                      {item.product?.image ? (
                        <Image src={item.product.image} alt={item.product.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-500">Sin foto</div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-zinc-200 line-clamp-1">{item.product?.title || 'Producto'}</h4>
                      <p className="text-xs text-zinc-400">
                        Cantidad: {item.quantity} {item.selected_size ? `| Talle: ${item.selected_size}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-sm text-zinc-200">
                    {formatCurrency(item.unit_price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between items-center text-sm font-bold">
              <span className="text-zinc-400">Total pagado</span>
              <span className="text-emerald-400 text-lg">{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        )}

        {/* Banner Informativo */}
        <div className="mt-6 bg-emerald-950/30 border border-emerald-800/40 rounded-2xl p-4 flex items-start gap-3.5">
          <Mail className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-zinc-300 space-y-1">
            <p className="font-semibold text-emerald-300">Te mantendremos informado</p>
            <p className="text-zinc-400">
              Enviamos la confirmación a tu e-mail. Podés realizar el seguimiento de tu paquete desde tu perfil.
            </p>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/mis-pedidos"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <ShoppingBag className="w-4 h-4" />
            Ver Mis Pedidos
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 border border-zinc-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Seguir Comprando
          </Link>
        </div>

        <div className="mt-6 text-center flex items-center justify-center gap-1.5 text-xs text-zinc-500">
          <ShieldCheck className="w-4 h-4 text-zinc-400" />
          <span>Transacción encriptada y procesada de forma segura por Mercado Pago</span>
        </div>
      </div>
    </div>
  );
}
