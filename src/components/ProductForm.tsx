'use client';

import { useActionState, useState, useEffect } from 'react';
import { createProduct, updateProduct } from '@/actions/products';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Product } from '@/types/product';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { showToast } from 'nextjs-toast-notify';

interface ProductFormProps {
  action: (state: any, formData: FormData) => Promise<any>;
  initialData?: Product;
}

export function ProductForm({ action, initialData }: ProductFormProps) {
  // 2. useActionState (Nuevo hook de React 19 / Next 15)
  // Maneja de forma nativa los estados de carga y error de un Server Action.
  const [state, formAction, isPending] = useActionState(action, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      if (initialData) {
        showToast.success('Producto actualizado correctamente', { position: 'top-center' });
      } else {
        showToast.success('Producto creado correctamente', { position: 'top-center' });
      }
      router.push('/admin/productos');
    } else if (state?.error) {
      showToast.error(`Error: ${state.error}`, { position: 'top-center' });
    }
  }, [state, initialData, router]);

  // 3. Estado local para poder mostrar en pantalla la imagen que el usuario selecciona
  // antes de enviar el formulario a Supabase.
  const [previewImage, setPreviewImage] = useState<string | null>(initialData?.image ?? null);

  // 4. Se ejecuta cada vez que el usuario selecciona un archivo en el input de tipo 'file'
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Creamos una URL temporal (blob) en la memoria del navegador para poder previsualizarla
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
    }
  };

  return (
    // 5. Vinculamos nuestro formulario al action state proporcionado por useActionState
    <form action={formAction} className="space-y-6">

      {/* Si el Server Action devuelve un error (ej. faltan campos), lo mostramos en rojo */}
      {state?.error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
          {state.error}
        </div>
      )}

      {/* Grid para organizar los campos de texto */}
      <div className="grid gap-6 md:grid-cols-2">
        <Input
          label="Título del producto"
          name="title"
          required
          defaultValue={initialData?.title} // Si estamos editando, pre-llenamos el campo
          placeholder="Ej: Zapatillas Nike Air"
        />

        <Input
          label="Categoría"
          name="category"
          required
          defaultValue={initialData?.category ?? undefined}
          placeholder="Ej: Calzado"
        />

        <Input
          label="Precio ($)"
          name="price"
          type="number"
          step="0.01" // Permite usar decimales
          required
          defaultValue={initialData?.price}
          placeholder="0.00"
        />

        <Input
          label="Stock disponible"
          name="stock"
          type="number"
          required
          defaultValue={initialData?.stock}
          placeholder="Ej: 100"
        />
      </div>

      {/* Área de texto para la descripción (como <textarea> no es un Input nativo lo armamos a mano) */}
      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-zinc-900">
          Descripción detallada
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          required
          defaultValue={initialData?.description ?? undefined}
          className="block w-full rounded-xl border-zinc-300 shadow-sm focus:border-zinc-900 focus:ring-zinc-900 sm:text-sm p-3 border"
          placeholder="Describe las características principales del producto..."
        />
      </div>

      {/* Selector de imagen del producto */}
      <div className="space-y-2">
        <label htmlFor="image" className="block text-sm font-medium text-zinc-900">
          Imagen del producto {initialData ? '(Opcional)' : '(Obligatorio)'}
        </label>

        {/* Contenedor flexible para mostrar botón + previsualización lado a lado */}
        <div className="flex items-center gap-6">
          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl border border-dashed border-zinc-300 bg-zinc-50">
            {previewImage ? (
              // Si ya seleccionó una imagen (o está editando), se muestra
              <Image
                src={previewImage}
                alt="Vista previa"
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              // Si no, mostramos un texto que dice 'Sin imagen'
              <div className="flex h-full w-full flex-col items-center justify-center text-xs text-zinc-400">
                <span>Sin imagen</span>
              </div>
            )}
          </div>

          {/* El input tipo 'file' oculto pero clickeable (estilizado nativamente) */}
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*" // Solo aceptar archivos de imagen
            onChange={handleImageChange}
            required={!initialData} // Solo es obligatorio al momento de "Crear" un nuevo producto
            className="block w-full text-sm text-zinc-500
              file:mr-4 file:rounded-full file:border-0
              file:bg-zinc-100 file:px-4
              file:py-2 file:text-sm
              file:font-semibold file:text-zinc-900
              hover:file:bg-zinc-200 focus:outline-none"
          />
        </div>
      </div>

      {/* 6. Botones finales de Cancelar y Guardar */}
      <div className="flex items-center justify-end gap-4 border-t border-zinc-200 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()} // Botón genérico para ir atrás en el historial del navegador
        >
          Cancelar
        </Button>
        {/* isPending bloqueará el botón si el Server Action está trabajando para evitar clicks dobles */}
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando cambios...' : initialData ? 'Actualizar Producto' : 'Crear Producto'}
        </Button>
      </div>
    </form>
  );
}
