'use client';

import { useState, useEffect } from 'react';
import { getStoreSettings, updateStoreSettings } from '@/actions/settings';
import { Save, Plus, Trash, Image as ImageIcon, Sun, Moon, Palette, Sparkles } from 'lucide-react';

export function PersonalizeForm({ initialSettings }: { initialSettings: any }) {
  const [settings, setSettings] = useState<any>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Theme Mode & Colors
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'gradient'>(initialSettings?.theme_mode || 'light');
  const [gradientFrom, setGradientFrom] = useState<string>(initialSettings?.gradient_color_from || '#18181b');
  const [gradientTo, setGradientTo] = useState<string>(initialSettings?.gradient_color_to || '#09090b');

  // Image previews
  const [logoPreview, setLogoPreview] = useState<string>(initialSettings.store_logo_url || '');
  const [heroPreview, setHeroPreview] = useState<string>(initialSettings.hero_image_url || '');
  const [style1Preview, setStyle1Preview] = useState<string>(initialSettings.style_1_image || '');
  const [style2Preview, setStyle2Preview] = useState<string>(initialSettings.style_2_image || '');
  const [style3Preview, setStyle3Preview] = useState<string>(initialSettings.style_3_image || '');
  const [style4Preview, setStyle4Preview] = useState<string>(initialSettings.style_4_image || '');
  
  // Brands logic
  const [brands, setBrands] = useState<any[]>(() => {
    const rawBrands = initialSettings.brands_images || [];
    return rawBrands.map((b: any) => {
      if (typeof b === 'string') return { type: 'image', value: b };
      return b;
    });
  });
  const [newTextBrand, setNewTextBrand] = useState('');

  // Discount codes logic
  const [discountCodes, setDiscountCodes] = useState<{ code: string; percentage: number }[]>(() => {
    if (initialSettings.discount_codes) {
      if (typeof initialSettings.discount_codes === 'string') {
        try {
          return JSON.parse(initialSettings.discount_codes);
        } catch (e) {}
      } else if (Array.isArray(initialSettings.discount_codes)) {
        return initialSettings.discount_codes;
      }
    }
    if (initialSettings.discount_code) {
      return [{
        code: initialSettings.discount_code,
        percentage: Number(initialSettings.discount_percentage) || 0
      }];
    }
    return [];
  });

  const handleAddDiscountCode = () => {
    setDiscountCodes(prev => [...prev, { code: '', percentage: 10 }]);
  };

  const handleUpdateDiscountCode = (index: number, field: 'code' | 'percentage', value: any) => {
    setDiscountCodes(prev => {
      const next = [...prev];
      if (field === 'code') {
        next[index] = { ...next[index], code: value.toUpperCase() };
      } else {
        next[index] = { ...next[index], percentage: Number(value) || 0 };
      }
      return next;
    });
  };

  const handleRemoveDiscountCode = (index: number) => {
    setDiscountCodes(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'hero' | 'style1' | 'style2' | 'style3' | 'style4') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (type === 'logo') setLogoPreview(url);
      if (type === 'hero') setHeroPreview(url);
      if (type === 'style1') setStyle1Preview(url);
      if (type === 'style2') setStyle2Preview(url);
      if (type === 'style3') setStyle3Preview(url);
      if (type === 'style4') setStyle4Preview(url);
    }
  };

  const removeExistingBrand = (index: number) => {
    setBrands(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddTextBrand = () => {
    if (newTextBrand.trim()) {
      setBrands(prev => [...prev, { type: 'text', value: newTextBrand.trim() }]);
      setNewTextBrand('');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (brands.length > 0 && brands.length < 5) {
      setMessage('Error: Debes agregar al menos 5 marcas (o ninguna para usar las predeterminadas).');
      return;
    }

    setSaving(true);
    setMessage('');
    
    const formData = new FormData(e.currentTarget);
    formData.append('brands_images_json', JSON.stringify(brands));
    formData.append('discount_codes_json', JSON.stringify(discountCodes));

    const res = await updateStoreSettings(null, formData);
    if (res?.success) {
      setMessage('¡Configuración guardada exitosamente!');
      // Reload settings to get updated URLs
      const data = await getStoreSettings();
      if (data) {
        const rawBrands = data.brands_images || [];
        const mapped = rawBrands.map((b: any) => {
          if (typeof b === 'string') return { type: 'image', value: b };
          return b;
        });
        setBrands(mapped);
        setLogoPreview(data.store_logo_url || '');
        setHeroPreview(data.hero_image_url || '');
        if (data.theme_mode) setThemeMode(data.theme_mode);
        if (data.gradient_color_from) setGradientFrom(data.gradient_color_from);
        if (data.gradient_color_to) setGradientTo(data.gradient_color_to);
        if (data.discount_codes) {
          let dc = data.discount_codes;
          if (typeof dc === 'string') {
            try { dc = JSON.parse(dc); } catch(e){}
          }
          if (Array.isArray(dc)) setDiscountCodes(dc);
        } else if (data.discount_code) {
          setDiscountCodes([{ code: data.discount_code, percentage: Number(data.discount_percentage) || 0 }]);
        }
      }
    } else {
      setMessage('Error: ' + (res?.error || 'Desconocido'));
    }
    setSaving(false);
  };

  const [showStatsNumbers, setShowStatsNumbers] = useState<boolean>(initialSettings.show_stats_numbers !== false);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-display uppercase">Personalizar Web</h1>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-12">

        {/* MODO DE TEMA & COLORES */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-600" />
                Modo de Tema & Apariencia Web
              </h2>
              <p className="text-xs text-gray-500 mt-1">Elegí la paleta de colores global de tu tienda online: Modo Claro, Modo Oscuro (estilo QR) o Degradé personalizado.</p>
            </div>
          </div>

          <input type="hidden" name="theme_mode" value={themeMode} />
          <input type="hidden" name="gradient_color_from" value={gradientFrom} />
          <input type="hidden" name="gradient_color_to" value={gradientTo} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setThemeMode('light')}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                themeMode === 'light'
                  ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950 shadow-md ring-2 ring-emerald-500/20'
                  : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                <Sun className="w-6 h-6" />
              </div>
              <div className="text-center">
                <span className="font-extrabold text-sm block">Modo Claro</span>
                <span className="text-[11px] text-gray-500">Fondo blanco clásico</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setThemeMode('dark')}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                themeMode === 'dark'
                  ? 'border-emerald-500 bg-zinc-900 text-white shadow-md ring-2 ring-emerald-500/30'
                  : 'border-gray-800 bg-zinc-950 text-gray-300 hover:bg-zinc-900'
              }`}
            >
              <div className="p-3 bg-zinc-800 text-zinc-100 rounded-xl">
                <Moon className="w-6 h-6" />
              </div>
              <div className="text-center">
                <span className="font-extrabold text-sm block">Modo Oscuro</span>
                <span className="text-[11px] text-zinc-400">Estilo oscuro oficial del QR</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setThemeMode('gradient')}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                themeMode === 'gradient'
                  ? 'border-emerald-500 bg-gradient-to-br from-emerald-900 via-zinc-900 to-zinc-950 text-white shadow-md ring-2 ring-emerald-500/30'
                  : 'border-emerald-900/40 bg-zinc-900 text-white hover:border-emerald-500'
              }`}
            >
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="text-center">
                <span className="font-extrabold text-sm block">Degradé</span>
                <span className="text-[11px] text-zinc-300">Gradiente personalizado</span>
              </div>
            </button>
          </div>

          {/* Selector de Colores del Degradé */}
          {themeMode === 'gradient' && (
            <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4 animate-in fade-in">
              <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-4 h-4 text-emerald-600" />
                Elegir colores del Degradé
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                    Color Inicial (Arriba)
                  </label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={gradientFrom} 
                      onChange={(e) => setGradientFrom(e.target.value)} 
                      className="h-10 w-16 cursor-pointer rounded-xl border border-zinc-300 p-1" 
                    />
                    <input 
                      type="text" 
                      value={gradientFrom} 
                      onChange={(e) => setGradientFrom(e.target.value)} 
                      className="border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono w-full" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                    Color Final (Abajo)
                  </label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={gradientTo} 
                      onChange={(e) => setGradientTo(e.target.value)} 
                      className="h-10 w-16 cursor-pointer rounded-xl border border-zinc-300 p-1" 
                    />
                    <input 
                      type="text" 
                      value={gradientTo} 
                      onChange={(e) => setGradientTo(e.target.value)} 
                      className="border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono w-full" 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Previsualización del Tema */}
          <div className="pt-2">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">Previsualización de la Web</span>
            <div 
              className="w-full rounded-2xl p-6 border transition-all duration-300 shadow-inner flex flex-col items-center justify-center text-center gap-2"
              style={{
                background: themeMode === 'light' ? '#ffffff' : themeMode === 'dark' ? '#09090b' : `linear-gradient(180deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
                color: themeMode === 'light' ? '#09090b' : '#ffffff',
                borderColor: themeMode === 'light' ? '#e4e4e7' : '#27272a'
              }}
            >
              <span className="font-extrabold text-lg tracking-wider font-display uppercase">
                {settings.store_logo_text || 'DRAVENIX'}
              </span>
              <p className="text-xs max-w-md opacity-80">
                Así se verá el fondo y la tipografía en las páginas principales de tu tienda.
              </p>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border" style={{
                background: themeMode === 'light' ? '#f4f4f5' : 'rgba(255,255,255,0.1)',
                borderColor: themeMode === 'light' ? '#e4e4e7' : 'rgba(255,255,255,0.2)'
              }}>
                ⭐ Ejemplo de Tarjeta / Botón
              </div>
            </div>
          </div>
        </section>
        
        {/* TOP BANNER */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Banner Superior (Negro)</h2>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Texto Principal</label>
              <input name="top_banner_text" defaultValue={settings.top_banner_text} className="w-full border rounded-lg p-2" placeholder="Ej: Sign up and get 20% off..." />
            </div>
          </div>
        </section>

        {/* LOGO */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Logo de la Tienda</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Texto del Logo (si no hay imagen)</label>
              <input name="store_logo_text" defaultValue={settings.store_logo_text} className="w-full border rounded-lg p-2" placeholder="Ej: DRAVENIX" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subir Imagen del Logo</label>
              <input type="file" name="store_logo_file" accept="image/*" onChange={(e) => handleImageChange(e, 'logo')} className="w-full border rounded-lg p-2" />
              {logoPreview && (
                <div className="mt-4 p-4 bg-gray-50 border rounded-lg flex items-center justify-center h-24">
                  <img src={logoPreview} alt="Logo preview" className="max-h-16 object-contain" />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* REDES SOCIALES */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Redes Sociales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
              <input name="instagram_url" defaultValue={settings.instagram_url} className="w-full border rounded-lg p-2" placeholder="https://instagram.com/tu_cuenta" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
              <input name="facebook_url" defaultValue={settings.facebook_url} className="w-full border rounded-lg p-2" placeholder="https://facebook.com/tu_pagina" />
            </div>
          </div>
        </section>

        {/* HERO SECTION */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Sección Principal (Hero)</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título Principal</label>
              <div className="flex gap-4">
                <textarea name="hero_title" defaultValue={settings.hero_title} rows={3} className="w-full border rounded-lg p-2 font-display uppercase" placeholder="Ej: ENCUENTRA LO QUE COMBINA..." />
                <div className="flex flex-col items-center shrink-0">
                  <label className="text-xs text-gray-500 mb-1">Color</label>
                  <input type="color" name="hero_title_color" defaultValue={settings.hero_title_color || '#FACC15'} className="h-10 w-10 cursor-pointer rounded border" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Usa enters para separar las líneas como quieres que se vean.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo / Descripción</label>
              <div className="flex gap-4">
                <textarea name="hero_subtitle" defaultValue={settings.hero_subtitle} rows={3} className="w-full border rounded-lg p-2" />
                <div className="flex flex-col items-center shrink-0">
                  <label className="text-xs text-gray-500 mb-1">Color</label>
                  <input type="color" name="hero_subtitle_color" defaultValue={settings.hero_subtitle_color || '#FFFFFF'} className="h-10 w-10 cursor-pointer rounded border" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagen Principal</label>
              <input type="file" name="hero_image_file" accept="image/*" onChange={(e) => handleImageChange(e, 'hero')} className="w-full border rounded-lg p-2" />
              {heroPreview && (
                <div className="mt-4 p-2 bg-gray-50 border rounded-lg h-64 overflow-hidden relative">
                  <img src={heroPreview} alt="Hero preview" className="w-full h-full object-cover object-top" />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-8 mb-4 border-b pb-2">
            <h3 className="text-lg font-bold">Estadísticas del Hero</h3>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg transition-colors">
              <input type="hidden" name="show_stats_numbers" value={showStatsNumbers ? 'true' : 'false'} />
              <input 
                type="checkbox" 
                checked={showStatsNumbers} 
                onChange={(e) => setShowStatsNumbers(e.target.checked)} 
                className="w-4 h-4 rounded text-black cursor-pointer"
              />
              Mostrar Números de Estadísticas
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border p-4 rounded-lg bg-gray-50">
              <label className="block text-xs font-bold text-gray-500 mb-1">ESTADÍSTICA 1</label>
              <input name="stats_1_number" defaultValue={settings.stats_1_number} className="w-full border rounded p-2 mb-2 font-display text-xl" placeholder="200+" />
              <input name="stats_1_label" defaultValue={settings.stats_1_label} className="w-full border rounded p-2 text-sm" placeholder="Marcas Internacionales" />
            </div>
            <div className="border p-4 rounded-lg bg-gray-50">
              <label className="block text-xs font-bold text-gray-500 mb-1">ESTADÍSTICA 2</label>
              <input name="stats_2_number" defaultValue={settings.stats_2_number} className="w-full border rounded p-2 mb-2 font-display text-xl" placeholder="2,000+" />
              <input name="stats_2_label" defaultValue={settings.stats_2_label} className="w-full border rounded p-2 text-sm" placeholder="Productos de Alta Calidad" />
            </div>
            <div className="border p-4 rounded-lg bg-gray-50">
              <label className="block text-xs font-bold text-gray-500 mb-1">ESTADÍSTICA 3</label>
              <input name="stats_3_number" defaultValue={settings.stats_3_number} className="w-full border rounded p-2 mb-2 font-display text-xl" placeholder="30,000+" />
              <input name="stats_3_label" defaultValue={settings.stats_3_label} className="w-full border rounded p-2 text-sm" placeholder="Clientes Felices" />
            </div>
          </div>
        </section>

        {/* DESCUENTO */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-3 mb-4 gap-2">
            <div>
              <h2 className="text-xl font-bold">Códigos de Descuento</h2>
              <p className="text-sm text-gray-500">Configura los códigos de descuento que los clientes pueden ingresar en la tienda para obtener una rebaja en porcentaje.</p>
            </div>
            <button
              type="button"
              onClick={handleAddDiscountCode}
              className="inline-flex items-center gap-1.5 bg-black text-white hover:bg-zinc-800 px-4 py-2 rounded-lg text-sm font-semibold transition shrink-0"
            >
              <Plus size={16} /> Agregar Código
            </button>
          </div>

          <div className="space-y-3">
            {discountCodes.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-zinc-200 rounded-xl">
                <p className="text-sm text-zinc-500 mb-3">No tienes códigos de descuento creados actualmente.</p>
                <button
                  type="button"
                  onClick={handleAddDiscountCode}
                  className="inline-flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 px-4 py-2 rounded-lg text-xs font-bold transition"
                >
                  <Plus size={14} /> + Crear primer código
                </button>
              </div>
            ) : (
              discountCodes.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-zinc-600 uppercase mb-1">
                      Código #{idx + 1}
                    </label>
                    <input
                      type="text"
                      value={item.code}
                      onChange={(e) => handleUpdateDiscountCode(idx, 'code', e.target.value)}
                      placeholder="EJ: OFERTA20"
                      className="w-full border border-zinc-300 rounded-lg p-2 font-mono uppercase text-sm font-bold bg-white"
                    />
                  </div>
                  <div className="w-full sm:w-44">
                    <label className="block text-xs font-bold text-zinc-600 uppercase mb-1">
                      Descuento (%)
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={item.percentage}
                        onChange={(e) => handleUpdateDiscountCode(idx, 'percentage', e.target.value)}
                        placeholder="10"
                        className="w-full border border-zinc-300 rounded-lg p-2 pr-8 text-sm font-bold bg-white"
                      />
                      <span className="absolute right-3 text-zinc-400 font-bold text-sm pointer-events-none">%</span>
                    </div>
                  </div>
                  <div className="flex sm:flex-col justify-end sm:self-end pb-0 sm:pb-0.5">
                    <button
                      type="button"
                      onClick={() => handleRemoveDiscountCode(idx)}
                      className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition"
                      title="Eliminar este código"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* BRANDS CAROUSEL */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Carrusel de Marcas</h2>
          <p className="text-sm text-gray-500 mb-4">Estas imágenes o textos aparecerán en la barra en movimiento debajo del Hero.</p>
          
          <div className="mb-6 flex flex-wrap items-end gap-4">
            <div className="flex items-center gap-2">
              <div>
                <input 
                  type="text" 
                  value={newTextBrand} 
                  onChange={(e) => setNewTextBrand(e.target.value)} 
                  placeholder="Escribir marca (ej. NIKE)"
                  className="border rounded-lg p-2 h-[42px]" 
                />
              </div>
              <button type="button" onClick={handleAddTextBrand} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition h-[42px] flex items-center gap-2">
                <Plus size={16} /> Agregar Texto
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Existing brands */}
            {brands.map((item, index) => (
              <div key={`existing-${index}`} className="relative border rounded-lg p-4 bg-gray-100 flex items-center justify-center h-24 group overflow-hidden">
                {item.type === 'image' ? (
                  <img src={item.value} alt={`Brand ${index}`} className="max-h-12 max-w-full object-contain" />
                ) : (
                  <span className="font-display font-bold uppercase truncate px-2">{item.value}</span>
                )}
                <button type="button" onClick={() => removeExistingBrand(index)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash size={12} />
                </button>
              </div>
            ))}
          </div>
          {brands.length === 0 && (
            <div className="text-center p-8 text-gray-400 border-2 border-dashed rounded-lg">
              No hay marcas personalizadas. Se mostrarán los textos por defecto (VERSACE, ZARA...).
            </div>
          )}
        </section>

        {/* BUSCAR POR ESTILO */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Sección "Buscar por Estilo"</h2>
          <p className="text-sm text-gray-500 mb-4">Personaliza hasta 4 recuadros de estilos. Si dejas el Título vacío, ese recuadro no se mostrará.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((num) => {
              const preview = num === 1 ? style1Preview : num === 2 ? style2Preview : num === 3 ? style3Preview : style4Preview;
              const type = `style${num}` as any;
              return (
                <div key={num} className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-bold mb-3">Estilo {num}</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input name={`style_${num}_title`} defaultValue={settings[`style_${num}_title`]} className="w-full border rounded p-2" placeholder="Ej: Suplementos" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Enlace (URL)</label>
                      <input name={`style_${num}_link`} defaultValue={settings[`style_${num}_link`]} className="w-full border rounded p-2" placeholder="Ej: /shop?type=SUPPLEMENT o /suplementos" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Imagen de Fondo</label>
                      <input type="file" name={`style_${num}_file`} accept="image/*" onChange={(e) => handleImageChange(e, type)} className="w-full border rounded p-2" />
                      {preview && (
                        <div className="mt-2 p-1 bg-white border rounded h-32 overflow-hidden relative">
                          <img src={preview} alt={`Estilo ${num}`} className="w-full h-full object-cover rounded" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="sticky bottom-6 bg-white p-4 border rounded-xl shadow-lg flex justify-end z-50">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-black text-white px-8 py-3 rounded-full flex items-center gap-2 hover:bg-gray-800 transition disabled:opacity-50"
          >
            {saving ? 'Guardando...' : <><Save size={20} /> Guardar Cambios</>}
          </button>
        </div>
      </form>
    </div>
  );
}
