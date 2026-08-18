'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export function ShopSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQ = searchParams.get('q') || '';
  
  const [searchTerm, setSearchTerm] = useState(currentQ);

  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (searchTerm.trim()) {
      params.set('q', searchTerm.trim());
    } else {
      params.delete('q');
    }

    router.push(`/shop?${params.toString()}`);
  };

  const handleClear = () => {
    setSearchTerm('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="w-full mb-6">
      <form onSubmit={handleSearch} className="relative flex items-center w-full gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar productos por nombre, marca o modelo..."
            className="w-full pl-11 pr-10 py-3 bg-zinc-50 hover:bg-zinc-100/80 focus:bg-white border border-zinc-200 focus:border-zinc-900 rounded-2xl text-sm md:text-base text-zinc-900 placeholder:text-zinc-400 outline-none transition-all shadow-sm"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-200 transition"
              title="Borrar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="bg-black hover:bg-zinc-800 text-white font-semibold text-sm px-5 py-3 rounded-2xl transition-all shadow-sm shrink-0 flex items-center gap-2"
        >
          <Search className="w-4 h-4 hidden sm:inline" />
          Buscar
        </button>
      </form>

      {/* Active Search Badge */}
      {currentQ && (
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs font-semibold text-zinc-500">Filtrado por:</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 text-white text-xs font-bold rounded-full">
            "{currentQ}"
            <button
              type="button"
              onClick={handleClear}
              className="hover:text-red-300 ml-0.5"
              title="Quitar búsqueda"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        </div>
      )}
    </div>
  );
}
