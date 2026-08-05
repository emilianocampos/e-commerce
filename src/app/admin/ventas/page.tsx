import { getAllOrders } from '@/actions/orders';
import { formatCurrency } from '@/lib/utils';
import { ShippingStatusSelect } from './ShippingStatusSelect';

export const metadata = {
  title: 'Ventas | Panel Admin',
};

export default async function AdminVentasPage() {
  const orders = await getAllOrders();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-900">Ventas Registradas</h1>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white overflow-x-auto shadow-sm">
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
                    {order.id.split('-')[0]}...
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
                <td className="px-6 py-4 font-semibold text-zinc-900">
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
  );
}
