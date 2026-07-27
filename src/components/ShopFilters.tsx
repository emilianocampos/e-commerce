'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { SlidersHorizontal, ChevronUp, ChevronDown } from 'lucide-react';

export function ShopFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '5000');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '50000');
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    searchParams.getAll('size') || []
  );

  // Estado para abrir/cerrar filtros en mobile
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('min_price', minPrice);
    params.set('max_price', maxPrice);
    
    params.delete('size');
    selectedSizes.forEach(s => params.append('size', s));

    router.push(`/shop?${params.toString()}`);
    // Cerrar en mobile después de aplicar
    setIsMobileOpen(false);
  };

  const sizes = [
    'XXS', 'XS', 'S', 'M', 
    'L', 'XL', 'XXL', '3XL', '4XL'
  ];

  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  useEffect(() => {
    setMinPrice(searchParams.get('min_price') || '5000');
    setMaxPrice(searchParams.get('max_price') || '50000');
    setSelectedSizes(searchParams.getAll('size') || []);
  }, [searchParams]);

  return (
    <div className="w-full bg-white px-6 py-5 rounded-[20px] border border-zinc-200 shadow-sm flex flex-col gap-6">
      <div 
        className="flex justify-between items-center pb-5 border-b border-zinc-100 cursor-pointer md:cursor-auto"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <h2 className="text-xl font-bold text-zinc-900">Filtros</h2>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-zinc-400" />
          <span className="md:hidden">
            {isMobileOpen ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
          </span>
        </div>
      </div>

      <div className={`flex flex-col gap-6 ${isMobileOpen ? 'block' : 'hidden'} md:flex`}>
        {/* PRICE FILTER */}
        <div className="pb-5 border-b border-zinc-100">
          <div className="flex justify-between items-center mb-4 cursor-pointer">
            <h3 className="font-bold text-lg text-zinc-900">Precio</h3>
            <ChevronUp className="w-5 h-5 text-zinc-900" />
          </div>
          
          <div className="px-2">
            <div className="relative h-1.5 w-full bg-zinc-200 rounded-full mb-6">
              <div className="absolute h-full bg-zinc-900 rounded-full left-[25%] right-[25%]"></div>
              <div className="absolute w-4 h-4 bg-zinc-900 rounded-full top-1/2 -translate-y-1/2 left-[25%] -translate-x-1/2"></div>
              <div className="absolute w-4 h-4 bg-zinc-900 rounded-full top-1/2 -translate-y-1/2 right-[25%] translate-x-1/2"></div>
            </div>
            <div className="flex justify-between items-center text-sm font-medium text-zinc-900">
              <div className="flex flex-col items-center">
                <span>Mín ($)</span>
                <input 
                  type="number" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-20 text-center border rounded py-1 mt-1 font-bold text-sm"
                />
              </div>
              <div className="flex flex-col items-center">
                <span>Máx ($)</span>
                <input 
                  type="number" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-20 text-center border rounded py-1 mt-1 font-bold text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SIZE FILTER */}
        {searchParams.get('type') !== 'SUPPLEMENT' && (
          <div>
            <div className="flex justify-between items-center mb-4 cursor-pointer">
              <h3 className="font-bold text-lg text-zinc-900">Talles</h3>
              <ChevronUp className="w-5 h-5 text-zinc-900" />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                    selectedSizes.includes(size)
                      ? 'bg-zinc-900 text-white'
                      : 'bg-[#F0F0F0] text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        <button 
          onClick={applyFilters}
          className="mt-4 w-full bg-black text-white py-4 rounded-full font-bold hover:bg-zinc-800 transition"
        >
          Aplicar Filtros
        </button>
      </div>
    </div>
  );
}
