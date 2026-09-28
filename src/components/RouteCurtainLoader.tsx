"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface RouteCurtainLoaderProps {
  brandName?: string;
}

export function CurtainLoaderFallback({ brandName = "KLONFARK" }: { brandName?: string }) {
  return (
    <div
      className="fixed inset-0 z-[999999] pointer-events-auto overflow-hidden bg-transparent"
      aria-hidden="true"
    >
      {/* Solapa Izquierda Inicial */}
      <div className="fixed top-0 left-0 bottom-0 w-[calc(50%+1px)] bg-[#09090b] shadow-[10px_0_40px_rgba(0,0,0,0.9)] translate-x-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
      </div>

      {/* Solapa Derecha Inicial */}
      <div className="fixed top-0 right-0 bottom-0 w-[calc(50%+1px)] bg-[#09090b] shadow-[-10px_0_40px_rgba(0,0,0,0.9)] translate-x-0">
        <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-transparent to-transparent" />
      </div>

      {/* Emblema Central y Barra de Carga */}
      <div className="fixed inset-0 flex flex-col items-center justify-center z-[1000000] pointer-events-none">
        <div className="flex flex-col items-center px-6 py-4">
          <span className="font-display font-black tracking-widest text-2xl md:text-3xl text-white uppercase drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">
            {brandName}
          </span>
          <div className="relative w-32 md:w-44 h-1 bg-white/20 rounded-full overflow-hidden mt-3.5">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-[curtain-pulse_1.2s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function RouteCurtainLoader({ brandName = "KLONFARK" }: RouteCurtainLoaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const isFirstRender = useRef(true);
  const prevPathRef = useRef(`${pathname}?${searchParams.toString()}`);

  // Animación de apertura: espera a que cargue y luego abre las solapas hacia los lados
  const openCurtain = (delay = 500) => {
    const timer = setTimeout(() => {
      setIsOpen(true);
      // Ocultar totalmente del DOM tras completar el desplazamiento lateral de 900ms
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 950);
      return () => clearTimeout(hideTimer);
    }, delay);

    return () => clearTimeout(timer);
  };

  // 1. Efecto en la primera carga (Initial Load): se muestra cerrado y luego se abre
  useEffect(() => {
    setIsVisible(true);
    setIsOpen(false);
    const cleanup = openCurtain(500);
    return cleanup;
  }, []);

  // 2. Efecto al cambiar de ruta
  useEffect(() => {
    const currentFullUrl = `${pathname}?${searchParams.toString()}`;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (prevPathRef.current !== currentFullUrl) {
      prevPathRef.current = currentFullUrl;
      setIsVisible(true);
      setIsOpen(false);
      const cleanup = openCurtain(350);
      return cleanup;
    }
  }, [pathname, searchParams]);

  // 3. Interceptar clics en enlaces internos para cerrar solapas antes de navegar
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      const targetAttr = target.getAttribute("target");

      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:") ||
        targetAttr === "_blank" ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      try {
        const url = new URL(href, window.location.origin);
        const currentUrl = new URL(window.location.href);

        if (url.origin === currentUrl.origin) {
          if (url.pathname === currentUrl.pathname && url.search === currentUrl.search) {
            return;
          }

          setIsVisible(true);
          setIsOpen(false);
        }
      } catch {
        // Ignorar URLs inválidas
      }
    };

    document.addEventListener("click", handleLinkClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleLinkClick, { capture: true });
    };
  }, []);

  if (!isVisible && isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[999999] pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Solapa Izquierda (se desliza hacia la izquierda sin bordes en el medio) */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-[calc(50%+1px)] bg-[#09090b] shadow-[10px_0_40px_rgba(0,0,0,0.9)] transition-transform duration-900 ease-[cubic-bezier(0.77,0,0.175,1)] will-change-transform ${
          isOpen ? "-translate-x-full pointer-events-none" : "translate-x-0 pointer-events-auto"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
      </div>

      {/* Solapa Derecha (se desliza hacia la derecha sin bordes en el medio) */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[calc(50%+1px)] bg-[#09090b] shadow-[-10px_0_40px_rgba(0,0,0,0.9)] transition-transform duration-900 ease-[cubic-bezier(0.77,0,0.175,1)] will-change-transform ${
          isOpen ? "translate-x-full pointer-events-none" : "translate-x-0 pointer-events-auto"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-transparent to-transparent" />
      </div>

      {/* Emblema Central y Barra de Carga */}
      <div
        className={`fixed inset-0 flex flex-col items-center justify-center transition-all duration-500 ease-out z-[1000000] pointer-events-none ${
          isOpen ? "opacity-0 scale-90 blur-sm" : "opacity-100 scale-100 blur-none"
        }`}
      >
        <div className="flex flex-col items-center px-6 py-4">
          {/* Logo / Nombre de marca */}
          <span className="font-display font-black tracking-widest text-2xl md:text-3xl text-white uppercase drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">
            {brandName}
          </span>

          {/* Barra de carga animada */}
          <div className="relative w-32 md:w-44 h-1 bg-white/20 rounded-full overflow-hidden mt-3.5 shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-[curtain-pulse_1.2s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    </div>
  );
}
