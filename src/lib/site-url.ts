/**
 * Dominio oficial y canónico de producción para KLONFARK.
 * Se utiliza para generar sitemaps, robots.txt, canonical links, OpenGraph y JSON-LD.
 */
export const OFFICIAL_SITE_URL = 'https://klonfark.com';

/**
 * Retorna la URL base canonicalizada del sitio.
 * Si NEXT_PUBLIC_SITE_URL contiene un dominio temporal de Vercel (*.vercel.app),
 * se fuerza automáticamente el uso de https://klonfark.com para evitar
 * problemas de indexación y sitemaps rechazados por Google Search Console.
 */
export function getSiteUrl(): string {
  const envUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL)?.trim();

  // Si no está definido o apunta a un subdominio de Vercel, usamos el dominio oficial
  if (!envUrl || envUrl.includes('vercel.app')) {
    return OFFICIAL_SITE_URL;
  }

  // Eliminar barra inclinada final si existe
  return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
}
