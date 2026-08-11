import { getUserOrders } from '@/actions/orders';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Mis Pedidos | DRAVENIX',
  description: 'Revisá el estado en tiempo real de tus compras y envíos.',
};

export default async function MisPedidosPage() {
  const orders = await getUserOrders();

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">Mis Pedidos</h1>
          <p className="text-sm text-zinc-500 mt-1">Consultá el estado actualizado de tus compras y envíos.</p>
        </div>
        <Link 
          href="/shop" 
          className="text-xs font-bold uppercase tracking-wider px-4 py-2 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors"
        >
          Seguir Comprando
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-zinc-200 shadow-sm p-8">
          <p className="text-lg text-zinc-500 mb-6 font-medium">Aún no has realizado ninguna compra.</p>
          <Link href="/" className="inline-flex items-center justify-center h-12 px-8 font-bold text-white bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors shadow-md">
            Ir a la tienda
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => {
            const purchaseStatus = (order.status || order.payment_status || 'pending').toLowerCase();
            const shippingStatus = (order.shipping_status || 'pending').toLowerCase();
            const orderRef = order.id ? `#${order.id.split('-')[0].toUpperCase()}` : '';

            return (
              <div key={order.id} className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Header de la Orden */}
                <div className="bg-zinc-50/80 px-6 py-4 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest block">Nº de Pedido</span>
                    <span className="font-mono text-xs font-bold text-zinc-900">{orderRef}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest block">Fecha</span>
                    <span className="font-medium text-xs text-zinc-900">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest block">Total</span>
                    <span className="font-extrabold text-sm text-emerald-600">{formatCurrency(order.total_amount || order.total || 0)}</span>
                  </div>

                  {/* Badges de Estados */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Estado de la Compra / Pago */}
                    <div>
                      <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest block mb-0.5">Estado Compra</span>
                      <span className={`inline-flex px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider rounded-lg border ${
                        purchaseStatus === 'approved' || purchaseStatus === 'paid' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        purchaseStatus === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {purchaseStatus === 'approved' || purchaseStatus === 'paid' ? '✅ Aprobado' :
                         purchaseStatus === 'pending' ? '⏳ Pendiente Pago' :
                         purchaseStatus === 'rejected' ? '❌ Rechazado' :
                         purchaseStatus === 'cancelled' ? '🚫 Cancelado' :
                         purchaseStatus}
                      </span>
                    </div>

                    {/* Estado de Envío */}
                    <div>
                      <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest block mb-0.5">Estado Envío</span>
                      <span className={`inline-flex px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider rounded-lg border ${
                        shippingStatus === 'pending' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                        shippingStatus === 'preparing' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                        shippingStatus === 'shipped' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                        shippingStatus === 'delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {shippingStatus === 'pending' ? '⏳ Pendiente' :
                         shippingStatus === 'preparing' ? '📦 En Preparación' :
                         shippingStatus === 'shipped' ? '🚚 Enviado' :
                         shippingStatus === 'delivered' ? '🎉 Entregado' :
                         shippingStatus === 'cancelled' ? '🚫 Cancelado' :
                         shippingStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items del Pedido */}
                <div className="p-6">
                  <ul className="divide-y divide-zinc-100">
                    {order.order_items.map((item: any) => (
                      <li key={item.id} className="py-4 flex items-center gap-4">
                        <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50">
                          {item.product?.image ? (
                            <Image src={item.product.image} alt={item.product.title} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400 font-bold">Sin foto</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-zinc-900 text-sm truncate">{item.product?.title || 'Producto Eliminado'}</h4>
                          <div className="text-xs text-zinc-500 flex flex-wrap gap-4 mt-1">
                            <span>Cantidad: <strong>{item.quantity}</strong></span>
                            {item.selected_size && <span>Talle: <strong>{item.selected_size}</strong></span>}
                            <span>Precio: <strong>{formatCurrency(item.unit_price)}</strong></span>
                          </div>
                        </div>
                        <div className="text-right font-extrabold text-sm text-zinc-900 shrink-0">
                          {formatCurrency(item.unit_price * item.quantity)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
