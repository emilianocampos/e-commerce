import styles from './BrandsBanner.module.css';

export function BrandsBanner({ settings }: { settings?: any }) {
  // If we have custom images/texts, use them. Otherwise fallback to text brands.
  const hasCustomBrands = settings?.brands_images && Array.isArray(settings.brands_images) && settings.brands_images.length > 0;
  
  const defaultBrands = ['VERSACE', 'ZARA', 'GUCCI', 'PRADA', 'CALVIN KLEIN'];
  
  const renderItems = () => {
    if (hasCustomBrands) {
      return settings.brands_images.map((item: any, i: number) => {
        // Fallback for older string-only databases
        if (typeof item === 'string') {
          return <img key={i} src={item} alt={`Brand ${i}`} className={styles.brandImage} />;
        }
        if (item.type === 'text') {
          return <div key={i} className={styles.brand}>{item.value}</div>;
        }
        return <img key={i} src={item.value} alt={`Brand ${i}`} className={styles.brandImage} />;
      });
    }
    return defaultBrands.map((brand, i) => (
      <div key={i} className={styles.brand}>{brand}</div>
    ));
  };

  return (
    <div className={styles.banner}>
      <div className={styles.marqueeContainer}>
        <div className={styles.marqueeContent}>
          {renderItems()}
        </div>
        {/* Duplicate for infinite scroll effect */}
        <div className={styles.marqueeContent}>
          {renderItems()}
        </div>
      </div>
    </div>
  );
}
