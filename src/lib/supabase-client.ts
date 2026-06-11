/**
 * Archivo: src/lib/supabase-client.ts
 * Responsabilidad: Inicializar y exportar el cliente de Supabase optimizado para ejecutarse en el navegador.
 * Este archivo NO usa `next/headers` ni APIs de servidor, garantizando compatibilidad total con Client Components.
 */
// Importamos la función nativa de Supabase SSR para crear el cliente en el navegador
import { createBrowserClient } from '@supabase/ssr';

/**
 * Crea o recupera una instancia del cliente de Supabase para el navegador.
 * Gestiona de forma automática la sesión actual usando cookies y localStorage.
 * @returns {SupabaseClient} Instancia lista para hacer peticiones a Supabase desde el cliente.
 */
export function createClient() {
  // createBrowserClient toma nuestras variables de entorno públicas y crea una
  // conexión con nuestro proyecto de Supabase. A diferencia del servidor, en el 
  // navegador esto se encarga de todo el manejo de cookies y sesiones localmente
  // sin necesitar configuraciones adicionales.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, // URL del proyecto
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Llave anónima pública
  );
}
