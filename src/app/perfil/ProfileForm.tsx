'use client';

import { useState, useEffect, useActionState } from 'react';
import { updateUserProfile } from '@/actions/profile';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { GeoRefService, GeoRefProvincia, GeoRefLocalidad } from '@/services/georef.service';
import { Loader2, CheckCircle2, Truck, RefreshCw, Save, UserCheck, MapPin, CreditCard, Mail } from 'lucide-react';
import { showToast } from 'nextjs-toast-notify';

async function updateAction(prevState: any, formData: FormData) {
  return await updateUserProfile(prevState, formData);
}

export function ProfileForm({ initialProfile }: { initialProfile: any }) {
  const [state, formAction, isPending] = useActionState(updateAction, null);

  // Split name if initialProfile.nombre isn't explicitly set
  const defaultFullName = initialProfile?.full_name || '';
  const nameParts = defaultFullName.split(' ');
  const defaultNombre = initialProfile?.nombre || nameParts[0] || '';
  const defaultApellido = initialProfile?.apellido || nameParts.slice(1).join(' ') || '';

  const [nombre, setNombre] = useState(defaultNombre);
  const [apellido, setApellido] = useState(defaultApellido);
  const [dni, setDni] = useState(initialProfile?.dni || '');
  const [telefono, setTelefono] = useState(initialProfile?.phone || initialProfile?.telefono || '');

  // Address fields
  const [calle, setCalle] = useState(initialProfile?.calle || '');
  const [numero, setNumero] = useState(initialProfile?.numero || '');
  const [piso, setPiso] = useState(initialProfile?.piso || '');
  const [departamento, setDepartamento] = useState(initialProfile?.departamento || '');
  const [referencias, setReferencias] = useState(initialProfile?.referencias || '');

  // GeoRef State
  const [provincias, setProvincias] = useState<GeoRefProvincia[]>([]);
  const [localidades, setLocalidades] = useState<GeoRefLocalidad[]>([]);
  
  const [selectedProvincia, setSelectedProvincia] = useState<string>(initialProfile?.provincia || '');
  const [selectedLocalidad, setSelectedLocalidad] = useState<string>(initialProfile?.localidad || initialProfile?.city || '');
  const [codigoPostal, setCodigoPostal] = useState<string>(initialProfile?.codigo_postal || initialProfile?.postal_code || '');
  const [isCpReadOnly, setIsCpReadOnly] = useState<boolean>(true);
  const [cpMessage, setCpMessage] = useState<string | null>(null);

  // Loading & Error States
  const [loadingProvincias, setLoadingProvincias] = useState<boolean>(true);
  const [loadingLocalidades, setLoadingLocalidades] = useState<boolean>(false);
  const [errorProvincias, setErrorProvincias] = useState<string | null>(null);
  const [errorLocalidades, setErrorLocalidades] = useState<string | null>(null);

  // Localidad filter search for large lists
  const [searchLocalidad, setSearchLocalidad] = useState<string>('');

  // Toast notification when state changes
  useEffect(() => {
    if (state?.success && state?.message) {
      showToast.success(state.message, { position: 'top-center' });
    } else if (state?.error) {
      showToast.error(state.error, { position: 'top-center' });
    }
  }, [state]);

  // 1. Load Provincias on Mount
  const loadProvincias = async () => {
    setLoadingProvincias(true);
    setErrorProvincias(null);
    try {
      const data = await GeoRefService.getProvincias();
      setProvincias(data);
    } catch (err: any) {
      setErrorProvincias(err.message || 'Error al cargar provincias');
    } finally {
      setLoadingProvincias(false);
    }
  };

  useEffect(() => {
    loadProvincias();
  }, []);

  // 2. Load initial localidades if provincia is set
  useEffect(() => {
    if (selectedProvincia) {
      setLoadingLocalidades(true);
      GeoRefService.getLocalidades(selectedProvincia)
        .then((locs) => {
          setLocalidades(locs);
        })
        .catch((err) => {
          setErrorLocalidades(err.message || 'Error al cargar localidades');
        })
        .finally(() => {
          setLoadingLocalidades(false);
        });
    }
  }, [selectedProvincia]);

  // Handle Provincia Change
  const handleProvinciaChange = async (provNombre: string) => {
    setSelectedProvincia(provNombre);
    setSelectedLocalidad('');
    setSearchLocalidad('');
    setCodigoPostal('');
    setLocalidades([]);
    setCpMessage(null);
    setErrorLocalidades(null);

    if (!provNombre) return;

    setLoadingLocalidades(true);
    try {
      const locs = await GeoRefService.getLocalidades(provNombre);
      setLocalidades(locs);
    } catch (err: any) {
      setErrorLocalidades(err.message || 'Error al cargar localidades');
    } finally {
      setLoadingLocalidades(false);
    }
  };

  // Handle Localidad Change
  const handleLocalidadChange = async (locNombre: string) => {
    setSelectedLocalidad(locNombre);
    setCodigoPostal('');
    setCpMessage(null);

    if (!locNombre || !selectedProvincia) return;

    const cp = await GeoRefService.getCodigoPostal(selectedProvincia, locNombre);
    if (cp) {
      setCodigoPostal(cp);
      setIsCpReadOnly(true);
    } else {
      setIsCpReadOnly(false);
      setCpMessage('Código Postal no disponible automáticamente. Por favor ingrésalo manualmente.');
    }
  };

  // Shipping evaluation
  const isChubutTrelew = 
    selectedProvincia.trim().toLowerCase() === 'chubut' && 
    selectedLocalidad.trim().toLowerCase() === 'trelew';

  const isShippingQuoteRequired = selectedLocalidad !== '' && !isChubutTrelew;

  // Filtered localidades
  const filteredLocalidades = searchLocalidad.trim()
    ? localidades.filter(l => l.nombre.toLowerCase().includes(searchLocalidad.toLowerCase()))
    : localidades;

  return (
    <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden p-6 sm:p-10">
      <div className="flex items-center gap-3 pb-6 border-b border-zinc-100 mb-8">
        <div className="p-3 bg-zinc-900 text-white rounded-2xl">
          <UserCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Editar Datos del Perfil</h2>
          <p className="text-xs sm:text-sm text-zinc-500">
            Actualizá tu información personal y de envío para futuros pedidos.
          </p>
        </div>
      </div>

      <form action={formAction} className="space-y-8">
        {state?.error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-200 shadow-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{state.error}</span>
          </div>
        )}
        {state?.message && (
          <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 border border-emerald-200 shadow-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{state.message}</span>
          </div>
        )}

        {/* Account Info (Read-only Email) */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
            <Mail className="w-4 h-4 text-zinc-500" />
            1. Datos de Cuenta
          </h3>
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1.5" htmlFor="email">
              Correo Electrónico
            </label>
            <div className="relative">
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={initialProfile?.email || ''} 
                disabled 
                className="bg-zinc-100 text-zinc-600 cursor-not-allowed font-medium"
              />
              <span className="absolute right-3 top-2.5 text-[10px] font-bold uppercase tracking-wider bg-zinc-200 text-zinc-700 px-2 py-1 rounded">
                No modificable
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">El correo electrónico está vinculado a tu cuenta principal.</p>
          </div>
        </div>

        {/* Personal Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
            <CreditCard className="w-4 h-4 text-zinc-500" />
            2. Datos Personales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider" htmlFor="nombre">Nombre *</label>
              <Input 
                id="nombre" 
                name="nombre" 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)} 
                placeholder="Juan" 
                required 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider" htmlFor="apellido">Apellido *</label>
              <Input 
                id="apellido" 
                name="apellido" 
                value={apellido} 
                onChange={(e) => setApellido(e.target.value)} 
                placeholder="Pérez" 
                required 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider" htmlFor="dni">DNI *</label>
              <Input 
                id="dni" 
                name="dni" 
                value={dni} 
                onChange={(e) => setDni(e.target.value)} 
                placeholder="12345678" 
                required 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider" htmlFor="telefono">Teléfono / WhatsApp *</label>
              <Input 
                id="telefono" 
                name="telefono" 
                type="tel" 
                value={telefono} 
                onChange={(e) => setTelefono(e.target.value)} 
                placeholder="2804123456" 
                required 
              />
            </div>
          </div>
        </div>

        {/* Shipping Address & GeoRef */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
            <MapPin className="w-4 h-4 text-zinc-500" />
            3. Dirección de Envío Predeterminada
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider" htmlFor="calle">Calle *</label>
              <Input 
                id="calle" 
                name="calle" 
                value={calle} 
                onChange={(e) => setCalle(e.target.value)} 
                placeholder="Av. San Martín" 
                required 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider" htmlFor="numero">Número *</label>
              <Input 
                id="numero" 
                name="numero" 
                value={numero} 
                onChange={(e) => setNumero(e.target.value)} 
                placeholder="123" 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider" htmlFor="piso">Piso <span className="text-zinc-400 font-normal">(Opc.)</span></label>
              <Input 
                id="piso" 
                name="piso" 
                value={piso} 
                onChange={(e) => setPiso(e.target.value)} 
                placeholder="3" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider" htmlFor="departamento">Depto <span className="text-zinc-400 font-normal">(Opc.)</span></label>
              <Input 
                id="departamento" 
                name="departamento" 
                value={departamento} 
                onChange={(e) => setDepartamento(e.target.value)} 
                placeholder="A" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider" htmlFor="referencias">Referencias <span className="text-zinc-400 font-normal">(Opc.)</span></label>
              <Input 
                id="referencias" 
                name="referencias" 
                value={referencias} 
                onChange={(e) => setReferencias(e.target.value)} 
                placeholder="Casa blanca rejas verdes..." 
              />
            </div>
          </div>

          {/* Provincia */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center justify-between" htmlFor="provincia">
              <span>Provincia *</span>
              {loadingProvincias && <span className="text-xs text-zinc-500 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Cargando...</span>}
            </label>
            
            {loadingProvincias ? (
              <div className="h-11 w-full animate-pulse bg-zinc-100 rounded-lg border border-zinc-200"></div>
            ) : errorProvincias ? (
              <div className="flex items-center justify-between p-2.5 text-xs text-red-600 bg-red-50 rounded-lg border border-red-200">
                <span>{errorProvincias}</span>
                <button type="button" onClick={loadProvincias} className="inline-flex items-center gap-1 font-bold underline">
                  <RefreshCw className="w-3 h-3" /> Reintentar
                </button>
              </div>
            ) : (
              <select
                id="provincia"
                name="provincia"
                value={selectedProvincia}
                onChange={(e) => handleProvinciaChange(e.target.value)}
                required
                className="w-full h-11 px-3 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all cursor-pointer font-medium"
              >
                <option value="">▼ Selecciona una provincia...</option>
                {provincias.map((p) => (
                  <option key={p.id} value={p.nombre}>{p.nombre}</option>
                ))}
              </select>
            )}
          </div>

          {/* Localidad */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center justify-between" htmlFor="localidad">
              <span>Localidad *</span>
              {loadingLocalidades && <span className="text-xs text-zinc-500 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Cargando...</span>}
            </label>

            {loadingLocalidades ? (
              <div className="h-11 w-full animate-pulse bg-zinc-100 rounded-lg border border-zinc-200"></div>
            ) : errorLocalidades ? (
              <div className="flex items-center justify-between p-2.5 text-xs text-red-600 bg-red-50 rounded-lg border border-red-200">
                <span>{errorLocalidades}</span>
                <button type="button" onClick={() => handleProvinciaChange(selectedProvincia)} className="inline-flex items-center gap-1 font-bold underline">
                  <RefreshCw className="w-3 h-3" /> Reintentar
                </button>
              </div>
            ) : (
              <>
                {localidades.length > 20 && (
                  <input 
                    type="text" 
                    placeholder="🔍 Buscar localidad..." 
                    value={searchLocalidad}
                    onChange={(e) => setSearchLocalidad(e.target.value)}
                    className="w-full h-9 px-3 mb-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-700"
                  />
                )}
                <select
                  id="localidad"
                  name="localidad"
                  value={selectedLocalidad}
                  onChange={(e) => handleLocalidadChange(e.target.value)}
                  disabled={!selectedProvincia || localidades.length === 0}
                  required
                  className="w-full h-11 px-3 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all disabled:bg-zinc-100 disabled:text-zinc-400 disabled:cursor-not-allowed cursor-pointer font-medium"
                >
                  <option value="">
                    {!selectedProvincia 
                      ? 'Primero selecciona una provincia' 
                      : localidades.length === 0 
                      ? 'No hay localidades cargadas' 
                      : '▼ Selecciona una localidad...'}
                  </option>
                  {filteredLocalidades.map((loc) => (
                    <option key={loc.id} value={loc.nombre}>{loc.nombre}</option>
                  ))}
                </select>
              </>
            )}
          </div>

          {/* Código Postal */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider" htmlFor="codigo_postal">
              Código Postal *
            </label>
            <Input
              id="codigo_postal"
              name="codigo_postal"
              value={codigoPostal}
              onChange={(e) => setCodigoPostal(e.target.value)}
              readOnly={isCpReadOnly}
              placeholder={!selectedLocalidad ? 'Selecciona provincia y localidad' : 'Ej: 9100'}
              required
              className={isCpReadOnly ? 'bg-zinc-100 text-zinc-700 font-bold border-zinc-200 cursor-not-allowed' : 'bg-white border-zinc-300'}
            />
            {cpMessage && (
              <p className="text-xs text-amber-600 font-medium mt-1">{cpMessage}</p>
            )}
          </div>
        </div>

        {/* Dynamic Shipping Detection Block */}
        {selectedLocalidad && (
          <div className="pt-2">
            <input 
              type="hidden" 
              name="shipping_quote_required" 
              value={isShippingQuoteRequired ? 'true' : 'false'} 
            />

            {isChubutTrelew ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-sm">
                      🚀 Zona de Envío Local: Trelew (En el día) - GRATIS
                    </h4>
                    <p className="text-xs text-emerald-800 leading-relaxed mt-1">
                      Tu dirección se encuentra en Trelew: entrega en el día sin costo de envío adicional.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-sky-100 text-sky-600 rounded-full shrink-0 mt-0.5">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sky-950 text-sm">
                      🚚 Envíos y Tiempos de Entrega
                    </h4>
                    <div className="bg-white/80 rounded-xl p-3 border border-sky-200/80 my-2 space-y-1 text-xs text-sky-950 font-medium">
                      <p>• <strong>Trelew:</strong> Envíos en el día.</p>
                      <p>• <strong>Zonas aledañas:</strong> 1 día de demora.</p>
                      <p>• <strong>Resto de Chubut:</strong> 2 a 5 días.</p>
                      <p>• <strong>Interior del país:</strong> 3 a 7 días.</p>
                    </div>
                    <p className="text-xs text-sky-800 leading-relaxed">
                      El costo de envío al resto del país es cotizado por Correo Argentino tras confirmar tu compra.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4 flex justify-end">
          <Button 
            type="submit" 
            className="h-12 px-8 text-base font-bold shadow-md bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl flex items-center gap-2" 
            disabled={isPending || loadingProvincias || loadingLocalidades}
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Guardando...
              </span>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
