import { getUserOrders } from '@/actions/orders';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Mis Pedidos | E-Commerce Premium',
};

export default async function MisPedidosPage() {
  const orders = await getUserOrders();

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-3xl font-black tracking-tighter text-zinc-900 mb-8">Mis Pedidos</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-zinc-100">
          <p className="text-lg text-zinc-500 mb-6">Aún no has realizado ninguna compra.</p>
          <Link href="/" className="inline-flex items-center justify-center h-12 px-8 font-medium text-white bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors">
            Ir a la tienda
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
              <div className="bg-zinc-50 px-6 py-4 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Fecha</p>
                  <p className="font-medium text-zinc-900">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total</p>
                  <p className="font-medium text-zinc-900">{formatCurrency(order.total_amount)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Estado Envío</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-bold uppercase tracking-wider rounded ${
                    order.shipping_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.shipping_status === 'preparing' ? 'bg-orange-100 text-orange-800' :
                    order.shipping_status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    order.shipping_status === 'delivered' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.shipping_status === 'pending' ? 'Pendiente' :
                     order.shipping_status === 'preparing' ? 'En Preparación' :
                     order.shipping_status === 'shipped' ? 'Enviado' :
                     order.shipping_status === 'delivered' ? 'Entregado' :
                     order.shipping_status === 'cancelled' ? 'Cancelado' :
                     order.shipping_status || 'Pendiente'}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <ul className="divide-y divide-zinc-100">
                  {order.order_items.map((item: any) => (
                    <li key={item.id} className="py-4 flex gap-4">
                      <div className="relative h-20 w-20 shrink-0 rounded-lg overflow-hidden border border-zinc-100 bg-zinc-50">
                        {item.product?.image ? (
                          <Image src={item.product.image} alt={item.product.title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400">Sin foto</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-zinc-900">{item.product?.title || 'Producto Eliminado'}</h4>
                        <div className="text-sm text-zinc-500 flex gap-4 mt-1">
                          <span>Cant: {item.quantity}</span>
                          {item.selected_size && <span>Talle: {item.selected_size}</span>}
                          <span>Precio: {formatCurrency(item.unit_price)}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
