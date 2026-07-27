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
  title: "SHOP.CO",
  description: "E-Commerce Premium Shop.co Template",
};

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

  // b. Retornamos la estructura HTML fundamental
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${archivoBlack.variable} bg-white text-shop-black min-h-screen flex flex-col font-sans antialiased selection:bg-shop-black selection:text-white`}
      >
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
        <CartDrawer />
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
