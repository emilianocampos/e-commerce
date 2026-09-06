import { getUserOrders } from '@/actions/orders';
import { getStoreSettings } from '@/actions/settings';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Package, 
  Calendar, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Sparkles
} from 'lucide-react';

export const metadata = {
  title: 'Mis Pedidos | KLONFARK',
  description: 'Revisá el estado en tiempo real de tus compras y envíos.',
};

export default async function MisPedidosPage() {
  let orders: any[] = [];
  try {
    orders = await getUserOrders();
  } catch (error) {
    orders = [];
  }

  const settings = await getStoreSettings();
  const ownerPhone = settings?.whatsapp_number
    ? String(settings.whatsapp_number).replace(/[^0-9]/g, '')
    : '5492804350717';

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Encabezado Superior */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 pb-6 border-b border-zinc-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Historial de Compras
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Mis Pedidos
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 mt-1">
              Consultá el estado actualizado de tus compras, pagos y envíos en tiempo real.
            </p>
          </div>

          <Link 
            href="/shop" 
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 hover:border-zinc-700 text-xs font-bold tracking-wide transition-all duration-200 shadow-sm self-start sm:self-auto"
          >
            <span>Seguir Comprando</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Estado Vacío */}
        {orders.length === 0 ? (
          <div className="text-center py-20 px-6 bg-zinc-900/60 rounded-3xl border border-zinc-800/80 shadow-2xl relative overflow-hidden backdrop-blur-xl max-w-2xl mx-auto">
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="w-20 h-20 mx-auto rounded-3xl bg-zinc-800/70 border border-zinc-700/50 flex items-center justify-center text-zinc-400 mb-6 shadow-inner">
              <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Aún no realizaste ningún pedido</h2>
            <p className="text-zinc-400 text-sm max-w-md mx-auto mb-8">
              Explorá nuestro catálogo de indumentaria y suplementos exclusivos para equiparte hoy mismo.
            </p>
            <Link 
              href="/shop" 
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 font-extrabold text-sm text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-950/40"
            >
              <ShoppingBag className="w-4 h-4" />
              Explorar Catálogo
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order: any) => {
              const purchaseStatus = (order.status || order.payment_status || 'pending').toLowerCase();
              const shippingStatus = (order.shipping_status || 'pending').toLowerCase();
              const orderRef = order.id ? `#${order.id.slice(0, 8).toUpperCase()}` : '#PEDIDO';
              const createdDate = order.created_at 
                ? new Date(order.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                : '';

              // WhatsApp message for this order
              let itemsSummary = '';
              if (order.order_items && order.order_items.length > 0) {
                itemsSummary = order.order_items
                  .map((item: any) => `• ${item.quantity}x ${item.product?.title || 'Producto'} ${item.selected_size ? `(Talle: ${item.selected_size})` : ''} ${item.selected_color ? `(Color: ${item.selected_color})` : ''} - ${formatCurrency(item.unit_price * item.quantity)}`)
                  .join('\n');
              }

              const whatsappMessage = 
                `¡Hola! 👋 Consulta sobre mi pedido en ${settings?.store_logo_text || 'KLONFARK'} 🛍️\n\n` +
                `📋 *Nº de Pedido:* ${orderRef}\n` +
                `💰 *Total:* ${formatCurrency(order.total_amount || order.total || 0)}\n` +
                (itemsSummary ? `\n📦 *Productos:*\n${itemsSummary}\n` : '') +
                `\n¿Podrían indicarme el estado del envío? ¡Muchas gracias!`;

              const whatsappUrl = `https://wa.me/${ownerPhone}?text=${encodeURIComponent(whatsappMessage)}`;

              // Shipping Step index
              const shippingSteps = [
                { key: 'pending', label: 'Pendiente' },
                { key: 'preparing', label: 'En Preparación' },
                { key: 'shipped', label: 'Enviado' },
                { key: 'delivered', label: 'Entregado' }
              ];
              const currentStepIndex = shippingSteps.findIndex(s => s.key === shippingStatus);

              return (
                <div 
                  key={order.id} 
                  className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl hover:border-zinc-700 transition-all duration-300"
                >
                  {/* Encabezado del Pedido (Dark Header) */}
                  <div className="bg-zinc-950/90 px-6 py-5 border-b border-zinc-800/90 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-6 sm:gap-8">
                      {/* Número de Pedido */}
                      <div>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">
                          Nº de Pedido
                        </span>
                        <span className="font-mono text-sm font-extrabold text-white tracking-wider bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800 inline-block">
                          {orderRef}
                        </span>
                      </div>

                      {/* Fecha */}
                      <div>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">
                          Fecha
                        </span>
                        <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                          {createdDate}
                        </span>
                      </div>

                      {/* Total */}
                      <div>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">
                          Total Pagado
                        </span>
                        <span className="font-black text-base text-emerald-400">
                          {formatCurrency(order.total_amount || order.total || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Badges de Estado */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Estado Compra / Pago */}
                      <div>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">
                          Estado Compra
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase tracking-wider rounded-xl border ${
                          purchaseStatus === 'approved' || purchaseStatus === 'paid' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-950/20' :
                          purchaseStatus === 'pending' 
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                            'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}>
                          {purchaseStatus === 'approved' || purchaseStatus === 'paid' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              Aprobado
                            </>
                          ) : purchaseStatus === 'pending' ? (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              Pendiente Pago
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                              {purchaseStatus === 'rejected' ? 'Rechazado' : 'Cancelado'}
                            </>
                          )}
                        </span>
                      </div>

                      {/* Estado Envío */}
                      <div>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">
                          Estado Envío
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase tracking-wider rounded-xl border ${
                          shippingStatus === 'delivered' 
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' :
                          shippingStatus === 'shipped' 
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' :
                          shippingStatus === 'preparing' 
                            ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' :
                          shippingStatus === 'cancelled'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                            'bg-yellow-500/10 text-yellow-300 border-yellow-500/30'
                        }`}>
                          {shippingStatus === 'delivered' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                              Entregado
                            </>
                          ) : shippingStatus === 'shipped' ? (
                            <>
                              <Truck className="w-3.5 h-3.5 text-cyan-400" />
                              Enviado
                            </>
                          ) : shippingStatus === 'preparing' ? (
                            <>
                              <Package className="w-3.5 h-3.5 text-orange-400" />
                              En Preparación
                            </>
                          ) : shippingStatus === 'cancelled' ? (
                            <>
                              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                              Cancelado
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-yellow-300" />
                              Pendiente
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Barra de Progreso de Envío */}
                  {shippingStatus !== 'cancelled' && (
                    <div className="bg-zinc-950/40 px-6 py-3.5 border-b border-zinc-800/60">
                      <div className="grid grid-cols-4 gap-2 text-center">
                        {shippingSteps.map((step, idx) => {
                          const isDone = currentStepIndex >= idx;
                          const isCurrent = currentStepIndex === idx;
                          return (
                            <div key={step.key} className="flex flex-col items-center">
                              <div className={`h-1.5 w-full rounded-full mb-1.5 transition-all duration-300 ${
                                isDone 
                                  ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' 
                                  : 'bg-zinc-800'
                              }`} />
                              <span className={`text-[10px] font-bold ${
                                isCurrent 
                                  ? 'text-emerald-400 font-extrabold' 
                                  : isDone 
                                  ? 'text-zinc-300' 
                                  : 'text-zinc-600'
                              }`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Items del Pedido */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {order.order_items?.map((item: any) => (
                        <div 
                          key={item.id} 
                          className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-zinc-950/40 border border-zinc-800/60 hover:border-zinc-700/60 transition-colors"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
                              {item.product?.image ? (
                                <Image 
                                  src={item.product.image} 
                                  alt={item.product.title || 'Producto'} 
                                  fill 
                                  className="object-cover" 
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-600 font-bold">
                                  Sin foto
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-white text-sm sm:text-base truncate">
                                {item.product?.title || 'Producto'}
                              </h4>
                              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-zinc-400">
                                <span className="bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-700/50 text-zinc-300">
                                  Cantidad: <strong className="text-white">{item.quantity}</strong>
                                </span>
                                {item.selected_size && (
                                  <span className="bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-700/50 text-zinc-300">
                                    Talle: <strong className="text-white">{item.selected_size}</strong>
                                  </span>
                                )}
                                {item.selected_color && (
                                  <span className="bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-700/50 text-zinc-300">
                                    Color: <strong className="text-white">{item.selected_color}</strong>
                                  </span>
                                )}
                                <span className="text-zinc-500 hidden sm:inline">
                                  Precio Unit.: {formatCurrency(item.unit_price)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-extrabold text-sm sm:text-base text-zinc-100">
                              {formatCurrency(item.unit_price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer del Card: Botón WhatsApp y resumen */}
                  <div className="bg-zinc-950/70 px-6 py-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-zinc-400 text-center sm:text-left">
                      ¿Tenés alguna consulta sobre la entrega de este pedido?
                    </div>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 hover:border-[#25D366]/50 text-xs font-bold transition-all duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      <span>Consultar por WhatsApp</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
