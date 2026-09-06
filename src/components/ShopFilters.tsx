'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { SlidersHorizontal, ChevronUp, ChevronDown, Check } from 'lucide-react';

export function ShopFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '5000');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '50000');
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    searchParams.getAll('size') || []
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(
    searchParams.getAll('color') || []
  );

  // Estado para abrir/cerrar filtros en mobile
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('min_price', minPrice);
    params.set('max_price', maxPrice);
    
    params.delete('size');
    selectedSizes.forEach(s => params.append('size', s));

    params.delete('color');
    selectedColors.forEach(c => params.append('color', c));

    router.push(`/shop?${params.toString()}`);
    // Cerrar en mobile después de aplicar
    setIsMobileOpen(false);
  };

  const sizes = [
    'XXS', 'XS', 'S', 'M', 'S/M',
    'L', 'XL', 'L/XL', 'XXL', '3XL', '4XL'
  ];

  const colors = [
    { name: 'Negro', hex: '#000000', border: true },
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

  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const toggleColor = (colorName: string) => {
    if (selectedColors.includes(colorName)) {
      setSelectedColors(selectedColors.filter(c => c !== colorName));
    } else {
      setSelectedColors([...selectedColors, colorName]);
    }
  };

  useEffect(() => {
    setMinPrice(searchParams.get('min_price') || '5000');
    setMaxPrice(searchParams.get('max_price') || '50000');
    setSelectedSizes(searchParams.getAll('size') || []);
    setSelectedColors(searchParams.getAll('color') || []);
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
            <ChevronUp className="w-5 h-5 text-zinc-400" />
          </div>
          
          <div className="px-1">
            {/* BARRA DEL FILTRO DE PRECIO: FONDO BLANCO PURO */}
            <div 
              className="price-track-white relative h-2 w-full rounded-full mb-6 mt-4 shadow-sm"
              style={{ backgroundColor: '#ffffff', border: '1px solid #ffffff' }}
            >
              <div 
                className="absolute h-full bg-zinc-900 rounded-full" 
                style={{ 
                  left: `${(Number(minPrice) / 100000) * 100}%`, 
                  right: `${100 - (Number(maxPrice) / 100000) * 100}%` 
                }}
              ></div>
              <input
                type="range"
                min="0"
                max="100000"
                step="1000"
                value={minPrice}
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), Number(maxPrice));
                  setMinPrice(val.toString());
                }}
                className="absolute w-full -top-[5px] appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-zinc-900 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-zinc-900 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer"
              />
              <input
                type="range"
                min="0"
                max="100000"
                step="1000"
                value={maxPrice}
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), Number(minPrice));
                  setMaxPrice(val.toString());
                }}
                className="absolute w-full -top-[5px] appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-zinc-900 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-zinc-900 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer"
              />
            </div>
            <div className="flex justify-between items-center text-sm font-medium">
              <div className="flex flex-col items-center">
                <span className="text-xs text-zinc-400 font-semibold mb-1">Mín ($)</span>
                <input 
                  type="number" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-24 text-center bg-zinc-100 border border-zinc-300 focus:border-zinc-500 rounded-xl py-1.5 font-bold text-sm focus:outline-none transition"
                />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-zinc-400 font-semibold mb-1">Máx ($)</span>
                <input 
                  type="number" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-24 text-center bg-zinc-100 border border-zinc-300 focus:border-zinc-500 rounded-xl py-1.5 font-bold text-sm focus:outline-none transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SIZE FILTER */}
        {searchParams.get('type') !== 'SUPPLEMENT' && (
          <div className="pb-5 border-b border-zinc-100">
            <div className="flex justify-between items-center mb-4 cursor-pointer">
              <h3 className="font-bold text-lg text-zinc-900">Talles</h3>
              <ChevronUp className="w-5 h-5 text-zinc-400" />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => {
                const isSelected = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-zinc-950 border-2 border-white shadow-md scale-105'
                        : 'bg-zinc-100 text-zinc-700 border border-zinc-300 hover:border-zinc-400'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* COLOR FILTER */}
        {searchParams.get('type') !== 'SUPPLEMENT' && (
          <div>
            <div className="flex justify-between items-center mb-4 cursor-pointer">
              <h3 className="font-bold text-lg text-zinc-900">Colores</h3>
              <ChevronUp className="w-5 h-5 text-zinc-400" />
            </div>
            
            <div className="grid grid-cols-7 gap-2.5">
              {colors.map((c) => {
                const isSelected = selectedColors.includes(c.name);
                const isLight = c.hex.toLowerCase() === '#ffffff' || c.hex.toLowerCase() === '#f5f5dc';
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => toggleColor(c.name)}
                    title={c.name}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer relative ${
                      isSelected 
                        ? 'ring-2 ring-offset-2 ring-white scale-110 shadow-md' 
                        : 'hover:scale-105 opacity-90 hover:opacity-100'
                    }`}
                    style={{ 
                      backgroundColor: c.hex,
                      border: c.border ? '1px solid #71717a' : 'none'
                    }}
                  >
                    {isSelected && (
                      <Check 
                        className={`w-4 h-4 stroke-[3] ${isLight ? 'text-black' : 'text-white'}`} 
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {selectedColors.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {selectedColors.map(colorName => (
                  <span 
                    key={colorName}
                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-200 border border-zinc-700"
                  >
                    {colorName}
                    <button 
                      type="button" 
                      onClick={() => toggleColor(colorName)}
                      className="hover:text-red-400 cursor-pointer ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <button 
          onClick={applyFilters}
          className="mt-2 w-full bg-white hover:bg-zinc-200 text-zinc-950 py-3.5 rounded-full font-black text-sm tracking-wide transition-all shadow-lg active:scale-98 cursor-pointer"
        >
          Aplicar Filtros
        </button>
      </div>
    </div>
  );
}
