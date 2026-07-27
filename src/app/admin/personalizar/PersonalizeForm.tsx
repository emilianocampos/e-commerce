'use client';

import { useState, useEffect } from 'react';
import { getStoreSettings, updateStoreSettings } from '@/actions/settings';
import { Save, Plus, Trash, Image as ImageIcon } from 'lucide-react';

export function PersonalizeForm({ initialSettings }: { initialSettings: any }) {
  const [settings, setSettings] = useState<any>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
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
  const [newBrandFiles, setNewBrandFiles] = useState<File[]>([]);
  const [newTextBrand, setNewTextBrand] = useState('');

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

  const handleAddBrandFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFilesArray = Array.from(files);
      setNewBrandFiles(prev => [...prev, ...newFilesArray]);
    }
  };

  const removeExistingBrand = (index: number) => {
    setBrands(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewBrandFile = (index: number) => {
    setNewBrandFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddTextBrand = () => {
    if (newTextBrand.trim()) {
      setBrands(prev => [...prev, { type: 'text', value: newTextBrand.trim() }]);
      setNewTextBrand('');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    const formData = new FormData(e.currentTarget);
    formData.append('brands_images_json', JSON.stringify(brands));
    
    newBrandFiles.forEach(file => {
      formData.append('new_brand_files', file);
    });

    const res = await updateStoreSettings(null, formData);
    if (res?.success) {
      setMessage('¡Configuración guardada exitosamente!');
      setNewBrandFiles([]); // Reset new files
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
      }
    } else {
      setMessage('Error: ' + (res?.error || 'Desconocido'));
    }
    setSaving(false);
  };

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
              <input name="store_logo_text" defaultValue={settings.store_logo_text} className="w-full border rounded-lg p-2" placeholder="Ej: SHOP.CO" />
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

        {/* HERO SECTION */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Sección Principal (Hero)</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título Principal</label>
              <textarea name="hero_title" defaultValue={settings.hero_title} rows={3} className="w-full border rounded-lg p-2 font-display uppercase" placeholder="Ej: ENCUENTRA LO QUE COMBINA..." />
              <p className="text-xs text-gray-500 mt-1">Usa enters para separar las líneas como quieres que se vean.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo / Descripción</label>
              <textarea name="hero_subtitle" defaultValue={settings.hero_subtitle} rows={3} className="w-full border rounded-lg p-2" />
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
          
          <h3 className="text-lg font-bold mt-8 mb-4">Estadísticas del Hero</h3>
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

        {/* BRANDS CAROUSEL */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Carrusel de Marcas</h2>
          <p className="text-sm text-gray-500 mb-4">Estas imágenes o textos aparecerán en la barra en movimiento debajo del Hero.</p>
          
          <div className="mb-6 flex flex-wrap items-end gap-4">
            <label className="flex items-center gap-2 cursor-pointer bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition h-[42px]">
              <Plus size={16} /> Subir Imagen
              <input type="file" multiple accept="image/*" onChange={handleAddBrandFile} className="hidden" />
            </label>
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
            
            {/* New files to upload */}
            {newBrandFiles.map((file, index) => (
              <div key={`new-${index}`} className="relative border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50 flex flex-col items-center justify-center h-24 group">
                <ImageIcon size={24} className="text-blue-400 mb-1" />
                <span className="text-xs text-blue-600 truncate w-full text-center">{file.name}</span>
                <button type="button" onClick={() => removeNewBrandFile(index)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash size={12} />
                </button>
                <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center text-xs font-bold text-blue-800 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                  Por Subir
                </div>
              </div>
            ))}
          </div>
          {brands.length === 0 && newBrandFiles.length === 0 && (
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
                      <input name={`style_${num}_title`} defaultValue={settings[`style_${num}_title`]} className="w-full border rounded p-2" placeholder="Ej: Hombre" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Enlace (URL)</label>
                      <input name={`style_${num}_link`} defaultValue={settings[`style_${num}_link`]} className="w-full border rounded p-2" placeholder="Ej: /shop?gender=MEN" />
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
