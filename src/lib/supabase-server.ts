/**
 * Archivo: src/lib/supabase-server.ts
 * Responsabilidad: Configurar e instanciar el cliente de Supabase específicamente diseñado para Server Components,
 * Server Actions y Route Handlers. Se integra con `next/headers` para leer y escribir cookies de sesión.
 */
// Importamos la función de Supabase SSR para crear el cliente de servidor
import { createServerClient } from '@supabase/ssr';
// Importamos 'cookies' de Next.js, lo cual nos permite leer/modificar las cookies de la petición actual
import { cookies } from 'next/headers';

/**
 * Crea una instancia de Supabase de servidor. Permite realizar consultas a la base de datos de forma segura
 * aprovechando las variables de entorno de servidor. Adicionalmente, sincroniza las cookies de la sesión.
 * @returns {Promise<SupabaseClient>} Instancia de Supabase conectada con el contexto de cookies actual.
 */
export async function createClient() {
  // 1. Obtenemos el almacén de cookies de la petición actual
  // Nota: En Next.js 15, cookies() devuelve una Promesa, por lo que usamos 'await'
  const cookieStore = await cookies();

  // 2. Creamos y devolvemos el cliente de Supabase
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, // URL del proyecto
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Llave anónima pública
    {
      // 3. Le enseñamos a Supabase cómo leer y escribir cookies en este entorno de servidor
      cookies: {
        // Función para leer todas las cookies actuales
        getAll() {
          return cookieStore.getAll();
        },
        // Función para establecer nuevas cookies (ej. cuando el usuario inicia sesión)
        setAll(cookiesToSet) {
          try {
            // Recorremos la lista de cookies que Supabase necesita guardar
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options) // Usamos el cookieStore de Next.js para guardarlas
            );
          } catch (error) {
            // Nota: Si intentamos guardar una cookie desde un "Server Component" puro que ya 
            // empezó a enviarse al cliente, esto fallaría. Por eso envolvemos esto en un try-catch.
            // Se puede ignorar este error en Server Components
            // si se está refrescando la sesión en el middleware.
          }
        },
      },
    }
  );
}
