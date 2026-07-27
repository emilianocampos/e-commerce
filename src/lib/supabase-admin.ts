/**
 * Archivo: src/lib/supabase-admin.ts
 * Responsabilidad: Instancia del cliente de Supabase con el SERVICE_ROLE_KEY.
 * IMPORTANTE: Solo usar en Server Actions o Route Handlers — NUNCA en el cliente.
 * Este cliente saltea las políticas RLS y tiene acceso completo a la base de datos.
 */
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Variable de entorno de servidor (secreta)
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
