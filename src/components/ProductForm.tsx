'use client';

import { useActionState, useState, useEffect, startTransition } from 'react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Product, Brand, Category, Subcategory } from '@/types/product';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { showToast } from 'nextjs-toast-notify';
import { compressImage } from '@/lib/imageCompression';

interface ProductFormProps {
  action: (state: any, formData: FormData) => Promise<any>;
  initialData?: Product;
  brands: Brand[];
  categories: Category[];
  subcategories: Subcategory[];
}

export function ProductForm({ action, initialData, brands, categories, subcategories }: ProductFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      showToast.success(initialData ? 'Producto actualizado correctamente' : 'Producto creado correctamente', { position: 'top-center' });
      router.push('/admin/productos');
    } else if (state?.error) {
      showToast.error(`Error: ${state.error}`, { position: 'top-center' });
    }
  }, [state, initialData, router]);

  // Main Image
  const [previewImage, setPreviewImage] = useState<string | null>(initialData?.image ?? null);
  
  // Optional Images
  const initialOptImages = [null, null, null] as (string | null)[];
  if (initialData?.product_images) {
    initialData.product_images.forEach(img => {
      if (img.order >= 1 && img.order <= 3) {
        initialOptImages[img.order - 1] = img.url;
      }
    });
  }
  const [previewImagesOpt, setPreviewImagesOpt] = useState<(string | null)[]>(initialOptImages);

  const [selectedSizes, setSelectedSizes] = useState<string[]>(initialData?.sizes || []);

  const initialSizeColors: Record<string, string[]> = {};
  if (initialData?.product_variants && Array.isArray(initialData.product_variants)) {
    initialData.product_variants.forEach((v) => {
      if (v.size && v.color) {
        if (!initialSizeColors[v.size]) {
          initialSizeColors[v.size] = [];
        }
        if (!initialSizeColors[v.size].includes(v.color)) {
          initialSizeColors[v.size].push(v.color);
        }
      }
    });
  }
  const [sizeColors, setSizeColors] = useState<Record<string, string[]>>(initialSizeColors);
  const [customColorInput, setCustomColorInput] = useState<Record<string, string>>({});
  
  // Category logic (Ropa vs Suplementos)
  const [productType, setProductType] = useState<string>(initialData?.type || 'CLOTHES');
  const [productGender, setProductGender] = useState<string>(initialData?.gender || 'UNISEX');

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreviewImage(URL.createObjectURL(file));
  };

  const handleOptImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const newPreviews = [...previewImagesOpt];
      newPreviews[index] = URL.createObjectURL(file);
      setPreviewImagesOpt(newPreviews);
    }
  };

  const toggleColorForSize = (size: string, colorName: string) => {
    const current = sizeColors[size] || [];
    if (current.includes(colorName)) {
      setSizeColors({ ...sizeColors, [size]: current.filter(c => c !== colorName) });
    } else {
      setSizeColors({ ...sizeColors, [size]: [...current, colorName] });
    }
  };

  const addCustomColorForSize = (size: string) => {
    const colorName = (customColorInput[size] || '').trim();
    if (!colorName) return;
    const current = sizeColors[size] || [];
    if (!current.includes(colorName)) {
      setSizeColors({ ...sizeColors, [size]: [...current, colorName] });
    }
    setCustomColorInput({ ...customColorInput, [size]: '' });
  };

  const removeColorFromSize = (size: string, colorName: string) => {
    const current = sizeColors[size] || [];
    setSizeColors({ ...sizeColors, [size]: current.filter(c => c !== colorName) });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (productType === 'CLOTHES') {
      if (selectedSizes.length === 0) {
        showToast.error('Debes seleccionar al menos un talle', { position: 'top-center' });
        return;
      }
      for (const size of selectedSizes) {
        const colors = sizeColors[size] || [];
        if (colors.length === 0) {
          showToast.error(`Debes asignar al menos un color para el talle ${size}`, { position: 'top-center' });
          return;
        }
      }
    }

    const formData = new FormData(e.currentTarget);
    
    // Compress main image if exists
    const mainImg = formData.get('image_main') as File | null;
    if (mainImg && mainImg.size > 0) {
      const compressedMain = await compressImage(mainImg);
      formData.set('image_main', compressedMain);
    }

    // Compress optional images if exists
    for (let i = 1; i <= 3; i++) {
      const optImg = formData.get(`image_opt_${i}`) as File | null;
      if (optImg && optImg.size > 0) {
        const compressedOpt = await compressImage(optImg);
        formData.set(`image_opt_${i}`, compressedOpt);
      }
    }

    startTransition(() => {
      formAction(formData);
    });
  };

  const PRESET_COLORS = [
    { name: 'Negro', hex: '#000000', border: false },
    { name: 'Blanco', hex: '#FFFFFF', border: true },
    { name: 'Gris', hex: '#6B7280', border: false },
    { name: 'Rojo', hex: '#EF4444', border: false },
    { name: 'Azul', hex: '#3B82F6', border: false },
    { name: 'Verde', hex: '#22C55E', border: false },
    { name: 'Amarillo', hex: '#EAB308', border: false },
    { name: 'Beige', hex: '#F5F5DC', border: true },
    { name: 'Rosa', hex: '#EC4899', border: false },
    { name: 'Violeta', hex: '#A855F7', border: false },
    { name: 'Naranja', hex: '#F97316', border: false },
    { name: 'Marrón', hex: '#78350F', border: false },
    { name: 'Celeste', hex: '#38BDF8', border: false },
    { name: 'Bordo', hex: '#800020', border: false },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {state?.error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
          {state.error}
        </div>
      )}

      {/* CATEGORÍA PRINCIPAL */}
      <div className="space-y-2 pb-4 border-b border-zinc-100">
        <label className="block text-sm font-bold text-zinc-900">Elegir Categoría</label>
        <select 
          name="type" 
          value={productType} 
          onChange={(e) => setProductType(e.target.value)} 
          className="w-full rounded-md border border-zinc-300 p-2 text-zinc-900 bg-white"
        >
          <option value="CLOTHES">Ropa</option>
          <option value="SUPPLEMENT">Suplementos</option>
        </select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        
        {/* SUBCATEGORÍA (Solo Ropa) */}
        {productType === 'CLOTHES' && (
          <div className="space-y-4 md:col-span-2">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-zinc-900">Subcategoría</label>
              <select name="gender" value={productGender} onChange={(e) => setProductGender(e.target.value)} className="w-full rounded-md border border-zinc-300 p-2 text-zinc-900 bg-white">
                <option value="MEN">Hombre</option>
                <option value="WOMEN">Mujer</option>
                <option value="UNISEX">Urbano</option>
              </select>
            </div>
            
            {productGender === 'UNISEX' && (
              <div className="space-y-2">
                <label className="block text-sm font-bold text-zinc-900">Género Urbano</label>
                <select name="urbano_category" defaultValue={initialData?.urbano_category || 'UNISEX'} className="w-full rounded-md border border-zinc-300 p-2 text-zinc-900 bg-white">
                  <option value="UNISEX">Unisex</option>
                  <option value="MEN">Hombre</option>
                  <option value="WOMEN">Mujer</option>
                </select>
              </div>
            )}
          </div>
        )}

        <Input 
          label="Título del producto" 
          name="title" 
          required 
          defaultValue={initialData?.title} 
          placeholder={productType === 'CLOTHES' ? 'Ej: Remera sport' : 'Ej: WHEY PROTEIN VITAL'} 
        />
        
        <div className="space-y-2">
          <Input 
            label="Marca" 
            name="brand_name" 
            required
            defaultValue={initialData?.brand_id ? brands.find(b => b.id === initialData.brand_id)?.name : ''} 
            placeholder="Ej: Star Nutrition" 
          />
        </div>

        <Input label="Precio ($)" name="price" type="number" step="0.01" required defaultValue={initialData?.price} placeholder="0.00" />
        <Input label="Cantidad de stock" name="stock" type="number" required defaultValue={initialData?.stock} placeholder="Ej: 100" />
        <Input label="Precio Oferta ($)" name="sale_price" type="number" step="0.01" defaultValue={initialData?.sale_price || ''} placeholder="0.00 (Opcional)" />
        
        {/* Talles (solo ropa) */}
        {productType === 'CLOTHES' && (
          <div className="space-y-4 md:col-span-2 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
            <label className="block text-sm font-bold text-zinc-900">Talles y Colores disponibles</label>
            <div className="flex flex-wrap gap-2">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => {
                const isSelected = selectedSizes.includes(size);
                return (
                  <label key={size} className={`flex items-center justify-center min-w-12 h-10 px-3 rounded-md border text-sm font-medium cursor-pointer transition-colors ${isSelected ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 bg-white text-zinc-700'}`}>
                    <input type="checkbox" name="sizes" value={size} checked={isSelected} onChange={() => setSelectedSizes(isSelected ? selectedSizes.filter(s => s !== size) : [...selectedSizes, size])} className="sr-only" />
                    {size}
                  </label>
                );
              })}
            </div>

            {selectedSizes.length > 0 && (
              <div className="mt-4 pt-4 border-t border-zinc-200 space-y-4">
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                  Seleccionar Colores para cada Talle (Obligatorio al menos 1 color por talle)
                </label>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {selectedSizes.map((size) => {
                    const activeColors = sizeColors[size] || [];
                    const hasColors = activeColors.length > 0;
                    return (
                      <div key={size} className={`bg-white p-4 rounded-xl border transition-all shadow-sm space-y-3 ${hasColors ? 'border-zinc-300' : 'border-red-300 bg-red-50/20'}`}>
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                          <span className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                            Talle <span className="bg-zinc-900 text-white text-xs px-2 py-0.5 rounded">{size}</span>
                          </span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${hasColors ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {hasColors ? `${activeColors.length} ${activeColors.length === 1 ? 'color' : 'colores'}` : 'Sin colores'}
                          </span>
                        </div>

                        {/* Hidden input for server action submission */}
                        <input type="hidden" name={`size_color_${size}`} value={activeColors.join(', ')} />

                        {/* Selected Color Badges */}
                        {hasColors && (
                          <div className="flex flex-wrap gap-1.5 pb-1">
                            {activeColors.map((colorName) => (
                              <span key={colorName} className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-800 text-xs font-medium px-2.5 py-1 rounded-md border border-zinc-200">
                                {colorName}
                                <button type="button" onClick={() => removeColorFromSize(size, colorName)} className="text-zinc-400 hover:text-red-500 font-bold ml-1">
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Preset Swatches Selector */}
                        <div className="space-y-1">
                          <span className="text-[11px] font-semibold text-zinc-400 uppercase">Paleta de colores rápidos:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {PRESET_COLORS.map((preset) => {
                              const isChecked = activeColors.includes(preset.name);
                              return (
                                <button
                                  key={preset.name}
                                  type="button"
                                  onClick={() => toggleColorForSize(size, preset.name)}
                                  title={preset.name}
                                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border transition-all ${
                                    isChecked
                                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
                                      : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                                  }`}
                                >
                                  <span
                                    className="w-3 h-3 rounded-full shrink-0"
                                    style={{
                                      backgroundColor: preset.hex,
                                      border: preset.border ? '1px solid #D1D5DB' : 'none'
                                    }}
                                  />
                                  {preset.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Custom Color Input */}
                        <div className="pt-2 border-t border-zinc-100 flex gap-2">
                          <input
                            type="text"
                            value={customColorInput[size] || ''}
                            onChange={(e) => setCustomColorInput({ ...customColorInput, [size]: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addCustomColorForSize(size);
                              }
                            }}
                            placeholder="Otro color personalizado..."
                            className="flex-1 text-xs rounded border border-zinc-300 p-2 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                          />
                          <button
                            type="button"
                            onClick={() => addCustomColorForSize(size)}
                            className="bg-zinc-800 hover:bg-zinc-900 text-white text-xs px-3 py-1.5 rounded font-medium transition-colors"
                          >
                            + Agregar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Nutricional / Inventario (solo suplementos) */}
        {productType === 'SUPPLEMENT' && (
          <div className="space-y-4 md:col-span-2 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
            <h3 className="font-bold text-blue-900 border-b border-blue-200 pb-2">Información del Suplemento</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Entrada (Stock Ingresado)" name="supp_entrada" type="number" defaultValue={initialData?.supplement_information?.entrada || ''} />
              <Input label="Salida (Stock Retirado)" name="supp_salida" type="number" defaultValue={initialData?.supplement_information?.salida || ''} />
            </div>
            <div className="mt-4 space-y-2">
              <label className="block text-sm font-bold text-zinc-900">Sabor</label>
              <select name="supp_flavor" defaultValue={initialData?.supplement_information?.flavor || ''} className="w-full rounded-md border border-zinc-300 p-2 text-zinc-900 bg-white">
                <option value="">Seleccionar Sabor...</option>
                <option value="Neutro/sin sabor">Neutro/sin sabor</option>
                <option value="Chocolate">Chocolate</option>
                <option value="Vainilla Cream">Vainilla Cream</option>
                <option value="Banana">Banana</option>
                <option value="Frutilla">Frutilla</option>
                <option value="Cookies And Cream">Cookies And Cream</option>
                <option value="Frutos rojos">Frutos rojos</option>
                <option value="Limón">Limón</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-900">Descripción detallada</label>
        <textarea name="description" rows={4} required defaultValue={initialData?.description ?? ''} className="block w-full rounded-xl p-3 border border-zinc-300" />
      </div>

      {/* Imágenes */}
      <div className="space-y-4 pb-6">
        <h3 className="block text-sm font-medium text-zinc-900">Imágenes del Producto</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Main Image */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-zinc-500">Principal (Obligatoria)</label>
            <div className="relative h-32 w-full overflow-hidden rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 hover:bg-zinc-100 transition-colors">
              {previewImage ? (
                <Image src={previewImage} alt="Vista previa principal" fill unoptimized className="object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-xs text-zinc-400">Principal</div>
              )}
              <input type="file" name="image_main" accept="image/*" onChange={handleMainImageChange} required={!initialData} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
          </div>

          {/* Optional Images */}
          {[1, 2, 3].map((num, idx) => (
            <div key={num} className="space-y-2">
              <label className="block text-xs font-medium text-zinc-500">Opcional {num}</label>
              <div className="relative h-32 w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition-colors">
                {previewImagesOpt[idx] ? (
                  <Image src={previewImagesOpt[idx]!} alt={`Opcional ${num}`} fill unoptimized className="object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-xs text-zinc-400">Extra {num}</div>
                )}
                <input type="file" name={`image_opt_${num}`} accept="image/*" onChange={(e) => handleOptImageChange(e, idx)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4 border-t pt-6">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancelar</Button>
        <Button type="submit" disabled={isPending}>{isPending ? 'Guardando...' : initialData ? 'Actualizar Producto' : 'Crear Producto'}</Button>
      </div>
    </form>
  );
}
