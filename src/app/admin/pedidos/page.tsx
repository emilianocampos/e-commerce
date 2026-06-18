import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export const metadata = {
  title: 'Pedidos | Panel de Administración',
};

export default async function AdminPedidosPage() {
  const supabase = await createClient();

  // Verificar admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: currentUserProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (currentUserProfile?.role !== 'admin') redirect('/');

  // Obtener todas las órdenes junto con el perfil del comprador
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      total,
      status,
      created_at,
      profiles (
        nombre,
        apellido,
        email
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-6">Pedidos</h1>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-900">
              <tr>
                <th className="px-6 py-4 font-medium">ID Pedido</th>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium text-right">Total</th>
                <th className="px-6 py-4 font-medium text-center">Estado</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {orders?.map((order: any) => (
                <tr key={order.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4 font-mono text-xs">{order.id.split('-')[0]}...</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-zinc-900">{order.profiles?.nombre} {order.profiles?.apellido}</p>
                    <p className="text-xs text-zinc-500">{order.profiles?.email}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-zinc-900">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wider
                      ${order.status === 'approved' ? 'bg-green-100 text-green-700' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'rejected' || order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-zinc-100 text-zinc-700'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!orders || orders.length === 0) && (
            <div className="p-8 text-center text-zinc-500">No hay pedidos registrados.</div>
          )}
        </div>
      </div>
    </div>
  );
}
