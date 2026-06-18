import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export const metadata = {
  title: 'Panel de Administración | E-commerce',
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Verificar que el usuario sea admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/');

  // Obtener estadísticas
  // 1. Órdenes
  const { data: orders } = await supabase.from('orders').select('status, total');
  
  // 2. Clientes
  const { count: clientsCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

  // 3. Productos vendidos (order_items)
  const { count: soldProductsCount } = await supabase.from('order_items').select('*', { count: 'exact', head: true });

  const totalOrders = orders?.length || 0;
  const approvedOrders = orders?.filter(o => o.status === 'approved') || [];
  const totalSales = approvedOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
  const rejectedOrders = orders?.filter(o => o.status === 'rejected' || o.status === 'cancelled').length || 0;

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
      <p className="mt-2 text-zinc-500">
        Resumen general del estado del E-commerce.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Monto Vendido (Aprobado)</p>
          <h3 className="mt-2 text-3xl font-bold text-zinc-900">{formatCurrency(totalSales)}</h3>
        </div>
        
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Ventas Aprobadas</p>
          <h3 className="mt-2 text-3xl font-bold text-zinc-900">{approvedOrders.length}</h3>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Clientes Registrados</p>
          <h3 className="mt-2 text-3xl font-bold text-zinc-900">{clientsCount || 0}</h3>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Productos Vendidos</p>
          <h3 className="mt-2 text-3xl font-bold text-zinc-900">{soldProductsCount || 0}</h3>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
          <p className="text-sm font-medium text-yellow-800">Pedidos Pendientes</p>
          <h3 className="mt-2 text-3xl font-bold text-yellow-900">{pendingOrders}</h3>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm font-medium text-red-800">Pedidos Rechazados</p>
          <h3 className="mt-2 text-3xl font-bold text-red-900">{rejectedOrders}</h3>
        </div>
        
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-center items-center">
          <Link href="/admin/pedidos" className="text-blue-600 font-medium hover:underline">
            Ver todos los pedidos &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
