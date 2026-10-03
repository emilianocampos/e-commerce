'use client';

import { useState, useEffect, useActionState } from 'react';
import { register } from '@/actions/auth';
import { GeoRefService, GeoRefProvincia, GeoRefLocalidad } from '@/services/georef.service';
import { 
  Loader2, 
  CheckCircle2, 
  Truck, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

async function registerAction(prevState: any, formData: FormData) {
  return await register(formData);
}

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, null);

  // Form Fields State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    calle: '',
    numero: '',
    piso: '',
    departamento: '',
    referencias: '',
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

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

  // 2. Handle Inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'dni') {
      const cleanDni = value.replace(/\D/g, '').slice(0, 9);
      setFormData(prev => ({ ...prev, dni: cleanDni }));
      return;
    }

    if (name === 'telefono') {
      const cleanTel = value.replace(/[^\d+]/g, '').slice(0, 15);
      setFormData(prev => ({ ...prev, telefono: cleanTel }));
      return;
    }

    if (name === 'confirm_password' || name === 'confirmPassword') {
      setFormData(prev => ({ ...prev, confirmPassword: value }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // 3. Handle Provincia Change
  const handleProvinciaChange = async (provNombre: string) => {
    setSelectedProvincia(provNombre);
    setSelectedLocalidad('');
    setSearchLocalidad('');
    setCodigoPostal('');
    setLocalidades([]);
    setCpMessage(null);
    setErrorLocalidades(null);
    setTouched(prev => ({ ...prev, provincia: true }));

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

  // 4. Handle Localidad Change
  const handleLocalidadChange = async (locNombre: string) => {
    setSelectedLocalidad(locNombre);
    setCodigoPostal('');
    setCpMessage(null);
    setTouched(prev => ({ ...prev, localidad: true }));

    if (!locNombre || !selectedProvincia) return;

    const cp = await GeoRefService.getCodigoPostal(selectedProvincia, locNombre);
    if (cp) {
      setCodigoPostal(cp);
      setIsCpReadOnly(true);
    } else {
      setIsCpReadOnly(false);
      setCpMessage('Código Postal no detectado automáticamente. Por favor ingrésalo manualmente.');
    }
  };

  // 5. Validaciones individuales
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const errors = {
    email: !formData.email 
      ? 'El email es obligatorio' 
      : !emailRegex.test(formData.email) 
      ? 'Formato de correo no válido' 
      : null,
    password: !formData.password 
      ? 'La contraseña es obligatoria' 
      : formData.password.length < 6 
      ? 'Mínimo 6 caracteres' 
      : null,
    confirmPassword: !formData.confirmPassword 
      ? 'Confirma tu contraseña' 
      : formData.password !== formData.confirmPassword 
      ? 'Las contraseñas no coinciden' 
      : null,
    nombre: !formData.nombre.trim() 
      ? 'El nombre es obligatorio' 
      : formData.nombre.trim().length < 2 
      ? 'Mínimo 2 letras' 
      : null,
    apellido: !formData.apellido.trim() 
      ? 'El apellido es obligatorio' 
      : formData.apellido.trim().length < 2 
      ? 'Mínimo 2 letras' 
      : null,
    dni: !formData.dni 
      ? 'El DNI es obligatorio' 
      : formData.dni.length < 7 || formData.dni.length > 9 
      ? 'Debe tener entre 7 y 9 dígitos' 
      : null,
    telefono: !formData.telefono 
      ? 'El teléfono es obligatorio' 
      : formData.telefono.replace(/\D/g, '').length < 8 
      ? 'Mínimo 8 dígitos numéricos' 
      : null,
    calle: !formData.calle.trim() 
      ? 'La calle es obligatoria' 
      : formData.calle.trim().length < 2 
      ? 'Nombre de calle no válido' 
      : null,
    numero: !formData.numero.trim() 
      ? 'El número es obligatorio' 
      : null,
    provincia: !selectedProvincia 
      ? 'Selecciona una provincia' 
      : null,
    localidad: !selectedLocalidad 
      ? 'Selecciona una localidad' 
      : null,
    codigoPostal: !codigoPostal.trim() 
      ? 'El código postal es obligatorio' 
      : codigoPostal.trim().length < 3 
      ? 'Código postal no válido' 
      : null,
  };

  const isFormValid = Object.values(errors).every(err => err === null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!isFormValid) {
      e.preventDefault();
      setTouched({
        email: true,
        password: true,
        confirmPassword: true,
        nombre: true,
        apellido: true,
        dni: true,
        telefono: true,
        calle: true,
        numero: true,
        provincia: true,
        localidad: true,
        codigoPostal: true,
      });
      
      const firstErrorEl = document.querySelector('.has-error');
      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Shipping evaluation
  const isChubutTrelew = 
    selectedProvincia.trim().toLowerCase() === 'chubut' && 
    selectedLocalidad.trim().toLowerCase() === 'trelew';

  const isShippingQuoteRequired = selectedLocalidad !== '' && !isChubutTrelew;

  const filteredLocalidades = searchLocalidad.trim()
    ? localidades.filter(l => l.nombre.toLowerCase().includes(searchLocalidad.toLowerCase()))
    : localidades;

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Backend Error Alert */}
      {state?.error && (
        <div className="rounded-xl bg-red-50/90 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 p-3.5 text-xs font-semibold text-red-600 dark:text-red-400">
          ⚠️ {state.error}
        </div>
      )}

      {/* 1. DATOS DE CUENTA */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider block text-zinc-900 dark:text-zinc-200" htmlFor="email">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={() => handleBlur('email')}
            placeholder="tu@email.com"
            required
            className="flex h-11 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#18181b] px-3.5 py-2 text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
          />
          {touched.email && errors.email && (
            <p className="text-[11px] text-red-500 font-semibold">{errors.email}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider block text-zinc-900 dark:text-zinc-200" htmlFor="password">
              Contraseña *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={() => handleBlur('password')}
              placeholder="••••••••"
              required
              minLength={6}
              className="flex h-11 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#18181b] px-3.5 py-2 text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
            />
            {touched.password && errors.password && (
              <p className="text-[11px] text-red-500 font-semibold">{errors.password}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider block text-zinc-900 dark:text-zinc-200" htmlFor="confirm_password">
              Repetir Contraseña *
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              onBlur={() => handleBlur('confirmPassword')}
              placeholder="••••••••"
              required
              className="flex h-11 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#18181b] px-3.5 py-2 text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-[11px] text-red-500 font-semibold">{errors.confirmPassword}</p>
            )}
          </div>
        </div>
      </div>

      {/* 2. DATOS PERSONALES */}
      <div className="space-y-3 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider block text-zinc-900 dark:text-zinc-200" htmlFor="nombre">
              Nombre *
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleInputChange}
              onBlur={() => handleBlur('nombre')}
              placeholder="Juan"
              required
              className="flex h-11 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#18181b] px-3.5 py-2 text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
            />
            {touched.nombre && errors.nombre && (
              <p className="text-[11px] text-red-500 font-semibold">{errors.nombre}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider block text-zinc-900 dark:text-zinc-200" htmlFor="apellido">
              Apellido *
            </label>
            <input
              id="apellido"
              name="apellido"
              type="text"
              value={formData.apellido}
              onChange={handleInputChange}
              onBlur={() => handleBlur('apellido')}
              placeholder="Pérez"
              required
              className="flex h-11 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#18181b] px-3.5 py-2 text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
            />
            {touched.apellido && errors.apellido && (
              <p className="text-[11px] text-red-500 font-semibold">{errors.apellido}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider block text-zinc-900 dark:text-zinc-200" htmlFor="dni">
              DNI *
            </label>
            <input
              id="dni"
              name="dni"
              type="text"
              inputMode="numeric"
              value={formData.dni}
              onChange={handleInputChange}
              onBlur={() => handleBlur('dni')}
              placeholder="12345678"
              required
              maxLength={9}
              className="flex h-11 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#18181b] px-3.5 py-2 text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
            />
            {touched.dni && errors.dni && (
              <p className="text-[11px] text-red-500 font-semibold">{errors.dni}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider block text-zinc-900 dark:text-zinc-200" htmlFor="telefono">
              Teléfono / WhatsApp *
            </label>
            <input
              id="telefono"
              name="telefono"
              type="tel"
              value={formData.telefono}
              onChange={handleInputChange}
              onBlur={() => handleBlur('telefono')}
              placeholder="2804123456"
              required
              className="flex h-11 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#18181b] px-3.5 py-2 text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
            />
            {touched.telefono && errors.telefono && (
              <p className="text-[11px] text-red-500 font-semibold">{errors.telefono}</p>
            )}
          </div>
        </div>
      </div>

      {/* 3. DIRECCIÓN DE ENVÍO */}
      <div className="space-y-3 pt-2">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider block text-zinc-900 dark:text-zinc-200" htmlFor="calle">
              Calle *
            </label>
            <input
              id="calle"
              name="calle"
              type="text"
              value={formData.calle}
              onChange={handleInputChange}
              onBlur={() => handleBlur('calle')}
              placeholder="Av. San Martín"
              required
              className="flex h-11 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#18181b] px-3.5 py-2 text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
            />
            {touched.calle && errors.calle && (
              <p className="text-[11px] text-red-500 font-semibold">{errors.calle}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider block text-zinc-900 dark:text-zinc-200" htmlFor="numero">
              Número *
            </label>
            <input
              id="numero"
              name="numero"
              type="text"
              value={formData.numero}
              onChange={handleInputChange}
              onBlur={() => handleBlur('numero')}
              placeholder="123"
              required
              className="flex h-11 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#18181b] px-3.5 py-2 text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
            />
            {touched.numero && errors.numero && (
              <p className="text-[11px] text-red-500 font-semibold">{errors.numero}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider block text-zinc-900 dark:text-zinc-200" htmlFor="piso">
              Piso <span className="text-zinc-500 font-normal lowercase">(opc.)</span>
            </label>
            <input
              id="piso"
              name="piso"
              type="text"
              value={formData.piso}
              onChange={handleInputChange}
              placeholder="3"
              className="flex h-11 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#18181b] px-3.5 py-2 text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider block text-zinc-900 dark:text-zinc-200" htmlFor="departamento">
              Depto <span className="text-zinc-500 font-normal lowercase">(opc.)</span>
            </label>
            <input
              id="departamento"
              name="departamento"
              type="text"
              value={formData.departamento}
              onChange={handleInputChange}
              placeholder="A"
              className="flex h-11 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#18181b] px-3.5 py-2 text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider block text-zinc-900 dark:text-zinc-200" htmlFor="referencias">
              Referencias <span className="text-zinc-500 font-normal lowercase">(opc.)</span>
            </label>
            <input
              id="referencias"
              name="referencias"
              type="text"
              value={formData.referencias}
              onChange={handleInputChange}
              placeholder="Rejas..."
              className="flex h-11 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#18181b] px-3.5 py-2 text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Provincia (Select) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider flex items-center justify-between text-zinc-900 dark:text-zinc-200" htmlFor="provincia">
            <span>Provincia *</span>
            {loadingProvincias && (
              <span className="text-[11px] text-zinc-500 font-normal flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Cargando...
              </span>
            )}
          </label>
          
          {loadingProvincias ? (
            <div className="h-11 w-full animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800"></div>
          ) : errorProvincias ? (
            <div className="flex items-center justify-between p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900/60">
              <span>{errorProvincias}</span>
              <button type="button" onClick={loadProvincias} className="font-bold underline cursor-pointer">
                Reintentar
              </button>
            </div>
          ) : (
            <select
              id="provincia"
              name="provincia"
              value={selectedProvincia}
              onChange={(e) => handleProvinciaChange(e.target.value)}
              required
              className="flex h-11 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#18181b] px-3.5 py-2 text-sm font-medium text-zinc-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors cursor-pointer"
            >
              <option value="">▼ Selecciona una provincia...</option>
              {provincias.map((p) => (
                <option key={p.id} value={p.nombre} className="text-zinc-900 dark:text-white bg-white dark:bg-zinc-900">
                  {p.nombre}
                </option>
              ))}
            </select>
          )}
          {touched.provincia && errors.provincia && (
            <p className="text-[11px] text-red-500 font-semibold">{errors.provincia}</p>
          )}
        </div>

        {/* Localidad (Select) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider flex items-center justify-between text-zinc-900 dark:text-zinc-200" htmlFor="localidad">
            <span>Localidad *</span>
            {loadingLocalidades && (
              <span className="text-[11px] text-zinc-500 font-normal flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Cargando...
              </span>
            )}
          </label>

          {loadingLocalidades ? (
            <div className="h-11 w-full animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800"></div>
          ) : errorLocalidades ? (
            <div className="flex items-center justify-between p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900/60">
              <span>{errorLocalidades}</span>
              <button type="button" onClick={() => handleProvinciaChange(selectedProvincia)} className="font-bold underline cursor-pointer">
                Reintentar
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {localidades.length > 20 && (
                <input 
                  type="text" 
                  placeholder="🔍 Buscar localidad..." 
                  value={searchLocalidad}
                  onChange={(e) => setSearchLocalidad(e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] px-3 py-1 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
                />
              )}
              <select
                id="localidad"
                name="localidad"
                value={selectedLocalidad}
                onChange={(e) => handleLocalidadChange(e.target.value)}
                disabled={!selectedProvincia || localidades.length === 0}
                required
                className="flex h-11 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#18181b] px-3.5 py-2 text-sm font-medium text-zinc-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors disabled:bg-zinc-100 dark:disabled:bg-zinc-900 disabled:text-zinc-400 disabled:cursor-not-allowed cursor-pointer"
              >
                <option value="">
                  {!selectedProvincia 
                    ? 'Primero selecciona una provincia' 
                    : localidades.length === 0 
                    ? 'No hay localidades cargadas' 
                    : '▼ Selecciona una localidad...'}
                </option>
                {filteredLocalidades.map((loc) => (
                  <option key={loc.id} value={loc.nombre} className="text-zinc-900 dark:text-white bg-white dark:bg-zinc-900">
                    {loc.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}
          {touched.localidad && errors.localidad && (
            <p className="text-[11px] text-red-500 font-semibold">{errors.localidad}</p>
          )}
        </div>

        {/* Código Postal */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider block text-zinc-900 dark:text-zinc-200" htmlFor="codigo_postal">
            Código Postal *
          </label>
          <input
            id="codigo_postal"
            name="codigo_postal"
            type="text"
            value={codigoPostal}
            onChange={(e) => {
              setCodigoPostal(e.target.value);
              setTouched(prev => ({ ...prev, codigoPostal: true }));
            }}
            readOnly={isCpReadOnly}
            placeholder={!selectedLocalidad ? 'Selecciona provincia y localidad' : 'Ej: 9100'}
            required
            className={`flex h-11 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 px-3.5 py-2 text-sm font-bold text-zinc-900 dark:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              isCpReadOnly 
                ? 'bg-zinc-100 dark:bg-[#141416] text-zinc-700 dark:text-zinc-300 cursor-not-allowed' 
                : 'bg-white dark:bg-[#18181b]'
            }`}
          />
          {cpMessage && (
            <p className="text-[11px] text-amber-500 font-medium">{cpMessage}</p>
          )}
          {touched.codigoPostal && errors.codigoPostal && (
            <p className="text-[11px] text-red-500 font-semibold">{errors.codigoPostal}</p>
          )}
        </div>
      </div>

      {/* Dynamic Shipping Notification Block */}
      {selectedLocalidad && (
        <div className="pt-2">
          <input 
            type="hidden" 
            name="shipping_quote_required" 
            value={isShippingQuoteRequired ? 'true' : 'false'} 
          />

          {isChubutTrelew ? (
            <div className="p-4 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-emerald-950 dark:text-emerald-300">
                  🚀 Envío en el día (Trelew) - GRATIS
                </h4>
                <p className="text-xs text-emerald-800 dark:text-emerald-400 mt-0.5 leading-relaxed">
                  Tu dirección se encuentra en Trelew: coordinamos la entrega directa en el día sin costo.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-sky-50/90 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200 flex items-start gap-3">
              <Truck className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-sky-950 dark:text-sky-300">
                  🚚 Envíos y Tiempos Estimados
                </h4>
                <p className="text-xs text-sky-800 dark:text-sky-400 mt-0.5 leading-relaxed">
                  El costo del envío será cotizado por <strong>Correo Argentino</strong> tras confirmar la compra. Nos contactaremos por WhatsApp.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full h-11 text-sm font-bold mt-4 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Creando cuenta...</span>
          </>
        ) : (
          <span>Crear Cuenta</span>
        )}
      </button>

      {/* Footer Link */}
      <div className="text-center text-xs text-zinc-500 pt-2">
        ¿Ya tienes cuenta?{' '}
        <Link 
          href="/login" 
          className="text-emerald-500 hover:text-emerald-400 font-bold underline underline-offset-4 transition-colors"
        >
          Inicia Sesión aquí
        </Link>
      </div>
    </form>
  );
}
