'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, ArrowRight } from 'lucide-react';
import styles from './DiscountModalBanner.module.css';

interface DiscountModalBannerProps {
  bannerText?: string;
}

export function DiscountModalBanner({ bannerText }: DiscountModalBannerProps) {
  const router = useRouter();
  const defaultText = 'Sign up and get 20% off to your first order.';
  const displayText = bannerText || defaultText;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [isBannerEntering, setIsBannerEntering] = useState(false);
  const [isPermanentlyClosed, setIsPermanentlyClosed] = useState(false);

  const hasTriggeredRef = useRef(false);

  // Escuchar cuando la cortina del loader termina de abrirse
  useEffect(() => {
    const triggerModal = () => {
      if (hasTriggeredRef.current) return;
      hasTriggeredRef.current = true;

      // Breve pausa para sincronizar con la apertura de la cortina
      setTimeout(() => {
        setIsModalOpen(true);
        setIsBannerVisible(false);
      }, 150);
    };

    window.addEventListener('curtain-opened', triggerModal);

    const fallbackTimer = setTimeout(() => {
      if (!hasTriggeredRef.current) {
        triggerModal();
      }
    }, 850);

    return () => {
      window.removeEventListener('curtain-opened', triggerModal);
      clearTimeout(fallbackTimer);
    };
  }, []);

  // Cerrar modal con animación hacia arriba y mostrar el banner original en su posición
  const handleCloseModal = () => {
    if (isModalClosing) return;
    setIsModalClosing(true);

    // Al comenzar la subida del modal, desplegamos el banner original
    setTimeout(() => {
      setIsBannerVisible(true);
      setIsBannerEntering(true);
    }, 180);

    // Concluir el cierre del modal
    setTimeout(() => {
      setIsModalOpen(false);
      setIsModalClosing(false);
      setIsBannerEntering(false);
    }, 420);
  };

  // Al tocar aprovechar descuento: animar cierre y enviar a todos los productos (/shop)
  const handleAprovecharDescuento = () => {
    handleCloseModal();
    router.push('/shop');
  };

  // Cerrar banner superior definitivamente con la cruz (igual que antes)
  const handleDismissBanner = () => {
    setIsPermanentlyClosed(true);
    setIsBannerVisible(false);
  };

  return (
    <>
      {/* 1. BANNER SUPERIOR: Exactamente con el texto y color original sin modificar */}
      {!isPermanentlyClosed && isBannerVisible && (
        <div
          className={`${styles.banner} ${isBannerEntering ? styles.bannerEntering : ''}`}
        >
          {displayText}
          <button
            type="button"
            className={styles.bannerClose}
            onClick={handleDismissBanner}
            aria-label="Cerrar banner"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 2. MODAL DE DESCUENTO AL ABRIR LA CORTINA */}
      {isModalOpen && (
        <div
          className={`${styles.overlay} ${isModalClosing ? styles.overlayClosing : ''}`}
          onClick={handleCloseModal}
        >
          <div
            className={`${styles.modalCard} ${isModalClosing ? styles.modalCardClosing : ''}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Botón de cierre */}
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              title="Cerrar y continuar"
              aria-label="Cerrar modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Encabezado del modal */}
            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              {/* Título */}
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase leading-tight">
                  {displayText}
                </div>
              </div>

              <p className="text-xs md:text-sm text-zinc-400 max-w-sm leading-relaxed pb-2">
                Aprovecha esta promoción especial en todas nuestras prendas, suplementos y combos.
              </p>
            </div>

            {/* Botón de acción */}
            <div className="mt-4">
              <button
                type="button"
                onClick={handleAprovecharDescuento}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black font-black text-sm uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <span>¡Aprovechar Descuento!</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
