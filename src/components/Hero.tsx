import Link from 'next/link';
import Image from 'next/image';
import styles from './Hero.module.css';

export function Hero({ settings }: { settings?: any }) {
  const title = settings?.hero_title !== undefined ? settings.hero_title : 'ENCUENTRA LO\nQUE COMBINA CON\nTU ESTILO';
  const subtitle = settings?.hero_subtitle !== undefined ? settings.hero_subtitle : 'Explora nuestra diversa gama de productos cuidadosamente seleccionados, diseñados para resaltar tu individualidad y adaptarse a tu estilo de vida.';
  const desktopImage = settings?.hero_image_url || 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=900&auto=format&fit=crop';
  const mobileImage = settings?.hero_mobile_image_url || desktopImage;
  const showStatsNumbers = settings?.show_stats_numbers;

  return (
    <section className={styles.heroSection}>
      {/* Background Image Layer */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        {settings?.hero_mobile_image_url ? (
          <>
            {/* Mobile specific image */}
            <div className="block md:hidden absolute inset-0">
              <Image 
                src={mobileImage} 
                alt="Hero Mobile Background"
                fill
                className="object-cover object-center"
                priority
              />
            </div>
            {/* Desktop specific image */}
            <div className="hidden md:block absolute inset-0">
              <Image 
                src={desktopImage} 
                alt="Hero Desktop Background"
                fill
                className="object-cover"
                style={{ objectPosition: 'center 30%' }}
                priority
              />
            </div>
          </>
        ) : (
          <Image 
            src={desktopImage} 
            alt="Hero Background"
            fill
            className="object-cover"
            style={{ objectPosition: 'center 20%' }}
            priority
          />
        )}
        {/* Subtle overlay to ensure text readability */}
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.25)' }}></div>
      </div>

      <div className={styles.container}>
        <div className={styles.content}>
          {title && (
            <h1 className={styles.title} style={{ color: settings?.hero_title_color || '#FACC15' }}>
              {title}
            </h1>
          )}
          {subtitle && subtitle.trim().length > 0 && (
            <p className={styles.description} style={{ color: settings?.hero_subtitle_color || 'var(--shop-white)' }}>
              {subtitle}
            </p>
          )}
          <Link href="/shop" className={styles.button} style={{ backgroundColor: settings?.hero_title_color || '#FACC15' }}>
            Comprar Ahora
          </Link>

          {showStatsNumbers !== false && (
            <div className={styles.stats}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{settings?.stats_1_number || '200+'}</span>
                <span className={styles.statLabel} style={{ color: settings?.hero_title_color || '#FACC15' }}>{settings?.stats_1_label || 'Marcas Internacionales'}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{settings?.stats_2_number || '2,000+'}</span>
                <span className={styles.statLabel} style={{ color: settings?.hero_title_color || '#FACC15' }}>{settings?.stats_2_label || 'Productos de Alta Calidad'}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{settings?.stats_3_number || '30,000+'}</span>
                <span className={styles.statLabel} style={{ color: settings?.hero_title_color || '#FACC15' }}>{settings?.stats_3_label || 'Clientes Felices'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
