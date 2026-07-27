'use client';

import { useState } from 'react';
import { Star, StarHalf, User } from 'lucide-react';
import { createReview } from '@/actions/reviews';
import { showToast } from 'nextjs-toast-notify';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: {
    email: string;
  } | null;
}

interface ProductReviewsProps {
  productId: string;
  reviews: Review[];
  user: any; // Supabase user
}

export function ProductReviews({ productId, reviews, user }: ProductReviewsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast.error('Debes iniciar sesión para dejar una reseña.');
      return;
    }
    
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('product_id', productId);
    formData.append('rating', rating.toString());
    formData.append('comment', comment);

    try {
      const result = await createReview(null, formData);
      if (result.error) {
        showToast.error(result.error);
      } else {
        showToast.success('¡Reseña enviada con éxito!');
        setComment('');
        setRating(5);
        setShowForm(false);
      }
    } catch (err: any) {
      showToast.error('Error de red. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h3 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
          Todas las reseñas <span className="text-sm font-normal text-zinc-500">({reviews.length})</span>
        </h3>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowForm(!showForm)}
            className="h-12 rounded-full bg-zinc-900 text-white px-6 font-medium text-sm hover:bg-zinc-800 transition-colors"
          >
            {showForm ? 'Cancelar' : 'Escribir reseña'}
          </button>
        </div>
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="mb-10 p-6 border border-zinc-200 rounded-[20px] bg-zinc-50">
          <h4 className="text-lg font-bold mb-4">Escribir una reseña</h4>
          {!user ? (
            <p className="text-zinc-500">Inicia sesión para poder calificar este producto.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Calificación</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-2xl transition-colors focus:outline-none"
                    >
                      <Star fill={star <= rating ? "#FFC633" : "transparent"} color={star <= rating ? "#FFC633" : "#D4D4D8"} size={28} />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Comentario</label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="¿Qué te pareció el producto?"
                  className="w-full rounded-xl border border-zinc-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-zinc-900 text-white px-6 py-3 rounded-full font-medium text-sm hover:bg-zinc-800 disabled:opacity-50"
                >
                  {isSubmitting ? 'Enviando...' : 'Publicar Reseña'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          Aún no hay reseñas para este producto. ¡Sé el primero en opinar!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reviews.map((review) => (
            <div key={review.id} className="border border-zinc-200 rounded-[20px] p-6 lg:p-8">
              <div className="flex justify-between items-start mb-4">
                <div className="flex text-[#FFC633] gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} fill={i < review.rating ? "currentColor" : "transparent"} color={i < review.rating ? "currentColor" : "#D4D4D8"} size={20} />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center">
                  <User size={16} className="text-zinc-500" />
                </div>
                <h4 className="font-bold text-lg text-zinc-900 capitalize">
                  {review.profiles?.email?.split('@')[0] || 'Usuario Anónimo'}
                </h4>
              </div>
              <p className="text-zinc-500 mb-6 leading-relaxed whitespace-pre-wrap">
                "{review.comment}"
              </p>
              <p className="text-zinc-400 font-medium text-sm">
                Publicado el {new Date(review.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
