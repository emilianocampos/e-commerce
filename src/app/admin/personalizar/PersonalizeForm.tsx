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
  const [gradientTextPrimary, setGradientTextPrimary] = useState<string>(initialSettings?.gradient_text_primary || '#ffffff');
  const [gradientTextSecondary, setGradientTextSecondary] = useState<string>(initialSettings?.gradient_text_secondary || '#d4d4d8');

  // Image previews
  const [logoPreview, setLogoPreview] = useState<string>(initialSettings.store_logo_url || '');
  const [faviconPreview, setFaviconPreview] = useState<string>(initialSettings.favicon_url || '');
  const [heroPreview, setHeroPreview] = useState<string>(initialSettings.hero_image_url || '');
  const [heroMobilePreview, setHeroMobilePreview] = useState<string>(initialSettings.hero_mobile_image_url || '');
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
  const [pendingBrandFiles, setPendingBrandFiles] = useState<{ file: File; preview: string }[]>([]);

  // Discount codes logic
  const [discountCodes, setDiscountCodes] = useState<{ code: string; percentage: number }[]>(() => {
    if (initialSettings.discount_codes) {
      let dc = initialSettings.discount_codes;
      if (typeof dc === 'string') {
        try { dc = JSON.parse(dc); } catch(e){}
      }
      if (Array.isArray(dc) && dc.length > 0) return dc;
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon' | 'hero' | 'heroMobile' | 'style1' | 'style2' | 'style3' | 'style4') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (type === 'logo') setLogoPreview(url);
      if (type === 'favicon') setFaviconPreview(url);
      if (type === 'hero') setHeroPreview(url);
      if (type === 'heroMobile') setHeroMobilePreview(url);
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

  const handleBrandImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validNewFiles: { file: File; preview: string }[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
      if (!isPng) {
        alert(`El archivo "${file.name}" no es formato PNG. Solo se permiten imágenes en formato .PNG (con fondo transparente preferentemente).`);
        continue;
      }
      validNewFiles.push({
        file,
        preview: URL.createObjectURL(file)
      });
    }

    if (validNewFiles.length > 0) {
      setPendingBrandFiles(prev => [...prev, ...validNewFiles]);
    }
    e.target.value = '';
  };

  const removePendingBrand = (index: number) => {
    setPendingBrandFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const totalBrands = brands.length + pendingBrandFiles.length;
    if (totalBrands > 0 && totalBrands < 5) {
      setMessage('Error: Debes agregar al menos 5 marcas (o ninguna para usar las predeterminadas).');
      return;
    }

    setSaving(true);
    setMessage('');
    
    const formData = new FormData(e.currentTarget);
    formData.append('brands_images_json', JSON.stringify(brands));
    formData.append('discount_codes_json', JSON.stringify(discountCodes));

    // Append new PNG brand logo files
    pendingBrandFiles.forEach(({ file }) => {
      formData.append('new_brand_files', file);
    });

    const res = await updateStoreSettings(null, formData);
    if (res?.success) {
      setMessage('¡Configuración guardada exitosamente!');
      setPendingBrandFiles([]);
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
        setFaviconPreview(data.favicon_url || '');
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setThemeMode('light')}
              className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                themeMode === 'light'
                  ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950 shadow-md ring-2 ring-emerald-500/20'
                  : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                <Sun className="w-7 h-7" />
              </div>
              <div className="text-center">
                <span className="font-extrabold text-base block">Modo Claro</span>
                <span className="text-xs text-gray-500">Fondo blanco clásico y limpio</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setThemeMode('dark')}
              className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                themeMode === 'dark'
                  ? 'border-emerald-500 bg-zinc-900 text-white shadow-md ring-2 ring-emerald-500/30'
                  : 'border-gray-800 bg-zinc-950 text-gray-300 hover:bg-zinc-900'
              }`}
            >
              <div className="p-3 bg-zinc-800 text-zinc-100 rounded-xl">
                <Moon className="w-7 h-7" />
              </div>
              <div className="text-center">
                <span className="font-extrabold text-base block">Modo Oscuro (Estilo Klonfark)</span>
                <span className="text-xs text-zinc-400">Fondo oscuro con títulos y precios en blanco nítido</span>
              </div>
            </button>
          </div>

          {/* Previsualización del Tema */}
          <div className="pt-3">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">Previsualización de la Web</span>
            <div 
              className="w-full rounded-2xl p-6 border transition-all duration-300 shadow-inner flex flex-col items-center justify-center text-center gap-3"
              style={{
                background: themeMode === 'dark' ? '#09090b' : '#ffffff',
                color: themeMode === 'dark' ? '#ffffff' : '#09090b',
                borderColor: themeMode === 'dark' ? '#27272a' : '#e4e4e7'
              }}
            >
              <span className="font-extrabold text-lg tracking-wider font-display uppercase">
                {settings.store_logo_text || 'KLONFARK'}
              </span>
              <p className="text-xs max-w-md opacity-80" style={{ color: themeMode === 'dark' ? '#a1a1aa' : '#71717a' }}>
                Así se verá el fondo, los títulos de productos y los precios en tu tienda.
              </p>
              <div 
                className="mt-1 flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold border" 
                style={{
                  background: themeMode === 'dark' ? '#18181b' : '#f4f4f5',
                  borderColor: themeMode === 'dark' ? '#27272a' : '#e4e4e7',
                  color: themeMode === 'dark' ? '#ffffff' : '#09090b'
                }}
              >
                <span>Calza Oxford Cross V</span>
                <span className="font-extrabold" style={{ color: themeMode === 'dark' ? '#ffffff' : '#09090b' }}>$30.099,00</span>
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

        {/* LOGO & FAVICON */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Identidad: Logo y Favicon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Texto del Logo (si no hay imagen)</label>
              <input name="store_logo_text" defaultValue={settings.store_logo_text} className="w-full border rounded-lg p-2" placeholder="Ej: KLONFARK" />
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

            {/* SUBIR FAVICON */}
            <div className="md:col-span-2 pt-4 border-t border-zinc-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-base font-bold text-zinc-900">Favicon (Ícono del Navegador)</h3>
                  <p className="text-xs text-zinc-500">Es el ícono pequeño que se muestra en la pestaña del navegador junto al título de la página.</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-full shrink-0">
                  Recomendado: 32x32 o 64x64 px (PNG / ICO)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <input 
                    type="file" 
                    name="favicon_file" 
                    accept=".ico,.png,.svg,.jpg,.jpeg,image/*" 
                    onChange={(e) => handleImageChange(e, 'favicon')} 
                    className="w-full border rounded-lg p-2 text-sm bg-white" 
                  />
                  <p className="text-[11px] text-zinc-400 mt-1">Sube el ícono de tu marca en formato PNG, ICO o SVG.</p>
                </div>

                {/* Previsualización en pestaña simulada */}
                <div className="bg-zinc-100 p-3 rounded-xl border border-zinc-200">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
                    Previsualización en Pestaña:
                  </span>
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-zinc-300 shadow-xs max-w-[240px]">
                    {faviconPreview ? (
                      <img src={faviconPreview} alt="Favicon preview" className="w-4 h-4 object-contain shrink-0" />
                    ) : (
                      <div className="w-4 h-4 bg-zinc-800 rounded-xs flex items-center justify-center text-[9px] text-white font-bold shrink-0">
                        K
                      </div>
                    )}
                    <span className="text-xs font-semibold text-zinc-800 truncate">
                      {settings.store_logo_text || 'KLONFARK'} | Tienda
                    </span>
                  </div>
                </div>
              </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagen Desktop (Computadora)</label>
                <input type="file" name="hero_image_file" accept="image/*" onChange={(e) => handleImageChange(e, 'hero')} className="w-full border rounded-lg p-2" />
                {heroPreview && (
                  <div className="mt-3 p-2 bg-gray-50 border rounded-lg h-48 overflow-hidden relative">
                    <img src={heroPreview} alt="Hero Desktop preview" className="w-full h-full object-cover object-center" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagen Mobile (Celular - Opcional)</label>
                <input type="file" name="hero_mobile_image_file" accept="image/*" onChange={(e) => handleImageChange(e, 'heroMobile')} className="w-full border rounded-lg p-2" />
                {heroMobilePreview ? (
                  <div className="mt-3 p-2 bg-gray-50 border rounded-lg h-48 overflow-hidden relative">
                    <img src={heroMobilePreview} alt="Hero Mobile preview" className="w-full h-full object-cover object-center" />
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 mt-2">Si no cargas una específica para mobile, se adaptará automáticamente la imagen desktop.</p>
                )}
              </div>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 mb-4 gap-2">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Carrusel de Marcas (Banner en Movimiento)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Agrega marcas en texto o sube logos oficiales en formato <strong>PNG</strong> (fondo transparente).</p>
            </div>
            <span className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full shrink-0">
              Solo formato .PNG
            </span>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            {/* Agregar por Texto */}
            <div className="flex items-center gap-2 flex-1 min-w-[260px]">
              <input 
                type="text" 
                value={newTextBrand} 
                onChange={(e) => setNewTextBrand(e.target.value)} 
                placeholder="Escribir marca en texto (ej. NIKE, STAR NUTRITION)"
                className="flex-1 border rounded-xl p-2.5 text-sm font-semibold bg-white" 
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTextBrand();
                  }
                }}
              />
              <button 
                type="button" 
                onClick={handleAddTextBrand} 
                className="bg-zinc-800 hover:bg-zinc-900 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Plus size={16} /> + Texto
              </button>
            </div>

            <div className="text-xs font-bold text-gray-400">O</div>

            {/* Subir Logo PNG */}
            <div>
              <label className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-sm cursor-pointer">
                <ImageIcon size={16} /> + Subir Logo (PNG)
                <input 
                  type="file" 
                  accept=".png,image/png" 
                  multiple 
                  onChange={handleBrandImageUpload} 
                  className="sr-only" 
                />
              </label>
            </div>
          </div>

          {/* Grid de Marcas Guardadas y Nuevas */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* Guardadas */}
            {brands.map((item, index) => (
              <div key={`existing-${index}`} className="relative border border-zinc-200 rounded-xl p-3 bg-zinc-900 text-white flex flex-col items-center justify-center h-24 group overflow-hidden shadow-xs">
                {item.type === 'image' ? (
                  <img src={item.value} alt={`Marca ${index + 1}`} className="max-h-12 max-w-full object-contain p-1" />
                ) : (
                  <span className="font-display font-bold uppercase text-xs text-center px-1 truncate w-full text-zinc-100">{item.value}</span>
                )}
                <span className="absolute bottom-1 text-[9px] uppercase font-bold text-zinc-400 tracking-wider">
                  {item.type === 'image' ? 'PNG' : 'Texto'}
                </span>
                <button 
                  type="button" 
                  onClick={() => removeExistingBrand(index)} 
                  className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-sm cursor-pointer"
                  title="Eliminar marca"
                >
                  <Trash size={12} />
                </button>
              </div>
            ))}

            {/* Pendientes de Guardar (Nuevas) */}
            {pendingBrandFiles.map((item, index) => (
              <div key={`pending-${index}`} className="relative border-2 border-dashed border-emerald-500 rounded-xl p-3 bg-emerald-950/30 text-white flex flex-col items-center justify-center h-24 group overflow-hidden shadow-xs">
                <img src={item.preview} alt={`Nueva Marca ${index + 1}`} className="max-h-12 max-w-full object-contain p-1" />
                <span className="absolute bottom-1 text-[9px] uppercase font-bold text-emerald-400 tracking-wider">
                  Por Guardar (PNG)
                </span>
                <button 
                  type="button" 
                  onClick={() => removePendingBrand(index)} 
                  className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1 rounded-full transition-opacity hover:bg-red-700 shadow-sm cursor-pointer"
                  title="Quitar"
                >
                  <Trash size={12} />
                </button>
              </div>
            ))}
          </div>

          {brands.length === 0 && pendingBrandFiles.length === 0 && (
            <div className="text-center p-8 text-gray-400 border-2 border-dashed rounded-xl">
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

        {/* GOOGLE ADS, MERCHANT & SEARCH CONSOLE */}
        <section className="bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-transparent p-6 rounded-xl border border-blue-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2 border-b border-blue-100 pb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
              G
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900">Google Ads, Search Console y Merchant Center</h2>
              <p className="text-xs text-zinc-500">Conecta tu tienda con Google para publicidad, catálogo de Google Shopping y posicionamiento web.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                ID de Google Tag / Google Ads / GA4
              </label>
              <input
                type="text"
                name="google_tag_id"
                defaultValue={settings.google_tag_id || ''}
                placeholder="Ej: AW-1234567890 o G-ABCDEF1234"
                className="w-full border border-zinc-300 rounded-lg p-2.5 text-sm font-mono bg-white"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Pega tu código de Google Ads (AW-...) o Google Analytics (G-...) para medir visitas y conversiones de compra.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                Código de Verificación de Google Search Console
              </label>
              <input
                type="text"
                name="google_site_verification"
                defaultValue={settings.google_site_verification || ''}
                placeholder="Ej: abc123def456ghi789..."
                className="w-full border border-zinc-300 rounded-lg p-2.5 text-sm font-mono bg-white"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Código HTML de verificación que te da Search Console (el valor del tag meta google-site-verification).
              </p>
            </div>

            <div className="md:col-span-2 bg-white p-4 rounded-xl border border-blue-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-2">
                🛍️ URL del Feed de Google Merchant Center (Google Shopping)
              </h4>
              <p className="text-xs text-zinc-600 mb-2">
                Copia este enlace y pégalo en Google Merchant Center como tu <strong>Feed Primario</strong> de productos:
              </p>
              <div className="flex items-center gap-2 bg-zinc-50 p-2.5 rounded-lg border border-zinc-200">
                <code className="text-xs font-mono text-blue-600 font-semibold select-all flex-1 truncate">
                  {typeof window !== 'undefined' ? `${window.location.origin}/api/merchant-feed` : 'https://tudominio.com/api/merchant-feed'}
                </code>
              </div>
            </div>
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
