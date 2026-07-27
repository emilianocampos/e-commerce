'use client';
import { Star, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import styles from './ReviewCarousel.module.css';

interface Review {
  id: number;
  name: string;
  text: string;
  rating: number;
}

const REVIEWS: Review[] = [
  {
    id: 1,
    name: "Sarah M.",
    text: "Estoy asombrada por la calidad y el estilo de los productos que recibí de Shop.co. Cada pieza que he comprado ha superado mis expectativas.",
    rating: 5,
  },
  {
    id: 2,
    name: "Alex K.",
    text: "Encontrar productos que se adapten a mi estilo solía ser un desafío hasta que descubrí Shop.co. La variedad de opciones que ofrecen es realmente notable.",
    rating: 5,
  },
  {
    id: 3,
    name: "James L.",
    text: "Como alguien que siempre busca lo último en tendencias, estoy encantado con Shop.co. La selección no solo es diversa, sino que también está a la vanguardia.",
    rating: 5,
  },
  {
    id: 4,
    name: "Emily R.",
    text: "El envío fue rápido y los productos encajan perfectamente. Definitivamente volveré a comprar aquí. ¡Muy recomendado!",
    rating: 5,
  }
];

export function ReviewCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 320;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className={styles.sectionWrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>NUESTROS CLIENTES FELICES</h2>
        <div className={styles.navBtns}>
          <button className={styles.navBtn} onClick={() => scroll('left')}>
            <ArrowLeft size={24} />
          </button>
          <button className={styles.navBtn} onClick={() => scroll('right')}>
            <ArrowRight size={24} />
          </button>
        </div>
      </div>
      
      <div className={styles.carousel} ref={carouselRef}>
        {REVIEWS.map(review => (
          <div key={review.id} className={styles.reviewCard}>
            <div className={styles.stars}>
              {[...Array(review.rating)].map((_, i) => (
                <Star key={i} size={20} fill="currentColor" />
              ))}
            </div>
            <h3 className={styles.userName}>
              {review.name}
              <CheckCircle size={18} className={styles.verifiedIcon} fill="currentColor" color="white" />
            </h3>
            <p className={styles.reviewText}>"{review.text}"</p>
          </div>
        ))}
      </div>
    </section>
  );
}
