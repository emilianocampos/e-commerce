import { createAdminClient } from '@/lib/supabase-server';
import { Users } from 'lucide-react';
import { ClientesManager } from './ClientesManager';

export const metadata = {
  title: 'Clientes Registrados | Panel de Administración',
  description: 'Gestión y control de clientes registrados en la plataforma',
};

export const dynamic = 'force-dynamic';

export default async function AdminClientesPage() {
  const adminClient = createAdminClient();

  // Obtener perfiles de clientes y resumen de pedidos en paralelo
  const [profilesRes, ordersRes] = await Promise.all([
    adminClient
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false }),
    adminClient
      .from('orders')
      .select('id, profile_id, total_amount, status, created_at, order_number')
      .order('created_at', { ascending: false }),
  ]);

  if (profilesRes.error) {
    console.error('Error fetching profiles:', profilesRes.error);
  }

  const profiles = profilesRes.data || [];
  const orders = ordersRes.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-2.5">
            <Users className="w-7 h-7 text-purple-600" />
            Clientes Registrados ({profiles.length})
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Directorio completo de usuarios registrados, contacto, direcciones e historial de compras.
          </p>
        </div>
      </div>

      <ClientesManager initialProfiles={profiles} orders={orders} />
    </div>
  );
}
