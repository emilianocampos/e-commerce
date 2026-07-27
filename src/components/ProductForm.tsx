'use client';

import { useActionState, useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Product, Brand, Category, Subcategory } from '@/types/product';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { showToast } from 'nextjs-toast-notify';

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
  // For editing we would ideally populate these from product_images, but for creation it's blank
  const [previewImagesOpt, setPreviewImagesOpt] = useState<(string | null)[]>([null, null, null]);

  const [selectedSizes, setSelectedSizes] = useState<string[]>(initialData?.sizes || []);
  
  // Category logic (Ropa vs Suplementos)
  const [productType, setProductType] = useState<string>(initialData?.type || 'CLOTHES');

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

  return (
    <form action={formAction} className="space-y-6">
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
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-bold text-zinc-900">Subcategoría</label>
            <select name="gender" defaultValue={initialData?.gender || 'UNISEX'} className="w-full rounded-md border border-zinc-300 p-2 text-zinc-900 bg-white">
              <option value="MEN">Hombre</option>
              <option value="WOMEN">Mujer</option>
              <option value="UNISEX">Urbano (Unisex)</option>
            </select>
            {/* Usamos el campo gender para esto, o podríamos usar category_id de la DB. Según el plan usaremos gender. */}
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
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-zinc-900">Talles disponibles</label>
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
