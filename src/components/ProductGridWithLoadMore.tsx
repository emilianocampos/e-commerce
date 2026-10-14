'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { ChevronDown, Loader2 } from 'lucide-react';
import styles from './ProductGridWithLoadMore.module.css';

interface ProductGridWithLoadMoreProps {
  products: Product[];
  chunkSize?: number;
  initialCount?: number;
  gridClassName?: string;
  emptyTitle?: string;
  emptySubtitle?: string;
}

export function ProductGridWithLoadMore({
  products,
  chunkSize = 6,
  initialCount = 6,
  gridClassName = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10',
  emptyTitle = 'No se encontraron productos',
  emptySubtitle = 'Intenta cambiar los filtros para ver más resultados.',
}: ProductGridWithLoadMoreProps) {
  const [visibleCount, setVisibleCount] = useState<number>(initialCount);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Reiniciar el contador si cambia la lista de productos (filtros, ordenamiento, búsqueda)
  useEffect(() => {
    setVisibleCount(initialCount);
  }, [products, initialCount]);

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-24 bg-zinc-50 rounded-[20px] border border-zinc-200">
        <h3 className="text-xl font-bold text-zinc-400 mb-2">{emptyTitle}</h3>
        {emptySubtitle && <p className="text-zinc-500">{emptySubtitle}</p>}
      </div>
    );
  }

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;
  const skeletonCount = Math.min(chunkSize, Math.max(0, products.length - visibleCount));
  const progressPercentage = Math.min(
    100,
    Math.round((visibleProducts.length / products.length) * 100)
  );

  const handleLoadMore = () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    // Mostrar los skeletons profesionales durante 600ms antes de revelar los productos
    setTimeout(() => {
      setVisibleCount((prev) => prev + chunkSize);
      setIsLoadingMore(false);
    }, 600);
  };

  return (
    <div className="w-full flex flex-col">
      {/* Grid de productos */}
      <div className={gridClassName}>
        {visibleProducts.map((product) => (
          <div key={product.id} className={styles.cardItem}>
            <ProductCard product={product as any} />
          </div>
        ))}

        {/* Skeletons idénticos a las ProductCards mientras carga el siguiente chunk */}
        {isLoadingMore && (
          Array.from({ length: skeletonCount }).map((_, i) => (
            <div key={`skeleton-${i}`} className={styles.cardItem}>
              <ProductCardSkeleton />
            </div>
          ))
        )}
      </div>

      {/* Controles de "Ver más" y progreso */}
      {products.length > initialCount && (
        <div className={styles.loadMoreContainer}>
          {/* Indicador de progreso */}
          <div className={styles.counterWrapper}>
            <span className={styles.counterText}>
              Mostrando {visibleProducts.length} de {products.length} productos
            </span>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressBar}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Botón Ver más */}
          {hasMore ? (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className={styles.loadMoreButton}
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-300" />
                  <span>Cargando productos...</span>
                </>
              ) : (
                <>
                  <span>Ver más</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <span className={styles.endText}>
              Has llegado al final del catálogo
            </span>
          )}
        </div>
      )}
    </div>
  );
}
