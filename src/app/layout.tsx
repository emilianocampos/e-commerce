/**
 * Archivo: src/app/layout.tsx
 * Responsabilidad: Es el contenedor raíz (Root Layout) de toda la aplicación.
 * Todo lo que se ponga aquí envolverá a todas las demás páginas (ej. el Header o Footer).
 */
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { getUser, getProfile } from "@/lib/auth";

// 1. Configuramos la fuente Inter que Next.js cargará automáticamente optimizada
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// 2. Metadatos globales (título y descripción por defecto para SEO)
export const metadata: Metadata = {
  title: "E-Commerce",
  description: "Plataforma de e-commerce moderna.",
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

  // b. Retornamos la estructura HTML fundamental
  return (
    <html lang="es">
      <body
        className={`${inter.variable} antialiased bg-zinc-50 text-zinc-950 min-h-screen flex flex-col`}
      >
        {/* Renderizamos el Navbar pasando los datos del usuario como props para que sepa quién es y qué rol tiene */}
        <Navbar user={user} role={profile?.role || null} />
        
        {/* Renderizamos el contenido central de la página (el hijo) */}
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
