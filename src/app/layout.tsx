/**
 * Archivo: src/app/layout.tsx
 * Responsabilidad: Es el contenedor raíz (Root Layout) de toda la aplicación.
 * Todo lo que se ponga aquí envolverá a todas las demás páginas (ej. el Header o Footer).
 */
import type { Metadata } from "next";
import { Inter, Archivo_Black } from "next/font/google";
import "./globals.css";
import { NavbarWrapper } from "@/components/NavbarWrapper";
import { CartDrawer } from "@/components/CartDrawer";
import { FooterWrapper } from "@/components/FooterWrapper";
import { getUser, getProfile } from "@/lib/auth";
import { getStoreSettings } from "@/actions/settings";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { hexToRgb } from "@/lib/utils";
import { Suspense } from "react";
import { RouteCurtainLoader, CurtainLoaderFallback } from "@/components/RouteCurtainLoader";
import { AuthListener } from "@/components/AuthListener";
import NextTopLoader from 'nextjs-toploader';

// 1. Configuramos la fuente Inter que Next.js cargará automáticamente optimizada
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

// 2. Metadatos globales (título y descripción por defecto para SEO)
export const metadata: Metadata = {
  title: {
    template: "%s | KLONFARK",
    default: "KLONFARK | Tu estilo, tu esencia",
  },
  description: "Explora nuestra diversa gama de productos cuidadosamente seleccionados, diseñados para resaltar tu individualidad y adaptarse a tu estilo de vida. KLONFARK ofrece ropa de alta calidad para hombres y mujeres.",
  keywords: ["ropa", "indumentaria", "moda", "klonfark", "ecommerce", "argentina", "suplementos", "ropa urbana", "estilo"],
  authors: [{ name: "KLONFARK" }],
  creator: "KLONFARK",
  openGraph: {
    title: "KLONFARK | Tu estilo, tu esencia",
    description: "Explora nuestra diversa gama de productos cuidadosamente seleccionados, diseñados para resaltar tu individualidad y adaptarse a tu estilo de vida.",
    url: "https://klonfark.com",
    siteName: "KLONFARK",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KLONFARK | Tu estilo, tu esencia",
    description: "Explora nuestra diversa gama de productos cuidadosamente seleccionados, diseñados para resaltar tu individualidad y adaptarse a tu estilo de vida.",
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.png",
  },
};

import Script from 'next/script';

// 3. El componente asíncrono principal que recibe "children" (la página activa)
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // a. Consultamos el estado de autenticación una única vez a nivel raíz
  const user = await getUser();
  const profile = await getProfile();
  const settings = await getStoreSettings();

  const googleTagId = settings?.google_tag_id || process.env.NEXT_PUBLIC_GOOGLE_TAG_ID;
  const googleSiteVerification = settings?.google_site_verification || process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://klonfark.com';
  const baseUrl = rawSiteUrl.endsWith('/') ? rawSiteUrl.slice(0, -1) : rawSiteUrl;

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'KLONFARK',
    url: baseUrl,
    logo: settings?.store_logo_url || `${baseUrl}/logo.png`,
    sameAs: [
      settings?.instagram_url,
      settings?.facebook_url,
      settings?.tiktok_url,
    ].filter(Boolean),
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: settings?.whatsapp_number ? `+${settings.whatsapp_number}` : undefined,
      contactType: 'customer service',
    },
  };

  // b. Retornamos la estructura HTML fundamental
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {settings?.favicon_url ? (
          <>
            <link rel="icon" href={settings.favicon_url} sizes="any" />
            <link rel="shortcut icon" href={settings.favicon_url} />
            <link rel="apple-touch-icon" href={settings.favicon_url} />
          </>
        ) : (
          <link rel="icon" href="/favicon.ico" sizes="any" />
        )}
        {googleSiteVerification && (
          <meta name="google-site-verification" content={googleSiteVerification} />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        {googleTagId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleTagId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body
        suppressHydrationWarning
        data-theme={settings?.theme_mode || 'light'}
        style={{
          '--gradient-from': settings?.gradient_color_from || '#18181b',
          '--gradient-to': settings?.gradient_color_to || '#09090b',
          '--gradient-text-primary': settings?.gradient_text_primary || '#ffffff',
          '--gradient-text-secondary': settings?.gradient_text_secondary || '#d4d4d8',
          '--card-glow-color': settings?.card_glow_color || '#10b981',
          '--card-glow-rgb': hexToRgb(settings?.card_glow_color || '#10b981'),
          colorScheme: (settings?.theme_mode === 'dark' || settings?.theme_mode === 'gradient') ? 'dark' : 'light',
        } as React.CSSProperties}
        className={`${inter.variable} ${archivoBlack.variable} min-h-screen flex flex-col font-sans antialiased selection:bg-shop-black selection:text-white transition-colors duration-300`}
      >
        <Suspense fallback={<CurtainLoaderFallback brandName={settings?.store_name || "KLONFARK"} />}>
          <RouteCurtainLoader brandName={settings?.store_name || "KLONFARK"} />
        </Suspense>
        <NextTopLoader
          color="#000000"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={true}
          easing="ease"
          speed={200}
          shadow="0 0 10px #000000,0 0 5px #000000"
        />
        <WhatsAppButton />
        <CartDrawer />
        <AuthListener />
        {/* Renderizamos el Navbar pasando los datos del usuario como props para que sepa quién es y qué rol tiene */}
        <NavbarWrapper user={user} role={profile?.role || null} settings={settings} />
        
        {/* Renderizamos el contenido central de la página (el hijo) */}
        <main className="flex-1 flex flex-col">{children}</main>
        
        {/* Renderizamos el Footer */}
        <FooterWrapper settings={settings} />
      </body>
    </html>
  );
}
