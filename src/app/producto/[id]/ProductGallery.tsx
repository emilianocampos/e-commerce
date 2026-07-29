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
        <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible no-scrollbar pb-2 lg:pb-0 shrink-0">
          {images.map((img, i) => (
            <div 
              key={i} 
              onClick={() => setMainImage(img)}
              className={`w-[110px] h-[110px] lg:w-[150px] lg:h-[150px] rounded-[20px] bg-[#F0EEED] relative overflow-hidden shrink-0 border-2 cursor-pointer transition-colors ${mainImage === img ? 'border-zinc-900' : 'border-transparent hover:border-zinc-400'}`}
            >
              <Image src={img} alt={`${title} - vista ${i + 1}`} fill unoptimized className="object-contain p-2" />
            </div>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="flex-1 bg-[#F0EEED] rounded-[20px] relative aspect-square lg:aspect-auto lg:h-[480px] overflow-hidden">
        {mainImage ? (
          <Image src={mainImage} alt={title} fill unoptimized className="object-contain p-4" priority />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-400 font-medium">Sin imagen</div>
        )}
      </div>
    </div>
  );
}
