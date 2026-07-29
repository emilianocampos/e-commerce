import Link from 'next/link';
import Image from 'next/image';
import styles from './BrowseStyle.module.css';

export function BrowseStyle({ settings }: { settings?: any }) {
  // Configuración de los 4 posibles estilos
  const stylesData = [
    {
      title: settings?.style_1_title ?? 'Hombre',
      link: settings?.style_1_link ?? '/shop?gender=MEN',
      image: settings?.style_1_image,
      defaultGradient: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    },
    {
      title: settings?.style_2_title ?? 'Mujer',
      link: settings?.style_2_link ?? '/shop?gender=WOMEN',
      image: settings?.style_2_image,
      defaultGradient: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    },
    {
      title: settings?.style_3_title ?? 'Urbano',
      link: settings?.style_3_link ?? '/shop?category_name=urbano',
      image: settings?.style_3_image,
      defaultGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      title: settings?.style_4_title ?? '',
      link: settings?.style_4_link ?? '',
      image: settings?.style_4_image,
      defaultGradient: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    },
  ];

  // Filtrar los que no tienen título (así el usuario puede ocultarlos si quiere)
  const activeStyles = stylesData.filter(s => s.title && s.title.trim() !== '');

  const getSpanClass = (index: number, total: number) => {
    if (total === 1) return styles.span12;
    if (total === 2) return styles.span6;
    if (total === 3) {
      if (index === 0) return styles.span12;
      return styles.span6;
    }
    if (total === 4) {
      if (index === 0 || index === 3) return styles.span4;
      return styles.span8;
    }
    return styles.span12;
  };

  return (
    <section className={styles.sectionWrapper}>
      <div className={styles.box}>
        <h2 className={styles.title}>BUSCAR POR ESTILO</h2>
        
        <div className={styles.grid}>
          {activeStyles.map((style, index) => {
            const spanClass = getSpanClass(index, activeStyles.length);
            return (
              <Link key={index} href={style.link} className={`${styles.card} ${spanClass}`}>
                <span className={styles.cardTitle}>{style.title}</span>
                
                {style.image ? (
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
                    <Image 
                      src={style.image} 
                      alt={style.title} 
                      fill 
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className={styles.image} 
                    />
                    {/* Overlay sutil para oscurecer la imagen y que el texto se lea mejor */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.15)', zIndex: 1 }}></div>
                  </div>
                ) : (
                  <div style={{ background: style.defaultGradient, width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}></div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
