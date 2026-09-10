'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const validImages = images && images.length > 0 ? images : [];
  const currentImage = validImages[currentIndex] || null;

  const handleNext = () => {
    if (validImages.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  const handlePrev = () => {
    if (validImages.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 40;
    const isRightSwipe = distance < -40;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="w-full lg:w-1/2 flex flex-col-reverse lg:flex-row gap-4 select-none">
      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible no-scrollbar pb-2 lg:pb-0 shrink-0">
          {validImages.map((img, i) => (
            <button
              key={i} 
              type="button"
              onClick={() => setCurrentIndex(i)}
              style={currentIndex === i ? {
                borderColor: 'var(--card-glow-color, #10b981)',
                boxShadow: '0 0 12px rgba(var(--card-glow-rgb, 16, 185, 129), 0.35)',
              } : undefined}
              className={`w-[75px] h-[75px] lg:w-[120px] lg:h-[120px] rounded-2xl bg-white relative overflow-hidden shrink-0 border-2 cursor-pointer transition-all ${
                currentIndex === i ? 'scale-105' : 'border-zinc-200 hover:border-zinc-400 opacity-70 hover:opacity-100'
              }`}
            >
              <Image src={img} alt={`${title} - miniatura ${i + 1}`} fill unoptimized className="object-contain p-2" />
            </button>
          ))}
        </div>
      )}

      {/* Main Image with Swipe & Navigation */}
      <div 
        className="flex-1 bg-white rounded-3xl relative aspect-square lg:aspect-auto lg:h-[520px] overflow-hidden shadow-sm border border-zinc-200/40 flex items-center justify-center touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {currentImage ? (
          <Image 
            key={currentImage}
            src={currentImage} 
            alt={`${title} - imagen ${currentIndex + 1}`} 
            fill 
            unoptimized 
            className="object-contain p-4 lg:p-6 transition-all duration-300 animate-in fade-in" 
            priority 
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-400 font-medium">Sin imagen</div>
        )}

        {/* Navigation Arrows for Multiple Images */}
        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Foto anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 md:w-11 md:h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-xs transition-all shadow-md active:scale-95 cursor-pointer z-10"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Foto siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 md:w-11 md:h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-xs transition-all shadow-md active:scale-95 cursor-pointer z-10"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Pagination Badge & Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-xs z-10">
              {validImages.map((_, dotIdx) => (
                <span
                  key={dotIdx}
                  className={`inline-block rounded-full transition-all ${
                    currentIndex === dotIdx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'
                  }`}
                />
              ))}
              <span className="text-[11px] font-bold text-white ml-1">
                {currentIndex + 1}/{validImages.length}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

