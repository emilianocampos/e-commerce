import { createAdminClient } from '@/lib/supabase-server';
import { Users, Mail, Phone, MapPin, Calendar, Shield } from 'lucide-react';

export const metadata = {
  title: 'Clientes | Panel de Administración',
};

export default async function AdminClientesPage() {
  const adminClient = createAdminClient();

  const { data: profiles, error } = await adminClient
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching profiles:', error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-2.5">
          <Users className="w-7 h-7 text-purple-600" />
          Clientes Registrados ({profiles?.length || 0})
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
          Lista de usuarios con cuenta en tu plataforma.
        </p>
      </div>

      {/* VISTA MOBILE: Tarjetas táctiles para Smartphones */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {profiles?.map((profile) => (
          <div key={profile.id} className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-zinc-900 text-sm">
                {profile.full_name || 'Sin Nombre'}
              </h3>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                profile.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {profile.role || 'cliente'}
              </span>
            </div>

            <div className="space-y-1 text-xs text-zinc-600 pt-1 border-t border-zinc-100">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="truncate">{profile.email || 'Sin email'}</span>
              </div>
              
              {profile.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>{profile.phone}</span>
                </div>
              )}

              {profile.city && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>{profile.city}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-zinc-400 text-[11px] pt-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>Registrado el {new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}

        {(!profiles || profiles.length === 0) && (
          <div className="bg-white rounded-2xl p-8 text-center text-sm text-zinc-500 border border-zinc-200">
            No hay clientes registrados en la plataforma.
          </div>
        )}
      </div>

      {/* VISTA DESKTOP: Tabla Tradicional */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-900">
              <tr>
                <th className="px-6 py-4 font-semibold">Nombre Completo</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Teléfono</th>
                <th className="px-6 py-4 font-semibold">Ciudad</th>
                <th className="px-6 py-4 font-semibold">Rol</th>
                <th className="px-6 py-4 font-semibold">Fecha Reg.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {profiles?.map((profile) => (
                <tr key={profile.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4 font-bold text-zinc-900">
                    {profile.full_name || 'Sin nombre'}
                  </td>
                  <td className="px-6 py-4">{profile.email}</td>
                  <td className="px-6 py-4">{profile.phone || '-'}</td>
                  <td className="px-6 py-4">{profile.city || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      profile.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {profile.role || 'cliente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 whitespace-nowrap">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!profiles || profiles.length === 0) && (
            <div className="p-8 text-center text-zinc-500">No hay clientes registrados.</div>
          )}
        </div>
      </div>
    </div>
  );
}
