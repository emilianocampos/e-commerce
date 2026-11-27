import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente público de Supabase sin cookies (`next/headers`), ideal para
 * Server Components con ISR (`revalidate`) y `unstable_cache`.
 * Evita forzar Dynamic SSR en cada visita o rastreo de bots.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}
