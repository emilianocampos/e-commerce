'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [mainImage, setMainImage] = useState(images[0] || null);

  return (
    <div className="w-full lg:w-1/2 flex flex-col-reverse lg:flex-row gap-4">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible no-scrollbar pb-2 lg:pb-0 shrink-0">
          {images.map((img, i) => (
            <div 
              key={i} 
              onClick={() => setMainImage(img)}
              className={`w-[90px] h-[90px] lg:w-[130px] lg:h-[130px] rounded-2xl bg-white relative overflow-hidden shrink-0 border-2 cursor-pointer transition-all ${
                mainImage === img ? 'border-emerald-400 shadow-md scale-105' : 'border-zinc-800 hover:border-zinc-500'
              }`}
            >
              <Image src={img} alt={`${title} - vista ${i + 1}`} fill unoptimized className="object-contain p-2" />
            </div>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="flex-1 bg-white rounded-3xl relative aspect-square lg:aspect-auto lg:h-[520px] overflow-hidden shadow-sm border border-zinc-200/40 flex items-center justify-center">
        {mainImage ? (
          <Image src={mainImage} alt={title} fill unoptimized className="object-contain p-6" priority />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-400 font-medium">Sin imagen</div>
        )}
      </div>
    </div>
  );
}
