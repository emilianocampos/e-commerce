import { createClient } from '@/lib/supabase-server';
import { redirect, notFound } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export const metadata = {
  title: 'Detalle de Pedido | Panel de Administración',
};

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const orderId = resolvedParams.id;
  const supabase = await createClient();

  // Verificar admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: currentUserProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (currentUserProfile?.role !== 'admin') redirect('/');

  // Traer la orden con sus items y los datos del perfil del cliente
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*),
      profiles (*)
    `)
    .eq('id', orderId)
    .single();

  if (error || !order) {
    notFound();
  }

  const client = order.profiles;

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-900">Detalle de Pedido</h1>
        <Link href="/admin/pedidos" className="text-sm text-blue-600 hover:underline">
          &larr; Volver a Pedidos
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Datos del Cliente */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 mb-4 border-b border-zinc-100 pb-2">Datos del Cliente</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-zinc-500 text-xs">Nombre Completo</dt>
              <dd className="font-medium text-zinc-900">{client.nombre} {client.apellido}</dd>
            </div>
            <div>
              <dt className="text-zinc-500 text-xs">Email</dt>
              <dd className="text-zinc-900">{client.email}</dd>
            </div>
            <div>
              <dt className="text-zinc-500 text-xs">DNI</dt>
              <dd className="text-zinc-900">{client.dni || 'No provisto'}</dd>
            </div>
            <div>
              <dt className="text-zinc-500 text-xs">Teléfono</dt>
              <dd className="text-zinc-900">{client.telefono || 'No provisto'}</dd>
            </div>
            <div>
              <dt className="text-zinc-500 text-xs">Dirección</dt>
              <dd className="text-zinc-900">{client.direccion || 'No provisto'}</dd>
            </div>
            <div>
              <dt className="text-zinc-500 text-xs">Ciudad / Provincia / CP</dt>
              <dd className="text-zinc-900">
                {[client.ciudad, client.provincia, client.codigo_postal].filter(Boolean).join(', ') || 'No provisto'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Resumen de la Orden */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 mb-4 border-b border-zinc-100 pb-2">Información del Pago</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <dt className="text-zinc-500">Estado</dt>
              <dd>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wider
                    ${order.status === 'approved' ? 'bg-green-100 text-green-700' : 
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                      order.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                      'bg-zinc-100 text-zinc-700'}`}>
                    {order.status}
                </span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Fecha de Creación</dt>
              <dd className="text-zinc-900 text-right">{new Date(order.created_at).toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Última Actualización</dt>
              <dd className="text-zinc-900 text-right">{new Date(order.updated_at).toLocaleString()}</dd>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-100">
              <dt className="text-zinc-500 text-xs mb-1">ID Orden (Interno)</dt>
              <dd className="font-mono text-xs text-zinc-900 break-all bg-zinc-50 p-1 rounded">{order.id}</dd>
            </div>
            <div>
              <dt className="text-zinc-500 text-xs mb-1">Payment ID (Mercado Pago)</dt>
              <dd className="font-mono text-xs text-zinc-900 break-all bg-zinc-50 p-1 rounded">{order.payment_id || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-zinc-500 text-xs mb-1">Preference ID</dt>
              <dd className="font-mono text-xs text-zinc-900 break-all bg-zinc-50 p-1 rounded">{order.preference_id || 'N/A'}</dd>
            </div>
          </dl>
        </div>

        {/* Productos */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm md:col-span-2 lg:col-span-3">
          <h2 className="text-lg font-bold text-zinc-900 mb-4 border-b border-zinc-100 pb-2">Productos en el Pedido</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-600">
              <thead className="border-b border-zinc-200 text-zinc-900">
                <tr>
                  <th className="pb-3 font-semibold">Producto</th>
                  <th className="pb-3 font-semibold text-center">Cantidad</th>
                  <th className="pb-3 font-semibold text-right">Precio Unitario</th>
                  <th className="pb-3 font-semibold text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {order.order_items.map((item: any) => (
                  <tr key={item.id}>
                    <td className="py-4">{item.product_title}</td>
                    <td className="py-4 text-center">{item.quantity}</td>
                    <td className="py-4 text-right">{formatCurrency(item.price)}</td>
                    <td className="py-4 text-right font-medium text-zinc-900">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-zinc-200 font-bold text-zinc-900">
                <tr>
                  <td colSpan={3} className="pt-4 text-right">Total Pagado:</td>
                  <td className="pt-4 text-right text-lg text-green-600">{formatCurrency(order.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
