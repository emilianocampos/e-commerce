import Link from 'next/link';
import Image from 'next/image';
import { getOrderById } from '@/actions/orders';
import { getStoreSettings } from '@/actions/settings';
import { formatCurrency } from '@/lib/utils';
import { CheckCircle2, ShoppingBag, ArrowLeft, PackageCheck, Mail, ShieldCheck } from 'lucide-react';
import { ClearCartOnSuccess } from '@/components/ClearCartOnSuccess';
import { GoogleAdsConversionTracker } from '@/components/GoogleAdsConversionTracker';

export const metadata = {
  title: '¡Pago Exitoso! | Klonfark',
  description: 'Tu compra ha sido procesada con éxito en Klonfark.',
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

  const settings = await getStoreSettings();
  const ownerPhone = settings?.whatsapp_number
    ? String(settings.whatsapp_number).replace(/[^0-9]/g, '')
    : '5492804350717';

  let itemsSummary = '';
  if (order?.order_items && order.order_items.length > 0) {
    itemsSummary = order.order_items
      .map((item: any) => `• ${item.quantity}x ${item.product?.title || 'Producto'} ${item.selected_size ? `(Talle: ${item.selected_size})` : ''} ${item.selected_color ? `(Color: ${item.selected_color})` : ''} - ${formatCurrency(item.unit_price * item.quantity)}`)
      .join('\n');
  }

  const orderRef = orderId ? `#${orderId.slice(0, 8).toUpperCase()}` : '#COMPRA';
  const whatsappMessage = 
    `¡Hola! 👋 Acabo de realizar una compra en ${settings?.store_logo_text || 'KLONFARK'} 🛍️\n\n` +
    `📋 *Nº de Pedido:* ${orderRef}\n` +
    (mpPaymentId ? `💳 *ID Mercado Pago:* #${mpPaymentId}\n` : '') +
    (order?.total_amount ? `💰 *Total Pagado:* ${formatCurrency(order.total_amount)}\n` : '') +
    (itemsSummary ? `\n📦 *Productos:*\n${itemsSummary}\n` : '') +
    `\nTe envío este comprobante para coordinar el envío / entrega. ¡Muchas gracias! 🙌`;

  const whatsappUrl = `https://wa.me/${ownerPhone}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-[80vh] bg-zinc-950 text-white flex items-center justify-center py-12 px-4">
      {/* Resetea el carrito local */}
      <ClearCartOnSuccess />

      {/* Dispara evento de conversión de compra a Google Ads / GA4 */}
      <GoogleAdsConversionTracker
        transactionId={orderId || mpPaymentId}
        value={order?.total_amount}
        currency="ARS"
      />

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
                        Cantidad: {item.quantity} {item.selected_size ? `| Talle: ${item.selected_size}` : ''} {item.selected_color ? `| Color: ${item.selected_color}` : ''}
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

        {/* Botón Destacado: Enviar Comprobante por WhatsApp */}
        <div className="mt-6 bg-gradient-to-r from-emerald-950/40 via-zinc-900/60 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-5 flex flex-col items-center text-center gap-3 shadow-lg">
          <div className="text-xs text-zinc-300">
            <span className="font-bold text-emerald-400 block text-sm mb-0.5">¿Querés avisar al vendedor al instante?</span>
            Envía el comprobante con el detalle de tu compra directamente al WhatsApp de la tienda.
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-6 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-sm transition-all duration-200 flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/30 active:scale-98 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Enviar comprobante por WhatsApp al dueño
          </a>
        </div>

        {/* Banner Informativo */}
        <div className="mt-6 bg-zinc-950/40 border border-zinc-800 rounded-2xl p-4 flex items-start gap-3.5">
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
