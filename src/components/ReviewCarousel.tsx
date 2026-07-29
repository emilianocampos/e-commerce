'use client';

import { Star, CheckCircle, ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ReviewCarousel.module.css';

interface Review {
  id: string;
  name: string;
  message: string;
  rating: number;
}

interface ReviewCarouselProps {
  reviews: Review[];
  isLoggedIn: boolean;
  createReviewAction: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
}

export function ReviewCarousel({ reviews, isLoggedIn, createReviewAction }: ReviewCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 320;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleOpenModal = () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    setIsModalOpen(true);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);
    formData.set('rating', rating.toString());

    const result = await createReviewAction(formData);
    
    setIsSubmitting(false);
    
    if (result.error) {
      setErrorMsg(result.error);
    } else {
      setIsModalOpen(false);
    }
  };

  return (
    <section className={styles.sectionWrapper}>
      <div className={styles.header}>
        <div className="flex flex-col gap-4 items-start w-full md:w-auto">
          <h2 className={styles.title}>NUESTROS CLIENTES FELICES</h2>
          <button 
            onClick={handleOpenModal}
            className="w-full md:w-auto text-sm md:text-base font-medium px-6 py-3 md:py-2 bg-black text-white rounded-full hover:bg-zinc-800 transition-colors"
          >
            Escribir Reseña
          </button>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <div className={styles.navBtns}>
            <button className={styles.navBtn} onClick={() => scroll('left')}>
              <ArrowLeft size={24} />
            </button>
            <button className={styles.navBtn} onClick={() => scroll('right')}>
              <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.carousel} ref={carouselRef}>
        {reviews.length === 0 ? (
          <div className="flex w-full items-center justify-center p-8 text-zinc-500">
            Todavía no hay reseñas. ¡Sé el primero en opinar!
          </div>
        ) : (
          reviews.map(review => (
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
              <p className={styles.reviewText}>"{review.message}"</p>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md relative shadow-xl">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600"
            >
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold mb-6">Dejar una Reseña</h3>
            
            {errorMsg && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Calificación</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`${rating >= star ? 'text-yellow-400' : 'text-zinc-300'} transition-colors`}
                    >
                      <Star size={32} fill="currentColor" />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-zinc-700 mb-2">Mensaje</label>
                <textarea 
                  id="message"
                  name="message" 
                  rows={4} 
                  required
                  placeholder="¿Qué te pareció tu experiencia en Dravenix?"
                  className="w-full border border-zinc-300 rounded-xl p-3 outline-none focus:border-black resize-none"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-black text-white py-3 rounded-full font-medium hover:bg-zinc-800 disabled:opacity-50 mt-2 transition-colors"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Reseña'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
