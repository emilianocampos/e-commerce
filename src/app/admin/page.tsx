import { createAdminClient } from '@/lib/supabase-server';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { DollarSign, ShoppingBag, Users, Package, ArrowRight, Clock, AlertTriangle, QrCode, PlusCircle } from 'lucide-react';

export const metadata = {
  title: 'Panel de Administración | E-commerce',
};

export default async function AdminDashboardPage() {
  const adminClient = createAdminClient();

  // Obtener estadísticas reales usando Service Role Client
  const [
    { data: orders },
    { count: profilesCount },
    { count: soldProductsCount },
    authUsersRes
  ] = await Promise.all([
    adminClient.from('orders').select('status, total_amount'),
    adminClient.from('profiles').select('*', { count: 'exact', head: true }),
    adminClient.from('order_items').select('*', { count: 'exact', head: true }),
    adminClient.auth.admin.listUsers()
  ]);

  const totalUsersCount = Math.max(
    profilesCount || 0,
    authUsersRes.data?.users?.length || 0
  );

  const approvedOrders = orders?.filter(o => o.status === 'approved' || o.status === 'paid') || [];
  const totalSales = approvedOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
  const rejectedOrders = orders?.filter(o => o.status === 'rejected' || o.status === 'cancelled').length || 0;

  return (
    <div className="space-y-6">
      {/* Header Mobile & Desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
            Dashboard Admin
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Resumen en tiempo real del estado de tu e-commerce.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/crear"
            className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Crear Producto</span>
          </Link>
          <Link
            href="/admin/qr"
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span className="hidden xs:inline">QR Tienda</span>
          </Link>
        </div>
      </div>

      {/* Grid Principal de Estadísticas (2 cols en mobile, 4 en desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card: Monto Vendido */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Vendido</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-900 truncate">
              {formatCurrency(totalSales)}
            </h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Pagos aprobados</p>
          </div>
        </div>

        {/* Card: Ventas Aprobadas */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Ventas</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
              {approvedOrders.length}
            </h3>
            <p className="text-[11px] text-zinc-500 font-medium mt-0.5">Órdenes procesadas</p>
          </div>
        </div>

        {/* Card: Usuarios Registrados */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Usuarios</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl font-extrabold text-purple-700">
              {totalUsersCount}
            </h3>
            <p className="text-[11px] text-purple-600 font-semibold mt-0.5">Clientes registrados</p>
          </div>
        </div>

        {/* Card: Productos Vendidos */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Unidades</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
              {soldProductsCount || 0}
            </h3>
            <p className="text-[11px] text-zinc-500 font-medium mt-0.5">Ítems despachados</p>
          </div>
        </div>
      </div>

      {/* Secciones de Alertas y Accesos Rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Link
          href="/admin/pedidos"
          className="bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200 rounded-2xl p-4 transition-all shadow-sm flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pedidos Pendientes</p>
              <h4 className="text-xl font-extrabold text-amber-950">{pendingOrders}</h4>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/admin/pedidos"
          className="bg-rose-50/80 hover:bg-rose-100/80 border border-rose-200 rounded-2xl p-4 transition-all shadow-sm flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-sm shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">Pedidos Rechazados</p>
              <h4 className="text-xl font-extrabold text-rose-950">{rejectedOrders}</h4>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-rose-600 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/admin/pedidos"
          className="bg-white hover:bg-zinc-50 border border-zinc-200 rounded-2xl p-4 transition-all shadow-sm flex items-center justify-between group sm:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-sm shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Gestión de Ventas</p>
              <h4 className="text-sm font-bold text-zinc-900">Ver listado de pedidos</h4>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
