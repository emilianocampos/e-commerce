'use client';

import { useState, useEffect, useActionState } from 'react';
import { register } from '@/actions/auth';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { GeoRefService, GeoRefProvincia, GeoRefLocalidad } from '@/services/georef.service';
import { Loader2, CheckCircle2, Truck, RefreshCw } from 'lucide-react';
import Link from 'next/link';

async function registerAction(prevState: any, formData: FormData) {
  return await register(formData);
}

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, null);

  // GeoRef State
  const [provincias, setProvincias] = useState<GeoRefProvincia[]>([]);
  const [localidades, setLocalidades] = useState<GeoRefLocalidad[]>([]);
  
  const [selectedProvincia, setSelectedProvincia] = useState<string>('');
  const [selectedLocalidad, setSelectedLocalidad] = useState<string>('');
  const [codigoPostal, setCodigoPostal] = useState<string>('');
  const [isCpReadOnly, setIsCpReadOnly] = useState<boolean>(true);
  const [cpMessage, setCpMessage] = useState<string | null>(null);

  // Loading & Error States
  const [loadingProvincias, setLoadingProvincias] = useState<boolean>(true);
  const [loadingLocalidades, setLoadingLocalidades] = useState<boolean>(false);
  const [errorProvincias, setErrorProvincias] = useState<string | null>(null);
  const [errorLocalidades, setErrorLocalidades] = useState<string | null>(null);

  // Localidad filter search for large lists
  const [searchLocalidad, setSearchLocalidad] = useState<string>('');

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

  // 2. Handle Provincia Change
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

  // 3. Handle Localidad Change
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

  // Filtered localidades for fast dropdown search
  const filteredLocalidades = searchLocalidad.trim()
    ? localidades.filter(l => l.nombre.toLowerCase().includes(searchLocalidad.toLowerCase()))
    : localidades;

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-200 shadow-sm flex items-center gap-2">
          <span>⚠️</span>
          <span>{state.error}</span>
        </div>
      )}

      {/* Account Info */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-zinc-900 border-b pb-2">1. Datos de Cuenta</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700" htmlFor="email">Email *</label>
            <Input id="email" name="email" type="email" placeholder="tu@email.com" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700" htmlFor="password">Contraseña *</label>
            <Input id="password" name="password" type="password" required minLength={6} placeholder="Mínimo 6 caracteres" />
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-zinc-900 border-b pb-2">2. Datos Personales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700" htmlFor="nombre">Nombre *</label>
            <Input id="nombre" name="nombre" placeholder="Juan" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700" htmlFor="apellido">Apellido *</label>
            <Input id="apellido" name="apellido" placeholder="Pérez" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700" htmlFor="dni">DNI *</label>
            <Input id="dni" name="dni" placeholder="12345678" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700" htmlFor="telefono">Teléfono *</label>
            <Input id="telefono" name="telefono" type="tel" placeholder="2804123456" required />
          </div>
        </div>
      </div>

      {/* Shipping Address & GeoRef */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-zinc-900 border-b pb-2">3. Dirección de Envío</h3>
        
        {/* Street & Number */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-zinc-700" htmlFor="calle">Calle *</label>
            <Input id="calle" name="calle" placeholder="Av. San Martín" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700" htmlFor="numero">Número *</label>
            <Input id="numero" name="numero" placeholder="123" required />
          </div>
        </div>

        {/* Floor, Dept & References */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700" htmlFor="piso">Piso <span className="text-zinc-400 font-normal">(Opc.)</span></label>
            <Input id="piso" name="piso" placeholder="3" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700" htmlFor="departamento">Depto <span className="text-zinc-400 font-normal">(Opc.)</span></label>
            <Input id="departamento" name="departamento" placeholder="A" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700" htmlFor="referencias">Referencias <span className="text-zinc-400 font-normal">(Opc.)</span></label>
            <Input id="referencias" name="referencias" placeholder="Color de rejas..." />
          </div>
        </div>

        {/* Step 1: Provincia (Select) */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700 flex items-center justify-between" htmlFor="provincia">
            <span>Provincia *</span>
            {loadingProvincias && <span className="text-xs text-zinc-500 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Cargando provincias...</span>}
          </label>
          
          {loadingProvincias ? (
            <div className="h-10 w-full animate-pulse bg-zinc-100 rounded-lg border border-zinc-200"></div>
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
              className="w-full h-11 px-3 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all cursor-pointer"
            >
              <option value="">▼ Selecciona una provincia...</option>
              {provincias.map((p) => (
                <option key={p.id} value={p.nombre}>{p.nombre}</option>
              ))}
            </select>
          )}
        </div>

        {/* Step 2: Localidad (Select) */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700 flex items-center justify-between" htmlFor="localidad">
            <span>Localidad *</span>
            {loadingLocalidades && <span className="text-xs text-zinc-500 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Cargando localidades...</span>}
          </label>

          {loadingLocalidades ? (
            <div className="h-10 w-full animate-pulse bg-zinc-100 rounded-lg border border-zinc-200"></div>
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
                  className="w-full h-9 px-3 mb-1.5 bg-zinc-50 border border-zinc-200 rounded-md text-xs text-zinc-700"
                />
              )}
              <select
                id="localidad"
                name="localidad"
                value={selectedLocalidad}
                onChange={(e) => handleLocalidadChange(e.target.value)}
                disabled={!selectedProvincia || localidades.length === 0}
                required
                className="w-full h-11 px-3 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all disabled:bg-zinc-100 disabled:text-zinc-400 disabled:cursor-not-allowed cursor-pointer"
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

        {/* Step 3: Código Postal (Autofilled & read-only or manual) */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700" htmlFor="codigo_postal">
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
          {/* Hidden input for backend action */}
          <input 
            type="hidden" 
            name="shipping_quote_required" 
            value={isShippingQuoteRequired ? 'true' : 'false'} 
          />

          {isChubutTrelew ? (
            // LOCAL FREE SHIPPING BLOCK
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-sm transition-all duration-300 animate-in fade-in">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                    ✅ Envío GRATIS
                  </h4>
                  <p className="text-xs text-emerald-800 leading-relaxed mt-1">
                    Tu dirección se encuentra dentro de nuestra zona de entrega local.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // REST OF COUNTRY SHIPPING QUOTE BLOCK
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 shadow-sm transition-all duration-300 animate-in fade-in">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-sky-100 text-sky-600 rounded-full shrink-0 mt-0.5">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sky-950 text-sm flex items-center gap-1.5">
                    🚚 Envíos al resto del país
                  </h4>
                  <p className="text-xs text-sky-800 leading-relaxed mt-1.5">
                    El costo del envío será cotizado por <strong>Correo Argentino</strong> una vez realizada la compra.
                  </p>
                  <p className="text-xs text-sky-800 leading-relaxed mt-1">
                    Nos comunicaremos por WhatsApp o correo electrónico para informarte el costo final del envío antes de despachar el pedido.
                  </p>
                  <p className="text-xs text-sky-900 font-semibold mt-1.5 bg-sky-100/60 p-2 rounded-lg border border-sky-200/60">
                    ℹ️ El pedido será despachado una vez abonado el costo del envío.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" className="w-full h-12 text-base font-bold shadow-md" disabled={isPending || loadingProvincias || loadingLocalidades}>
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Creando cuenta...
          </span>
        ) : (
          'Crear Cuenta'
        )}
      </Button>

      <div className="text-center text-sm text-zinc-500">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-zinc-900 font-bold underline underline-offset-4 hover:text-zinc-700">
          Inicia Sesión
        </Link>
      </div>
    </form>
  );
}
