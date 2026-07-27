'use client';

import { useState, useEffect } from 'react';
import { ProductForm } from '@/components/ProductForm';
import { ImportExcel } from '@/components/ImportExcel';
import { createProduct } from '@/actions/products';
import { getBrands } from '@/actions/brands';
import { getCategories, getSubcategories } from '@/actions/categories';

export default function CreateProductPage() {
  const [activeTab, setActiveTab] = useState<'manual' | 'excel'>('manual');
  
  // Data for the form
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const b = await getBrands();
      const c = await getCategories();
      const s = await getSubcategories();
      setBrands(b);
      setCategories(c);
      setSubcategories(s);
    }
    loadData();
  }, []);

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-zinc-900">Crear Producto</h1>
      
      <div className="mb-6 flex gap-2 border-b border-zinc-200">
        <button
          onClick={() => setActiveTab('manual')}
          className={`pb-3 px-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'manual' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
        >
          Creación Manual
        </button>
        <button
          onClick={() => setActiveTab('excel')}
          className={`pb-3 px-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'excel' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
        >
          Importar desde Excel
        </button>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        {activeTab === 'manual' ? (
          <ProductForm 
            action={createProduct} 
            brands={brands}
            categories={categories}
            subcategories={subcategories}
          />
        ) : (
          <ImportExcel />
        )}
      </div>
    </div>
  );
}
