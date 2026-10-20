'use client';

import { useActionState, useState, useEffect, startTransition } from 'react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Product, Brand, Category, Subcategory, ComboItem } from '@/types/product';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { showToast } from 'nextjs-toast-notify';
import { compressImage } from '@/lib/imageCompression';
import { formatCurrency } from '@/lib/utils';
import { Crown, Trash2, X, Plus, Package, Layers, Sparkles, AlertCircle, CheckCircle2, Search, Minus } from 'lucide-react';

interface ProductFormProps {
  action: (state: any, formData: FormData) => Promise<any>;
  initialData?: Product;
  brands: Brand[];
  categories: Category[];
  subcategories: Subcategory[];
  availableProducts?: { id: string; title: string; price: number; image?: string; type: string }[];
}

export function ProductForm({ action, initialData, brands, categories, subcategories, availableProducts = [] }: ProductFormProps) {
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
  
  // Category logic (Ropa vs Suplementos vs Combos)
  const [productType, setProductType] = useState<string>(initialData?.type || 'CLOTHES');
  const [productGender, setProductGender] = useState<string>(initialData?.gender || 'UNISEX');

  // Combo Builder State
  const [comboItems, setComboItems] = useState<ComboItem[]>(() => {
    if (initialData?.combo_items && Array.isArray(initialData.combo_items)) {
      return initialData.combo_items;
    }
    return [];
  });

  // Adding DB product to combo
  const [selectedDbId, setSelectedDbId] = useState<string>('');
  const [dbSearchQuery, setDbSearchQuery] = useState<string>('');
  const [dbQuantity, setDbQuantity] = useState<number>(1);

  // Adding Custom product to combo (not in DB)
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customQuantity, setCustomQuantity] = useState<number>(1);
  const [customPrice, setCustomPrice] = useState<string>('');

  // Mode tab for adding combo items: 'db' | 'custom'
  const [comboAddTab, setComboAddTab] = useState<'db' | 'custom'>('db');

  const filteredAvailableProducts = availableProducts.filter((p) => {
    if (initialData && p.id === initialData.id) return false;
    if (!dbSearchQuery.trim()) return true;
    return p.title.toLowerCase().includes(dbSearchQuery.toLowerCase());
  });

  const handleAddDbProduct = () => {
    if (!selectedDbId) {
      showToast.error('Selecciona un producto del catálogo', { position: 'top-center' });
      return;
    }
    const found = availableProducts.find((p) => p.id === selectedDbId);
    if (!found) return;

    const existingIdx = comboItems.findIndex((item) => item.id === found.id);
    if (existingIdx !== -1) {
      const updated = [...comboItems];
      updated[existingIdx].quantity += dbQuantity;
      setComboItems(updated);
      showToast.success(`Se aumentó la cantidad de "${found.title}"`, { position: 'top-center' });
    } else {
      setComboItems([
        ...comboItems,
        {
          id: found.id,
          title: found.title,
          price: found.price,
          image: found.image || undefined,
          quantity: Math.max(1, dbQuantity),
          custom: false,
        },
      ]);
      showToast.success(`"${found.title}" agregado al combo`, { position: 'top-center' });
    }

    setSelectedDbId('');
    setDbQuantity(1);
    setDbSearchQuery('');
  };

  const handleAddCustomProduct = () => {
    const trimmed = customTitle.trim();
    if (!trimmed) {
      showToast.error('Ingresa el nombre del producto o accesorio', { position: 'top-center' });
      return;
    }

    const priceNum = customPrice ? parseFloat(customPrice) : undefined;

    setComboItems([
      ...comboItems,
      {
        title: trimmed,
        quantity: Math.max(1, customQuantity),
        price: priceNum && !isNaN(priceNum) ? priceNum : undefined,
        custom: true,
      },
    ]);
    showToast.success(`"${trimmed}" agregado al combo`, { position: 'top-center' });

    setCustomTitle('');
    setCustomQuantity(1);
    setCustomPrice('');
  };

  const handleUpdateComboItemQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveComboItem(index);
      return;
    }
    const updated = [...comboItems];
    updated[index].quantity = newQty;
    setComboItems(updated);
  };

  const handleRemoveComboItem = (index: number) => {
    const updated = comboItems.filter((_, i) => i !== index);
    setComboItems(updated);
  };

  const totalComboReferencePrice = comboItems.reduce((acc, item) => {
    if (item.price && !isNaN(item.price)) {
      return acc + item.price * item.quantity;
    }
    return acc;
  }, 0);

  const PRESET_FLAVORS = [
    'Neutro/sin sabor',
    'Chocolate',
    'Vainilla Cream',
    'Vainilla',
    'Banana',
    'Frutilla',
    'Cookies And Cream',
    'Frutos rojos',
    'Limón',
    'Manzana',
    'Naranja',
    'Ananá / Piña',
    'Dulce de Leche',
    'Café / Capuchino',
  ];

  const initialFlavor = initialData?.supplement_information?.flavor || '';
  const [flavor, setFlavor] = useState<string>(initialFlavor);
  const [customFlavorMode, setCustomFlavorMode] = useState<boolean>(() => {
    if (!initialFlavor) return false;
    return !PRESET_FLAVORS.includes(initialFlavor);
  });

  // Stock, Entrada y Salida (Aumenta con entrada, disminuye con salida)
  const initialStockNum = initialData?.stock !== undefined && initialData?.stock !== null ? Number(initialData.stock) : 0;
  const initialEntradaNum = initialData?.supplement_information?.entrada !== null && initialData?.supplement_information?.entrada !== undefined
    ? Number(initialData.supplement_information.entrada)
    : null;
  const initialSalidaNum = initialData?.supplement_information?.salida !== null && initialData?.supplement_information?.salida !== undefined
    ? Number(initialData.supplement_information.salida)
    : null;

  // initialStock = baseStock + initialEntrada - initialSalida
  // baseStock = initialStock - (initialEntrada || 0) + (initialSalida || 0)
  const [baseStock, setBaseStock] = useState<number>(() => {
    const e = initialEntradaNum ?? 0;
    const s = initialSalidaNum ?? 0;
    return initialStockNum - e + s;
  });

  const [entrada, setEntrada] = useState<string>(
    initialEntradaNum !== null ? String(initialEntradaNum) : ''
  );
  const [salida, setSalida] = useState<string>(
    initialSalidaNum !== null ? String(initialSalidaNum) : ''
  );
  const [stock, setStock] = useState<string | number>(
    initialData?.stock !== undefined && initialData?.stock !== null ? initialData.stock : ''
  );

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStock(val);
    if (val === '') {
      setBaseStock(0);
    } else {
      const num = parseInt(val, 10);
      if (!isNaN(num)) {
        const eNum = entrada === '' ? 0 : Math.max(0, parseInt(entrada, 10) || 0);
        const sNum = salida === '' ? 0 : Math.max(0, parseInt(salida, 10) || 0);
        setBaseStock(num - eNum + sNum);
      }
    }
  };

  const handleEntradaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEntrada(val);
    const eNum = val === '' ? 0 : Math.max(0, parseInt(val, 10) || 0);
    const sNum = salida === '' ? 0 : Math.max(0, parseInt(salida, 10) || 0);
    const computedStock = Math.max(0, baseStock + eNum - sNum);
    if (val === '' && salida === '' && baseStock === 0 && !initialData) {
      setStock('');
    } else {
      setStock(computedStock);
    }
  };

  const handleSalidaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSalida(val);
    const eNum = entrada === '' ? 0 : Math.max(0, parseInt(entrada, 10) || 0);
    const sNum = val === '' ? 0 : Math.max(0, parseInt(val, 10) || 0);
    const computedStock = Math.max(0, baseStock + eNum - sNum);
    if (val === '' && entrada === '' && baseStock === 0 && !initialData) {
      setStock('');
    } else {
      setStock(computedStock);
    }
  };

  // VIP Benefit logic
  const getInitialVipType = () => {
    if (initialData?.vip_discount_percentage === undefined || initialData?.vip_discount_percentage === null) return 'default';
    if (initialData.vip_discount_percentage === 15) return '15';
    if (initialData.vip_discount_percentage === 10) return '10';
    if (initialData.vip_discount_percentage === 5) return '5';
    if (initialData.vip_discount_percentage === 0) return '0';
    return 'custom';
  };

  const [vipDiscountType, setVipDiscountType] = useState<string>(getInitialVipType());
  const [customVipPercentage, setCustomVipPercentage] = useState<string>(
    initialData?.vip_discount_percentage !== undefined && initialData?.vip_discount_percentage !== null && ![0, 5, 10, 15].includes(initialData.vip_discount_percentage)
      ? String(initialData.vip_discount_percentage)
      : ''
  );
  const [vipStackable, setVipStackable] = useState<boolean>(initialData?.vip_stackable !== false);

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreviewImage(URL.createObjectURL(file));
  };

  const [deletedOptImages, setDeletedOptImages] = useState<boolean[]>([false, false, false]);

  const handleOptImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const newPreviews = [...previewImagesOpt];
      newPreviews[index] = URL.createObjectURL(file);
      setPreviewImagesOpt(newPreviews);
      
      const newDeleted = [...deletedOptImages];
      newDeleted[index] = false;
      setDeletedOptImages(newDeleted);
    }
  };

  const handleRemoveOptImage = (index: number) => {
    const newPreviews = [...previewImagesOpt];
    newPreviews[index] = null;
    setPreviewImagesOpt(newPreviews);

    const newDeleted = [...deletedOptImages];
    newDeleted[index] = true;
    setDeletedOptImages(newDeleted);

    // Reset file input element if it has a file selected
    const inputElem = document.getElementById(`image_opt_${index + 1}`) as HTMLInputElement | null;
    if (inputElem) {
      inputElem.value = '';
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

    if (productType === 'COMBO') {
      if (comboItems.length < 2) {
        showToast.error('Un combo debe incluir al menos 2 productos (en base de datos o personalizados)', { position: 'top-center' });
        return;
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
          className="w-full rounded-xl border border-zinc-300 p-2.5 text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="CLOTHES">Ropa</option>
          <option value="SUPPLEMENT">Suplementos</option>
          <option value="COMBO">Combos</option>
        </select>
      </div>

      {/* CONFIGURADOR DE COMBOS (2 o más productos) */}
      {productType === 'COMBO' && (
        <div className="rounded-2xl border-2 border-amber-400/40 bg-gradient-to-br from-amber-500/5 via-amber-500/10 to-orange-500/5 p-5 md:p-6 shadow-sm space-y-6">
          <input type="hidden" name="combo_items" value={JSON.stringify(comboItems)} />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-500 text-black rounded-lg">
                  <Package className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-black text-zinc-900 tracking-tight">
                  Configurador de Combo (Pack de 2 o más productos)
                </h3>
              </div>
              <p className="text-xs text-zinc-600 mt-1">
                Une 2 o más artículos en este combo. Puedes elegir productos de tu base de datos y/o agregar artículos personalizados (shakers, toallas, accesorios, etc.).
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {comboItems.length >= 2 ? (
                <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {comboItems.length} productos en el combo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-300">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  {comboItems.length} de 2 requeridos
                </span>
              )}
            </div>
          </div>

          {/* Selector de modo para agregar productos */}
          <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm space-y-4">
            <div className="flex gap-2 border-b border-zinc-100 pb-2">
              <button
                type="button"
                onClick={() => setComboAddTab('db')}
                className={`flex items-center gap-2 pb-2 px-3 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
                  comboAddTab === 'db'
                    ? 'border-zinc-900 text-zinc-900'
                    : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Desde la Base de Datos ({availableProducts.length})
              </button>
              <button
                type="button"
                onClick={() => setComboAddTab('custom')}
                className={`flex items-center gap-2 pb-2 px-3 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
                  comboAddTab === 'custom'
                    ? 'border-amber-600 text-amber-700'
                    : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Producto Personalizado (Fuera de la BD)
              </button>
            </div>

            {/* TAB: Desde la BD */}
            {comboAddTab === 'db' && (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-12 items-end">
                  <div className="sm:col-span-8 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-700">Seleccionar Producto del Catálogo</label>
                      <span className="text-[11px] text-zinc-400">Filtrar por nombre:</span>
                    </div>
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={dbSearchQuery}
                          onChange={(e) => setDbSearchQuery(e.target.value)}
                          placeholder="Buscar producto existente..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        />
                      </div>
                      <select
                        value={selectedDbId}
                        onChange={(e) => setSelectedDbId(e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 p-2.5 text-xs font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-zinc-50"
                      >
                        <option value="">-- Elige un producto de la base de datos --</option>
                        {filteredAvailableProducts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title} - {formatCurrency(p.price)} ({p.type})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">Cantidad</label>
                    <input
                      type="number"
                      min="1"
                      value={dbQuantity}
                      onChange={(e) => setDbQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full rounded-xl border border-zinc-300 p-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900 text-center"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddDbProduct}
                      className="w-full flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Agregar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Personalizado (Fuera de la BD) */}
            {comboAddTab === 'custom' && (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-12 items-end">
                  <div className="sm:col-span-6 space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">Nombre del artículo o accesorio</label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="Ej: Shaker Mezclador 700ml, Toalla de entrenamiento..."
                      className="w-full rounded-xl border border-zinc-300 p-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">Cantidad</label>
                    <input
                      type="number"
                      min="1"
                      value={customQuantity}
                      onChange={(e) => setCustomQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full rounded-xl border border-zinc-300 p-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 text-center"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">Precio Ref. ($ opcional)</label>
                    <input
                      type="number"
                      min="0"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                      placeholder="0"
                      className="w-full rounded-xl border border-zinc-300 p-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddCustomProduct}
                      className="w-full flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Agregar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* LISTA DE PRODUCTOS INCLUIDOS EN EL COMBO */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-700">
                Productos Seleccionados en este Combo ({comboItems.length})
              </h4>
              {comboItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setComboItems([])}
                  className="text-[11px] text-red-500 hover:text-red-700 font-semibold cursor-pointer underline"
                >
                  Vaciar combo
                </button>
              )}
            </div>

            {comboItems.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-xl border-2 border-dashed border-amber-300/80 bg-white/70 space-y-2">
                <Package className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="text-sm font-bold text-zinc-800">Todavía no agregaste productos al combo</p>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  Utiliza los selectores de arriba para incluir al menos 2 productos (de tu base de datos o personalizados).
                </p>
              </div>
            ) : (
              <div className="grid gap-2.5">
                {comboItems.map((item, idx) => (
                  <div
                    key={`${item.id || 'custom'}-${idx}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white rounded-xl border border-zinc-200 shadow-xs hover:border-zinc-300 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200 flex items-center justify-center">
                        {item.image ? (
                          <Image src={item.image} alt={item.title} fill unoptimized className="object-cover" />
                        ) : (
                          <Package className="w-5 h-5 text-zinc-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-zinc-900">{item.title}</span>
                          {item.custom ? (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                              Personalizado / No en BD
                            </span>
                          ) : (
                            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                              En Base de Datos
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                          {item.price ? (
                            <span>{formatCurrency(item.price)} c/u</span>
                          ) : (
                            <span className="italic text-zinc-400">Sin precio ref.</span>
                          )}
                          {item.price && item.quantity > 1 && (
                            <>
                              <span>•</span>
                              <span className="font-semibold text-zinc-700">
                                Subtotal: {formatCurrency(item.price * item.quantity)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-auto border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto">
                      <div className="flex items-center border border-zinc-200 rounded-lg bg-zinc-50 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleUpdateComboItemQty(idx, item.quantity - 1)}
                          className="px-2.5 py-1 text-xs font-bold text-zinc-600 hover:bg-zinc-200 transition-colors cursor-pointer"
                          title="Restar unidad"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 py-1 text-xs font-black text-zinc-900 bg-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateComboItemQty(idx, item.quantity + 1)}
                          className="px-2.5 py-1 text-xs font-bold text-zinc-600 hover:bg-zinc-200 transition-colors cursor-pointer"
                          title="Sumar unidad"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveComboItem(idx)}
                        className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Quitar del combo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Resumen del Combo */}
            {comboItems.length > 0 && (
              <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <span>💡 Resumen del Combo</span>
                  </div>
                  <div className="text-xs text-zinc-600">
                    Suma del valor individual de los artículos:{' '}
                    <strong className="text-zinc-900 text-sm">
                      {formatCurrency(totalComboReferencePrice)}
                    </strong>
                  </div>
                </div>
                <div>
                  {comboItems.length < 2 ? (
                    <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-300 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4 text-amber-600" /> Agrega al menos 1 producto más
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Requisito cumplido (2+ productos)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        
        {/* SUBCATEGORÍA (Solo Ropa) */}
        {productType === 'CLOTHES' && (
          <div className="space-y-4 md:col-span-2">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-zinc-900">Subcategoría</label>
              <select name="gender" value={productGender} onChange={(e) => setProductGender(e.target.value)} className="w-full rounded-xl border border-zinc-300 p-2.5 text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="MEN">Hombre</option>
                <option value="WOMEN">Mujer</option>
                <option value="UNISEX">Urbano</option>
              </select>
            </div>
            
            {productGender === 'UNISEX' && (
              <div className="space-y-2">
                <label className="block text-sm font-bold text-zinc-900">Género Urbano</label>
                <select name="urbano_category" defaultValue={initialData?.urbano_category || 'UNISEX'} className="w-full rounded-xl border border-zinc-300 p-2.5 text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500">
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
          placeholder={productType === 'CLOTHES' ? 'Ej: Remera sport' : productType === 'COMBO' ? 'Ej: Combo Creatina + Proteína + Shaker' : 'Ej: WHEY PROTEIN VITAL'} 
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
        <div className="space-y-1.5">
          <Input 
            label="Cantidad de stock" 
            name="stock" 
            type="number" 
            min="0"
            required 
            value={stock} 
            onChange={handleStockChange} 
            placeholder="Ej: 100" 
          />
          {productType === 'SUPPLEMENT' && (
            <p className="text-[11px] text-zinc-500">
              ⚡ Se ajusta dinámicamente con <strong>Entrada</strong> (+) y <strong>Salida</strong> (-). También podés editarlo directamente.
            </p>
          )}
        </div>
        <Input label="Precio Oferta ($)" name="sale_price" type="number" step="0.01" defaultValue={initialData?.sale_price || ''} placeholder="0.00 (Opcional)" />
        
        {/* BENEFICIO TARJETA VIP KLONFARK */}
        <div className="md:col-span-2 bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent p-5 rounded-2xl border border-amber-300/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-zinc-900 flex items-center gap-2">
                  Beneficio Tarjeta VIP Klonfark
                  <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300/50">VIP Club</span>
                </h3>
                <p className="text-xs text-zinc-500">Configura el porcentaje para clientes VIP o define si es acumulable con otras promociones.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                Descuento VIP para este Producto
              </label>
              <select
                value={vipDiscountType}
                onChange={(e) => setVipDiscountType(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 p-2.5 text-sm font-semibold cursor-pointer focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="default">✨ Heredar de Tarjeta del Cliente (10% o 15% según tarjeta)</option>
                <option value="15">15% de Descuento VIP</option>
                <option value="10">10% de Descuento VIP</option>
                <option value="5">5% de Descuento VIP (Recomendado para margen bajo / promo previa)</option>
                <option value="0">⛔ Sin beneficio VIP (0%)</option>
                <option value="custom">✏️ Personalizado (% a elección)</option>
              </select>
            </div>

            {vipDiscountType === 'custom' && (
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Porcentaje Personalizado (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={customVipPercentage}
                  onChange={(e) => setCustomVipPercentage(e.target.value)}
                  placeholder="Ej: 7.5"
                  className="w-full rounded-xl border border-zinc-300 p-2.5 text-sm font-medium text-zinc-900 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            )}

            <div className={vipDiscountType === 'custom' ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                Regla de Acumulación con Promociones
              </label>
              <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-zinc-200">
                <input
                  type="checkbox"
                  id="vip_stackable_check"
                  checked={vipStackable}
                  onChange={(e) => setVipStackable(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="vip_stackable_check" className="text-xs text-zinc-800 font-medium cursor-pointer">
                  {vipStackable ? '✅ Acumulable (se suma a las promociones por transferencia y cupones)' : '❌ VIP No acumulable (si ya goza de otra promoción, el beneficio VIP no aplica a este producto)'}
                </label>
              </div>
            </div>
          </div>

          {/* Hidden inputs to send in FormData */}
          <input 
            type="hidden" 
            name="vip_discount_percentage" 
            value={
              vipDiscountType === 'default' ? '' :
              vipDiscountType === 'custom' ? customVipPercentage :
              vipDiscountType
            } 
          />
          <input 
            type="hidden" 
            name="vip_stackable" 
            value={vipStackable ? 'true' : 'false'} 
          />
        </div>
        
        {/* Talles (solo ropa) */}
        {productType === 'CLOTHES' && (
          <div className="space-y-4 md:col-span-2 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
            <label className="block text-sm font-bold text-zinc-900">Talles y Colores disponibles</label>
            <div className="flex flex-wrap gap-2">
              {['XS', 'S', 'M', 'S/M', 'L', 'XL', 'L/XL', 'XXL'].map((size) => {
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
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="supp_entrada" className="block text-sm font-semibold text-zinc-900">
                    Entrada (Stock Ingresado)
                  </label>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                    <span>▲</span> Aumenta Stock (+)
                  </span>
                </div>
                <input
                  id="supp_entrada"
                  name="supp_entrada"
                  type="number"
                  min="0"
                  value={entrada}
                  onChange={handleEntradaChange}
                  placeholder="0"
                  className="flex h-11 w-full rounded-xl border border-zinc-300 px-3.5 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors bg-white text-zinc-900"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="supp_salida" className="block text-sm font-semibold text-zinc-900">
                    Salida (Stock Retirado)
                  </label>
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full border border-rose-300 flex items-center gap-1">
                    <span>▼</span> Disminuye Stock (-)
                  </span>
                </div>
                <input
                  id="supp_salida"
                  name="supp_salida"
                  type="number"
                  min="0"
                  value={salida}
                  onChange={handleSalidaChange}
                  placeholder="0"
                  className="flex h-11 w-full rounded-xl border border-zinc-300 px-3.5 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors bg-white text-zinc-900"
                />
              </div>

              {/* Panel de Balance de Stock en Tiempo Real */}
              <div className="md:col-span-2 bg-white/95 rounded-xl p-3.5 border border-blue-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <span>📦 Balance de Inventario Calculado</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 flex items-center gap-2 flex-wrap">
                    <span>Stock Base: <strong className="text-zinc-800">{baseStock}</strong></span>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold">
                      {entrada !== '' && Number(entrada) > 0 ? `+${entrada}` : '+0'} Entrada
                    </span>
                    <span>•</span>
                    <span className="text-rose-700 font-bold">
                      {salida !== '' && Number(salida) > 0 ? `-${salida}` : '-0'} Salida
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 self-start sm:self-auto">
                  <span className="text-xs font-semibold text-blue-800">Stock Resultante:</span>
                  <span className="text-sm font-black text-blue-950">
                    {stock === '' ? 0 : stock} unidades
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-zinc-900">Sabor</label>
                <button
                  type="button"
                  onClick={() => setCustomFlavorMode(!customFlavorMode)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                >
                  {customFlavorMode ? 'Ver lista de sabores predefinidos' : '✏️ Escribir otro sabor personalizado'}
                </button>
              </div>

              {customFlavorMode ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={flavor}
                    onChange={(e) => setFlavor(e.target.value)}
                    placeholder="Ej: Triple Chocolate, Mango Tropical, etc."
                    className="flex-1 rounded-xl border border-zinc-300 p-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-zinc-900"
                  />
                  <input type="hidden" name="supp_flavor" value={flavor} />
                </div>
              ) : (
                <select
                  name="supp_flavor"
                  value={flavor}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setCustomFlavorMode(true);
                    } else {
                      setFlavor(e.target.value);
                    }
                  }}
                  className="w-full rounded-xl border border-zinc-300 p-2.5 text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-zinc-900"
                >
                  <option value="">Seleccionar Sabor...</option>
                  {initialFlavor && !PRESET_FLAVORS.includes(initialFlavor) && (
                    <option value={initialFlavor}>{initialFlavor} (Guardado)</option>
                  )}
                  {PRESET_FLAVORS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                  <option value="__custom__">✏️ Otro sabor personalizado...</option>
                </select>
              )}
              {flavor && (
                <p className="text-xs text-zinc-500">
                  Sabor registrado: <strong className="text-zinc-800">{flavor}</strong>
                </p>
              )}
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
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-zinc-500">Opcional {num}</label>
                {previewImagesOpt[idx] && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveOptImage(idx);
                    }}
                    className="text-[11px] text-red-500 hover:text-red-700 font-semibold flex items-center gap-0.5 transition-colors z-20 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    Eliminar
                  </button>
                )}
              </div>
              <div className="relative h-32 w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition-colors group">
                {previewImagesOpt[idx] ? (
                  <>
                    <Image src={previewImagesOpt[idx]!} alt={`Opcional ${num}`} fill unoptimized className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                      <span className="text-[11px] text-white font-medium bg-black/60 px-2 py-1 rounded">Cambiar foto</span>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-xs text-zinc-400">
                    <span>+ Extra {num}</span>
                  </div>
                )}
                <input
                  type="file"
                  id={`image_opt_${num}`}
                  name={`image_opt_${num}`}
                  accept="image/*"
                  onChange={(e) => handleOptImageChange(e, idx)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
              </div>
              <input type="hidden" name={`delete_opt_${num}`} value={deletedOptImages[idx] ? 'true' : 'false'} />
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
