'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { DeleteProductButton } from './DeleteProductButton';
import { Search, X, Edit, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface AdminProductsListProps {
  initialProducts: any[];
}

export function AdminProductsList({ initialProducts }: AdminProductsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'stock_asc' | 'title_asc'>('newest');

  const getCategoryLabel = (product: any) => {
    if (product.type === 'SUPPLEMENT') return 'Suplemento';
    if (product.type === 'CLOTHES') {
      if (product.gender === 'MEN') return 'Ropa - Hombre';
      if (product.gender === 'WOMEN') return 'Ropa - Mujer';
      return 'Ropa - Urbano';
    }
    return product.type || 'Sin categoría';
  };

  const filteredProducts = useMemo(() => {
    let list = [...initialProducts];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        const title = (p.title || p.name || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const cat = getCategoryLabel(p).toLowerCase();
        return title.includes(q) || desc.includes(q) || cat.includes(q);
      });
    }

    // Filter by type
    if (selectedType !== 'ALL') {
      if (selectedType === 'SUPPLEMENT') {
        list = list.filter((p) => p.type === 'SUPPLEMENT');
      } else if (selectedType === 'MEN') {
        list = list.filter((p) => p.type === 'CLOTHES' && p.gender === 'MEN');
      } else if (selectedType === 'WOMEN') {
        list = list.filter((p) => p.type === 'CLOTHES' && p.gender === 'WOMEN');
      } else if (selectedType === 'URBANO') {
        list = list.filter((p) => p.type === 'CLOTHES' && p.gender === 'UNISEX');
      }
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'stock_asc') return (a.stock || 0) - (b.stock || 0);
      if (sortBy === 'title_asc') return (a.title || '').localeCompare(b.title || '');
      // newest
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });

    return list;
  }, [initialProducts, searchQuery, selectedType, sortBy]);

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, categoría o descripción..."
            className="w-full pl-10 pr-9 py-2.5 bg-zinc-50 hover:bg-zinc-100/70 focus:bg-white border border-zinc-200 focus:border-zinc-900 rounded-xl text-sm outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category and Sort Selectors */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-zinc-200 bg-zinc-50 rounded-xl px-3 py-2.5 text-xs font-semibold text-zinc-700 outline-none cursor-pointer hover:bg-zinc-100 transition"
          >
            <option value="ALL">Todas las Categorías</option>
            <option value="SUPPLEMENT">Suplementos</option>
            <option value="MEN">Hombre</option>
            <option value="WOMEN">Mujer</option>
            <option value="URBANO">Urbano</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-zinc-200 bg-zinc-50 rounded-xl px-3 py-2.5 text-xs font-semibold text-zinc-700 outline-none cursor-pointer hover:bg-zinc-100 transition"
          >
            <option value="newest">Más Recientes</option>
            <option value="title_asc">Nombre A-Z</option>
            <option value="price_asc">Precio: Menor a Mayor</option>
            <option value="price_desc">Precio: Mayor a Menor</option>
            <option value="stock_asc">Menor Stock</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
        <span>Mostrando <strong>{filteredProducts.length}</strong> de {initialProducts.length} productos</span>
        {(searchQuery || selectedType !== 'ALL') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedType('ALL');
            }}
            className="text-xs text-emerald-600 hover:underline font-semibold"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* VISTA MOBILE: Tarjetas Táctiles */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredProducts.map((product: any) => (
          <div key={product.id} className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm flex flex-col justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                {product.image ? (
                  <Image src={product.image} alt={product.title} fill unoptimized className="object-cover" sizes="64px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400">Sin foto</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-zinc-900 text-sm truncate">{product.title}</h3>
                
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
                    {getCategoryLabel(product)}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    product.stock > 10 ? 'bg-emerald-100 text-emerald-800' : 
                    product.stock > 0 ? 'bg-amber-100 text-amber-800' : 
                    'bg-rose-100 text-rose-800'
                  }`}>
                    Stock: {product.stock}
                  </span>
                </div>

                <div className="text-base font-extrabold text-zinc-900 mt-2">
                  {formatCurrency(product.price)}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
              <Link
                href={`/admin/editar/${product.id}`}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                Editar
              </Link>
              <DeleteProductButton id={product.id} title={product.title} />
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="bg-white rounded-2xl p-8 border border-zinc-200 text-center text-sm text-zinc-500">
            No se encontraron productos con los criterios de búsqueda.
          </div>
        )}
      </div>

      {/* VISTA DESKTOP: Tabla Tradicional */}
      <div className="hidden md:block rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Stock</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">Acciones</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-zinc-200 bg-white">
              {filteredProducts.map((product: any) => (
                <tr key={product.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                        {product.image && (
                          <Image src={product.image} alt={product.title} fill unoptimized className="object-cover" sizes="44px" />
                        )}
                      </div>
                      <div className="font-medium text-zinc-900">{product.title}</div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-zinc-700">
                    <span className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                      {getCategoryLabel(product)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-bold text-zinc-900">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      product.stock > 10 ? 'bg-emerald-100 text-emerald-800' : 
                      product.stock > 0 ? 'bg-amber-100 text-amber-800' : 
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {product.stock} unid.
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/editar/${product.id}`} className="text-blue-600 hover:text-blue-900 font-semibold text-xs">
                        Editar
                      </Link>
                      <DeleteProductButton id={product.id} title={product.title} />
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    No se encontraron productos con los criterios de búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
