'use client';

import styles from './ProductCardSkeleton.module.css';

/**
 * ProductCardSkeleton: placeholder profesional animado que imita con máxima fidelidad
 * la forma y componentes exactos de una ProductCard (imagen, título, estrellas de rating,
 * precio con descuento, badge de transferencia y leyenda de cuotas).
 */
export function ProductCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      {/* 1. Imagen placeholder con esquinas redondeadas y relación de aspecto 1:1 */}
      <div className={`${styles.imageWrapper} ${styles.shimmerBase}`} />

      {/* 2. Título de producto */}
      <div className={`${styles.title} ${styles.shimmerBase}`} />

      {/* 3. Fila de Rating (5 estrellas y texto de puntuación) */}
      <div className={styles.ratingRow}>
        <div className={styles.starsGroup}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`${styles.star} ${styles.shimmerBase}`} />
          ))}
        </div>
        <div className={`${styles.ratingText} ${styles.shimmerBase}`} />
      </div>

      {/* 4. Contenedor de Precios */}
      <div className={styles.priceContainer}>
        {/* Precio principal y pastilla de descuento */}
        <div className={styles.priceRow}>
          <div className={`${styles.price} ${styles.shimmerBase}`} />
          <div className={`${styles.discount} ${styles.shimmerBase}`} />
        </div>

        {/* Badge 10% por Transferencia */}
        <div className={`${styles.transferBadge} ${styles.shimmerBase}`} />

        {/* Fila de 3 cuotas con Mercado Pago */}
        <div className={styles.installmentsRow}>
          <div className={`${styles.installmentLine1} ${styles.shimmerBase}`} />
          <div className={`${styles.installmentLine2} ${styles.shimmerBase}`} />
        </div>
      </div>
    </div>
  );
}

/** Grid de skeletons: se usa mientras la página o un chunk de productos carga */
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
