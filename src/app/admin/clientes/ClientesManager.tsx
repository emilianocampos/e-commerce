'use client';

import { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Shield, 
  UserCheck, 
  ShoppingBag, 
  Edit3, 
  Eye, 
  X, 
  Check, 
  ExternalLink,
  MessageCircle,
  FileSpreadsheet,
  Building2,
  CreditCard,
  Sparkles
} from 'lucide-react';
import { updateClientAdmin } from '@/actions/admin_clients';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface Profile {
  id: string;
  email: string;
  full_name?: string | null;
  nombre?: string | null;
  apellido?: string | null;
  dni?: string | null;
  phone?: string | null;
  telefono?: string | null;
  address?: string | null;
  calle?: string | null;
  numero?: string | null;
  piso?: string | null;
  departamento?: string | null;
  referencias?: string | null;
  city?: string | null;
  localidad?: string | null;
  provincia?: string | null;
  postal_code?: string | null;
  codigo_postal?: string | null;
  role?: string | null;
  created_at: string;
  shipping_quote_required?: boolean;
}

interface OrderSummary {
  id: string;
  profile_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_number?: number;
}

interface ClientesManagerProps {
  initialProfiles: Profile[];
  orders: OrderSummary[];
}

// Formatear nombre a partir del email si viene vacío
function formatNameFromEmail(email: string): string {
  if (!email) return 'Cliente';
  const prefix = email.split('@')[0];
  let clean = prefix.replace(/[0-9_.-]+$/, '').replace(/^[0-9_.-]+/, '');
  clean = clean.replace(/[._-]+/g, ' ');
  const words = clean.split(' ').filter(Boolean);
  if (words.length === 0) return prefix;
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

export function ClientesManager({ initialProfiles, orders }: ClientesManagerProps) {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'admin' | 'with_phone' | 'with_orders'>('all');
  
  // Modals state
  const [selectedClient, setSelectedClient] = useState<Profile | null>(null);
  const [editingClient, setEditingClient] = useState<Profile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // Mapeo de pedidos por cliente
  const ordersByClient = useMemo(() => {
    const map = new Map<string, OrderSummary[]>();
    orders.forEach(order => {
      if (order.profile_id) {
        const list = map.get(order.profile_id) || [];
        list.push(order);
        map.set(order.profile_id, list);
      }
    });
    return map;
  }, [orders]);

  // Obtener nombre formateado
  const getDisplayName = (p: Profile) => {
    if (p.full_name && p.full_name.trim()) return p.full_name.trim();
    const combined = [p.nombre, p.apellido].filter(Boolean).join(' ').trim();
    if (combined) return combined;
    return formatNameFromEmail(p.email);
  };

  // Obtener teléfono
  const getDisplayPhone = (p: Profile) => {
    return p.phone || p.telefono || null;
  };

  // Obtener ciudad / ubicación
  const getDisplayLocation = (p: Profile) => {
    const loc = p.localidad || p.city;
    const prov = p.provincia;
    if (loc && prov) return `${loc}, ${prov}`;
    if (loc) return loc;
    if (prov) return prov;
    return null;
  };

  // Filtrado de perfiles
  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      const name = getDisplayName(p).toLowerCase();
      const email = (p.email || '').toLowerCase();
      const phone = (getDisplayPhone(p) || '').toLowerCase();
      const city = (getDisplayLocation(p) || '').toLowerCase();
      const dni = (p.dni || '').toLowerCase();
      const query = search.toLowerCase().trim();

      const matchesSearch = !query || 
        name.includes(query) || 
        email.includes(query) || 
        phone.includes(query) || 
        city.includes(query) || 
        dni.includes(query);

      if (!matchesSearch) return false;

      if (filterRole === 'admin') return p.role === 'admin';
      if (filterRole === 'user') return p.role !== 'admin';
      if (filterRole === 'with_phone') return Boolean(getDisplayPhone(p));
      if (filterRole === 'with_orders') return (ordersByClient.get(p.id)?.length || 0) > 0;

      return true;
    });
  }, [profiles, search, filterRole, ordersByClient]);

  // Guardar cambios al editar
  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingClient) return;

    setIsSaving(true);
    setSaveMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.set('id', editingClient.id);

    const res = await updateClientAdmin(formData);

    setIsSaving(false);
    if (res.success) {
      setSaveMessage({ text: '¡Cliente actualizado con éxito!' });
      
      // Actualizar estado local
      const updatedProfile: Profile = {
        ...editingClient,
        full_name: (formData.get('full_name') as string) || `${formData.get('nombre')} ${formData.get('apellido')}`.trim(),
        nombre: formData.get('nombre') as string,
        apellido: formData.get('apellido') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        dni: formData.get('dni') as string,
        calle: formData.get('calle') as string,
        numero: formData.get('numero') as string,
        piso: formData.get('piso') as string,
        departamento: formData.get('departamento') as string,
        localidad: formData.get('localidad') as string,
        city: formData.get('localidad') as string,
        provincia: formData.get('provincia') as string,
        codigo_postal: formData.get('codigo_postal') as string,
        postal_code: formData.get('codigo_postal') as string,
        role: formData.get('role') as string,
      };

      setProfiles(prev => prev.map(p => p.id === editingClient.id ? updatedProfile : p));

      setTimeout(() => {
        setEditingClient(null);
        setSaveMessage(null);
      }, 900);
    } else {
      setSaveMessage({ text: res.error || 'Error al guardar', error: true });
    }
  };

  // Estadísticas rápidas
  const totalCount = profiles.length;
  const withPhoneCount = profiles.filter(p => Boolean(getDisplayPhone(p))).length;
  const withOrdersCount = profiles.filter(p => (ordersByClient.get(p.id)?.length || 0) > 0).length;
  const adminCount = profiles.filter(p => p.role === 'admin').length;

  return (
    <div className="space-y-6">
      {/* Header & Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Clientes</p>
            <h3 className="text-2xl font-extrabold text-zinc-900 mt-0.5">{totalCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Con Teléfono</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-0.5">{withPhoneCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Phone className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Compradores</p>
            <h3 className="text-2xl font-extrabold text-blue-600 mt-0.5">{withOrdersCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Administradores</p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-0.5">{adminCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, email, teléfono, DNI o ciudad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-zinc-50 hover:bg-zinc-100/70 focus:bg-white rounded-xl border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 font-semibold p-1"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterRole('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterRole === 'all'
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Todos ({totalCount})
            </button>
            <button
              onClick={() => setFilterRole('with_phone')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterRole === 'with_phone'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Con Teléfono ({withPhoneCount})
            </button>
            <button
              onClick={() => setFilterRole('with_orders')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterRole === 'with_orders'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Con Compras ({withOrdersCount})
            </button>
            <button
              onClick={() => setFilterRole('admin')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterRole === 'admin'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Admins ({adminCount})
            </button>
          </div>
        </div>
      </div>

      {/* VISTA MOBILE: Tarjetas Táctiles Modernas */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredProfiles.map((profile) => {
          const displayName = getDisplayName(profile);
          const displayPhone = getDisplayPhone(profile);
          const displayLocation = getDisplayLocation(profile);
          const clientOrders = ordersByClient.get(profile.id) || [];
          const initials = displayName.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

          return (
            <div key={profile.id} className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                    {initials || 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-1.5">
                      {displayName}
                    </h3>
                    <p className="text-xs text-zinc-500 truncate max-w-[200px]">{profile.email}</p>
                  </div>
                </div>
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${
                  profile.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {profile.role || 'cliente'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-zinc-600 pt-2 border-t border-zinc-100">
                {displayPhone ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-semibold text-zinc-800">{displayPhone}</span>
                    </div>
                    <a
                      href={`https://wa.me/549${displayPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`¡Hola ${displayName}! Te contactamos de KLONFARK.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] rounded-lg inline-flex items-center gap-1 transition-all"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-zinc-400">
                    <div className="flex items-center gap-2 italic">
                      <Phone className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
                      <span>Sin teléfono</span>
                    </div>
                    <button
                      onClick={() => setEditingClient(profile)}
                      className="text-[11px] text-purple-600 font-bold hover:underline"
                    >
                      + Agregar
                    </button>
                  </div>
                )}

                {displayLocation ? (
                  <div className="flex items-center gap-2 text-zinc-600">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>{displayLocation}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-zinc-400 italic">
                    <MapPin className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
                    <span>Ubicación no especificada</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                  {clientOrders.length > 0 && (
                    <span className="font-bold text-blue-600 flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3" />
                      {clientOrders.length} {clientOrders.length === 1 ? 'pedido' : 'pedidos'}
                    </span>
                  )}
                </div>
              </div>

              {/* Botones de acción mobile */}
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-100">
                <button
                  onClick={() => setSelectedClient(profile)}
                  className="flex-1 h-9 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver Detalle</span>
                </button>
                <button
                  onClick={() => setEditingClient(profile)}
                  className="flex-1 h-9 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredProfiles.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center text-sm text-zinc-500 border border-zinc-200">
            No se encontraron clientes con los filtros seleccionados.
          </div>
        )}
      </div>

      {/* VISTA DESKTOP: Tabla Tradicional Mejorada */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="border-b border-zinc-200 bg-zinc-50/80 text-zinc-900">
              <tr>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Teléfono / WhatsApp</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Ubicación</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center">Pedidos</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Rol</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Fecha Reg.</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredProfiles.map((profile) => {
                const displayName = getDisplayName(profile);
                const displayPhone = getDisplayPhone(profile);
                const displayLocation = getDisplayLocation(profile);
                const clientOrders = ordersByClient.get(profile.id) || [];
                const initials = displayName.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

                return (
                  <tr key={profile.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm">
                          {initials || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 text-sm">{displayName}</p>
                          {profile.dni && (
                            <p className="text-[11px] text-zinc-400 font-mono">DNI: {profile.dni}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-700 font-medium">{profile.email}</td>
                    <td className="px-6 py-4">
                      {displayPhone ? (
                        <div className="flex items-center gap-2">
                          <a 
                            href={`https://wa.me/549${displayPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`¡Hola ${displayName}! Te contactamos de KLONFARK.`)}`}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-all"
                            title="Chatear por WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{displayPhone}</span>
                          </a>
                        </div>
                      ) : (
                        <span className="text-zinc-400 italic text-xs">Sin registrar</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {displayLocation ? (
                        <span className="inline-flex items-center gap-1 text-zinc-800 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>{displayLocation}</span>
                        </span>
                      ) : (
                        <span className="text-zinc-400 italic text-xs">No especificada</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {clientOrders.length > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                          <ShoppingBag className="w-3 h-3" />
                          {clientOrders.length}
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                        profile.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-zinc-100 text-zinc-700'
                      }`}>
                        {profile.role || 'cliente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 text-xs whitespace-nowrap">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedClient(profile)}
                          className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all"
                          title="Ver detalle completo"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingClient(profile)}
                          className="p-1.5 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-all"
                          title="Editar cliente"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredProfiles.length === 0 && (
            <div className="p-10 text-center text-zinc-500">
              No se encontraron clientes registrados con los filtros seleccionados.
            </div>
          )}
        </div>
      </div>

      {/* MODAL: VER DETALLE COMPLETO */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-zinc-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-black text-base flex items-center justify-center shadow-md">
                  {getDisplayName(selectedClient).split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-zinc-900">{getDisplayName(selectedClient)}</h3>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                    selectedClient.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {selectedClient.role || 'cliente'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Datos Personales y Contacto */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Información de Contacto</h4>
              <div className="bg-zinc-50 rounded-2xl p-4 space-y-2.5 text-xs text-zinc-700">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Email:</span>
                  <span className="font-semibold text-zinc-900">{selectedClient.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">DNI:</span>
                  <span className="font-semibold text-zinc-900">{selectedClient.dni || 'No registrado'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Teléfono:</span>
                  {getDisplayPhone(selectedClient) ? (
                    <a
                      href={`https://wa.me/549${getDisplayPhone(selectedClient)?.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-emerald-600 hover:underline inline-flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      {getDisplayPhone(selectedClient)}
                    </a>
                  ) : (
                    <span className="italic text-zinc-400">No registrado</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Fecha de Registro:</span>
                  <span className="font-semibold text-zinc-900">{new Date(selectedClient.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Dirección y Envío */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Dirección de Entrega</h4>
              <div className="bg-zinc-50 rounded-2xl p-4 space-y-2.5 text-xs text-zinc-700">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Provincia:</span>
                  <span className="font-semibold text-zinc-900">{selectedClient.provincia || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Localidad / Ciudad:</span>
                  <span className="font-semibold text-zinc-900">{selectedClient.localidad || selectedClient.city || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Código Postal:</span>
                  <span className="font-semibold text-zinc-900">{selectedClient.codigo_postal || selectedClient.postal_code || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Calle y Número:</span>
                  <span className="font-semibold text-zinc-900">
                    {[selectedClient.calle, selectedClient.numero].filter(Boolean).join(' ') || selectedClient.address || '-'}
                  </span>
                </div>
                {(selectedClient.piso || selectedClient.departamento) && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Piso / Dpto:</span>
                    <span className="font-semibold text-zinc-900">
                      {[selectedClient.piso ? `Piso ${selectedClient.piso}` : '', selectedClient.departamento ? `Dpto ${selectedClient.departamento}` : ''].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                {selectedClient.referencias && (
                  <div className="flex flex-col gap-1 pt-1 border-t border-zinc-200/60">
                    <span className="text-zinc-400">Referencias:</span>
                    <span className="font-medium text-zinc-800">{selectedClient.referencias}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Historial de Pedidos */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Historial de Pedidos</h4>
              {(() => {
                const clientOrders = ordersByClient.get(selectedClient.id) || [];
                if (clientOrders.length === 0) {
                  return (
                    <div className="bg-zinc-50 rounded-2xl p-4 text-center text-xs text-zinc-400">
                      Este cliente aún no ha realizado pedidos.
                    </div>
                  );
                }
                return (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {clientOrders.map(order => (
                      <Link
                        key={order.id}
                        href={`/admin/pedidos/${order.id}`}
                        className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/60 transition-all text-xs"
                      >
                        <div>
                          <p className="font-bold text-zinc-900">Pedido #{order.order_number || order.id.slice(0, 8)}</p>
                          <p className="text-[11px] text-zinc-500">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-zinc-900">{formatCurrency(order.total_amount)}</p>
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                            order.status === 'approved' || order.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Footer Modal */}
            <div className="flex items-center gap-3 pt-3 border-t border-zinc-100">
              <button
                onClick={() => {
                  setEditingClient(selectedClient);
                  setSelectedClient(null);
                }}
                className="flex-1 h-11 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Edit3 className="w-4 h-4" />
                <span>Editar Información</span>
              </button>
              <button
                onClick={() => setSelectedClient(null)}
                className="px-5 h-11 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR CLIENTE */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-zinc-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h3 className="text-lg font-black text-zinc-900">Editar Cliente</h3>
                <p className="text-xs text-zinc-500">Actualiza los datos del perfil de {editingClient.email}</p>
              </div>
              <button
                onClick={() => {
                  setEditingClient(null);
                  setSaveMessage(null);
                }}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {saveMessage && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                saveMessage.error ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {saveMessage.error ? '⚠️' : <Check className="w-4 h-4 text-emerald-600" />}
                <span>{saveMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    defaultValue={editingClient.nombre || editingClient.full_name?.split(' ')[0] || ''}
                    placeholder="Ej: Juan"
                    className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700">Apellido</label>
                  <input
                    type="text"
                    name="apellido"
                    defaultValue={editingClient.apellido || editingClient.full_name?.split(' ').slice(1).join(' ') || ''}
                    placeholder="Ej: Pérez"
                    className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingClient.email}
                    required
                    className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700">DNI</label>
                  <input
                    type="text"
                    name="dni"
                    defaultValue={editingClient.dni || ''}
                    placeholder="Ej: 12345678"
                    className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700">Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={editingClient.phone || editingClient.telefono || ''}
                    placeholder="Ej: 2804123456"
                    className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700">Rol</label>
                  <select
                    name="role"
                    defaultValue={editingClient.role || 'user'}
                    className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
                  >
                    <option value="user">Cliente (user)</option>
                    <option value="admin">Administrador (admin)</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-zinc-100 pt-3 space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Ubicación y Domicilio</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700">Provincia</label>
                    <input
                      type="text"
                      name="provincia"
                      defaultValue={editingClient.provincia || ''}
                      placeholder="Ej: Chubut"
                      className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700">Localidad / Ciudad</label>
                    <input
                      type="text"
                      name="localidad"
                      defaultValue={editingClient.localidad || editingClient.city || ''}
                      placeholder="Ej: Trelew"
                      className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-bold text-zinc-700">Calle</label>
                    <input
                      type="text"
                      name="calle"
                      defaultValue={editingClient.calle || ''}
                      placeholder="Ej: San Martín"
                      className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700">Número</label>
                    <input
                      type="text"
                      name="numero"
                      defaultValue={editingClient.numero || ''}
                      placeholder="Ej: 123"
                      className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700">Piso</label>
                    <input
                      type="text"
                      name="piso"
                      defaultValue={editingClient.piso || ''}
                      placeholder="Ej: 2"
                      className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700">Depto</label>
                    <input
                      type="text"
                      name="departamento"
                      defaultValue={editingClient.departamento || ''}
                      placeholder="Ej: B"
                      className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700">Cód. Postal</label>
                    <input
                      type="text"
                      name="codigo_postal"
                      defaultValue={editingClient.codigo_postal || editingClient.postal_code || ''}
                      placeholder="Ej: 9100"
                      className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700">Referencias de Entrega</label>
                  <input
                    type="text"
                    name="referencias"
                    defaultValue={editingClient.referencias || ''}
                    placeholder="Ej: Portón negro, entre calles X e Y..."
                    className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-zinc-100">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 h-11 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingClient(null);
                    setSaveMessage(null);
                  }}
                  className="px-5 h-11 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
