import { getAllOrders } from '@/actions/orders';
import { formatCurrency } from '@/lib/utils';
import { ShippingStatusSelect } from './ShippingStatusSelect';
import { DollarSign, User, Package, Calendar, MapPin, Phone, Mail } from 'lucide-react';

export const metadata = {
  title: 'Ventas | Panel Admin',
};

export default async function AdminVentasPage() {
  const orders = await getAllOrders();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-2.5">
            <DollarSign className="w-7 h-7 text-emerald-600" />
            Ventas Registradas ({orders?.length || 0})
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Gestión de pedidos, información de envío y cambio de estado.
          </p>
        </div>
      </div>

      {/* VISTA MOBILE: Tarjetas táctiles optimizadas para Smartphones */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {orders.map((order: any) => {
          const p = order.profile;
          const name = p?.full_name || p?.email || 'Sin nombre';
          const addressParts = p ? [p.address, p.city, p.postal_code ? `(CP: ${p.postal_code})` : ''].filter(Boolean) : [];

          return (
            <div key={order.id} className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm space-y-3">
              {/* Header de la tarjeta */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Ref Pedido</span>
                  <span className="font-mono text-xs font-bold text-zinc-900">
                    #{order.id.split('-')[0].toUpperCase()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Monto</span>
                  <span className="font-extrabold text-sm text-emerald-600">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
              </div>

              {/* Datos del Cliente */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-zinc-900 font-bold">
                  <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>{name}</span>
                </div>
                {p?.email && (
                  <div className="flex items-center gap-2 text-zinc-500 text-[11px]">
                    <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate">{p.email}</span>
                  </div>
                )}
                {p?.phone && (
                  <div className="flex items-center gap-2 text-zinc-500 text-[11px]">
                    <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>{p.phone}</span>
                  </div>
                )}
                {addressParts.length > 0 && (
                  <div className="flex items-start gap-2 text-zinc-500 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                    <span>{addressParts.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Lista de Ítems */}
              <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100 text-xs space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Productos comprados
                </span>
                {order.order_items.map((item: any) => (
                  <div key={item.id} className="text-zinc-700 font-medium flex justify-between gap-2">
                    <span className="truncate">
                      {item.quantity}x {item.product?.title || 'Prod. eliminado'} {item.selected_size ? `(${item.selected_size})` : ''}
                    </span>
                    <span className="font-bold shrink-0">{formatCurrency(item.unit_price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Selector de Estado de Envío */}
              <div className="pt-2 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Estado de Envío</span>
                <ShippingStatusSelect orderId={order.id} initialStatus={order.shipping_status} />
              </div>
            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="bg-white rounded-2xl p-8 border border-zinc-200 text-center text-sm text-zinc-500">
            No hay ventas registradas en la tienda.
          </div>
        )}
      </div>

      {/* VISTA DESKTOP: Tabla Tradicional */}
      <div className="hidden md:block rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4 font-semibold">ID / Fecha</th>
                <th className="px-6 py-4 font-semibold">Cliente</th>
                <th className="px-6 py-4 font-semibold">Items</th>
                <th className="px-6 py-4 font-semibold">Total</th>
                <th className="px-6 py-4 font-semibold">Estado Envío</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="block font-medium text-zinc-900 truncate max-w-[100px]" title={order.id}>
                      #{order.id.split('-')[0].toUpperCase()}
                    </span>
                    <span className="text-xs text-zinc-500">{new Date(order.created_at).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    {(() => {
                      const p = order.profile;
                      if (!p) return <div className="text-xs text-zinc-400">Sin datos de comprador</div>;

                      const name = p.full_name || p.email || 'Sin nombre';
                      const phone = p.phone;
                      const addressParts = [
                        p.address,
                        p.city,
                        p.postal_code ? `(CP: ${p.postal_code})` : ''
                      ].filter(Boolean);

                      return (
                        <div>
                          <div className="font-medium text-zinc-900">{name}</div>
                          <div className="text-xs text-zinc-500">{p.email}</div>
                          {phone && <div className="text-xs text-zinc-500">Tel: {phone}</div>}
                          {addressParts.length > 0 && (
                            <div className="text-xs text-zinc-400 mt-1">
                              {addressParts.join(', ')}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-[250px]">
                      {order.order_items.map((item: any) => (
                        <div key={item.id} className="text-xs truncate">
                          {item.quantity}x {item.product?.title || 'Prod. eliminado'} {item.selected_size ? `(${item.selected_size})` : ''}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-extrabold text-zinc-900">
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td className="px-6 py-4">
                    <ShippingStatusSelect orderId={order.id} initialStatus={order.shipping_status} />
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No hay ventas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
