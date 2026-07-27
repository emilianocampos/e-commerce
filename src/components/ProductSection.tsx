import Link from 'next/link';
import { Product } from '@/types/product';
import { ProductCard } from './ProductCard';
import styles from './ProductSection.module.css';

interface ProductSectionProps {
  title: string;
  products: Product[];
  viewAllLink: string;
  showDivider?: boolean;
}

export function ProductSection({ title, products, viewAllLink, showDivider = false }: ProductSectionProps) {
  return (
    <>
      <section className={styles.section}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.grid}>
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
      {showDivider && <hr className={styles.divider} />}
    </>
  );
}
