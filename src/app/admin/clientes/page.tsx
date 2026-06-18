import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Clientes | Panel de Administración',
};

export default async function AdminClientesPage() {
  const supabase = await createClient();

  // Verificar admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: currentUserProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (currentUserProfile?.role !== 'admin') redirect('/');

  // Obtener todos los clientes
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching profiles:', error);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-6">Clientes</h1>
      
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-900">
              <tr>
                <th className="px-6 py-4 font-medium">Nombre Completo</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">DNI</th>
                <th className="px-6 py-4 font-medium">Teléfono</th>
                <th className="px-6 py-4 font-medium">Ciudad / Prov</th>
                <th className="px-6 py-4 font-medium">Rol</th>
                <th className="px-6 py-4 font-medium">Fecha Reg.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {profiles?.map((profile) => (
                <tr key={profile.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4 font-medium text-zinc-900">
                    {profile.nombre} {profile.apellido}
                  </td>
                  <td className="px-6 py-4">{profile.email}</td>
                  <td className="px-6 py-4">{profile.dni || '-'}</td>
                  <td className="px-6 py-4">{profile.telefono || '-'}</td>
                  <td className="px-6 py-4">
                    {profile.ciudad ? `${profile.ciudad}, ${profile.provincia}` : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      profile.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {profile.role}
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
