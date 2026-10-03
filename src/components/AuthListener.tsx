'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

export function AuthListener() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();

    // 1. Escuchar eventos de autenticación de Supabase en vivo
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Redirigir de inmediato a la pantalla de cambio de clave
        if (pathname !== '/actualizar-contrasena') {
          router.push('/actualizar-contrasena');
        }
      }
    });

    // 2. Comprobar si en la URL actual (ej. al aterrizar en el home) vienen tokens de recuperación en el hash
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash;
      if (hash.includes('type=recovery') || hash.includes('access_token')) {
        const hashParams = new URLSearchParams(hash.substring(1));
        const type = hashParams.get('type');
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (type === 'recovery' || accessToken) {
          if (accessToken && refreshToken) {
            supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            }).then(() => {
              if (pathname !== '/actualizar-contrasena') {
                router.push('/actualizar-contrasena');
              }
            });
          } else {
            if (pathname !== '/actualizar-contrasena') {
              router.push('/actualizar-contrasena');
            }
          }
        }
      }
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  return null;
}
