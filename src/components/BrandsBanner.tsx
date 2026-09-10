import styles from './BrandsBanner.module.css';

export function BrandsBanner({ settings }: { settings?: any }) {
  // Robust parsing: handle stringified JSON, direct array, or array of strings
  let customBrands: any[] = [];
  if (settings?.brands_images) {
    if (Array.isArray(settings.brands_images)) {
      customBrands = settings.brands_images;
    } else if (typeof settings.brands_images === 'string') {
      try {
        customBrands = JSON.parse(settings.brands_images);
      } catch (e) {
        customBrands = [];
      }
    }
  }

  const hasCustomBrands = Array.isArray(customBrands) && customBrands.length > 0;
  const defaultBrands = ['VERSACE', 'ZARA', 'GUCCI', 'PRADA', 'CALVIN KLEIN'];
  
  const renderItems = (prefix: string) => {
    if (hasCustomBrands) {
      return customBrands.map((item: any, i: number) => {
        const isObject = typeof item === 'object' && item !== null;
        const type = isObject ? item.type : 'text';
        const val = isObject ? (item.value || item.url || item.src) : item;

        if (!val) return null;

        // Check if val is an image URL
        const isImage = type === 'image' || (
          typeof val === 'string' && (
            val.startsWith('http://') || 
            val.startsWith('https://') || 
            val.startsWith('/') ||
            val.startsWith('data:image/') ||
            val.includes('/storage/v1/object/public/') ||
            /\.(png|jpg|jpeg|webp|svg|gif|avif)(\?.*)?$/i.test(val)
          )
        );

        if (isImage) {
          return (
            <div key={`${prefix}-${i}`} className={styles.brandImageWrapper}>
              <img 
                src={val} 
                alt={isObject && item.name ? item.name : `Marca ${i + 1}`} 
                className={styles.brandImage}
                loading="eager"
                decoding="async"
              />
            </div>
          );
        }
        return (
          <div key={`${prefix}-${i}`} className={styles.brand}>{val}</div>
        );
      });
    }
    return defaultBrands.map((brand, i) => (
      <div key={`${prefix}-${i}`} className={styles.brand}>{brand}</div>
    ));
  };

  return (
    <div className={styles.banner}>
      <div className={styles.marqueeContainer}>
        <div className={styles.marqueeContent}>
          {renderItems('set1')}
        </div>
        {/* Duplicates for smooth infinite loop across all resolutions */}
        <div className={styles.marqueeContent} aria-hidden="true">
          {renderItems('set2')}
        </div>
        <div className={styles.marqueeContent} aria-hidden="true">
          {renderItems('set3')}
        </div>
        <div className={styles.marqueeContent} aria-hidden="true">
          {renderItems('set4')}
        </div>
      </div>
    </div>
  );
}

