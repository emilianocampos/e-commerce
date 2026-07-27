'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { formatCurrency } from '@/lib/utils';
import { Star } from 'lucide-react';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // Use actual sale_price from database if it exists and is less than regular price
  const hasDiscount = Boolean(product.sale_price && product.sale_price < product.price);
  
  // Calculate percentage
  let discountPercent = 0;
  if (hasDiscount && product.sale_price) {
    discountPercent = Math.round(((product.price - product.sale_price) / product.price) * 100);
  }

  // Determine which price to show where
  const currentPrice = hasDiscount && product.sale_price ? product.sale_price : product.price;
  const originalPrice = hasDiscount ? product.price : null;

  // Calculate Average Rating
  let avgRating = 0;
  let reviewsCount = 0;
  if ((product as any).reviews && Array.isArray((product as any).reviews)) {
    const reviews = (product as any).reviews;
    reviewsCount = reviews.length;
    if (reviewsCount > 0) {
      avgRating = reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviewsCount;
    }
  }

  return (
    <Link href={`/producto/${product.id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        {product.image ? (
          <Image
            src={product.image}
            alt={product.title}
            fill
            unoptimized
            className={styles.image}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div style={{ color: '#999' }}>No Image</div>
        )}
      </div>

      <h3 className={styles.title}>{product.title}</h3>
      
      <div className={styles.rating}>
        <div className={styles.stars}>
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              fill={i + 1 <= avgRating ? "currentColor" : (i + 0.5 <= avgRating ? "url(#half-grad-card)" : "transparent")} 
              color={i + 1 <= Math.ceil(avgRating) ? "currentColor" : "#D4D4D8"} 
              size={16} 
            />
          ))}
          {/* SVG gradient para media estrella si es necesario */}
          <svg width="0" height="0">
            <defs>
              <linearGradient id="half-grad-card">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span className={styles.ratingText}>
          {reviewsCount > 0 ? `${avgRating.toFixed(1)}/5` : 'Nuevo'}
        </span>
      </div>

      <div className={styles.priceRow}>
        <span className={styles.price}>{formatCurrency(currentPrice)}</span>
        {hasDiscount && originalPrice && (
          <>
            <span className={styles.oldPrice}>{formatCurrency(originalPrice)}</span>
            <span className={styles.discount}>-{discountPercent}%</span>
          </>
        )}
      </div>
    </Link>
  );
}
