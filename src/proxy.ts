/**
 * Archivo: src/proxy.ts (anteriormente middleware.ts)
 * Responsabilidad: Interceptar peticiones entrantes para gestionar la sesión de Supabase
 * en el Edge (antes de que la petición llegue a los componentes), y proteger rutas
 * redirigiendo a los usuarios según su rol.
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Función principal del proxy ejecutada por Next.js en cada petición.
 * Verifica la sesión activa del usuario, actualiza las cookies de Supabase
 * de forma segura y decide si el usuario tiene permiso de acceder a la ruta.
 */
export default async function proxy(request: NextRequest) {
  // 1. Empezamos asumiendo que la petición continuará su curso normal
  // Creamos un NextResponse base que podremos modificar después
  let supabaseResponse = NextResponse.next({
    request,
  });

  // 2. Inicializamos el cliente de Supabase optimizado para este entorno "Edge"
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Obtenemos todas las cookies que vienen en la petición del usuario
        getAll() {
          return request.cookies.getAll();
        },
        // Si Supabase necesita actualizar la sesión (ej. refreshToken expiró),
        // este método se encarga de reescribir esas cookies de vuelta en la respuesta
        setAll(cookiesToSet) {
          // Primero guardamos temporalmente en el request
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          // Luego actualizamos nuestro NextResponse base
          supabaseResponse = NextResponse.next({
            request,
          });
          // Finalmente escribimos definitivamente en el header de respuesta
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 3. IMPORTANTE: Refrescar sesión y obtener usuario actual
  // Al llamar a getUser(), si el token estaba expirado, Supabase lo renueva automáticamente
  // gracias al método setAll que configuramos arriba
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 4. Obtenemos la URL actual que el usuario está intentando visitar
  const pathname = request.nextUrl.pathname;

  // 5. RUTAS PROTEGIDAS
  // Definimos qué rutas requieren qué nivel de permisos
  const isProtectedAdminRoute = pathname.startsWith('/admin'); // Solo admins
  const isProtectedUserRoute = pathname.startsWith('/perfil') || pathname.startsWith('/checkout'); // Usuarios registrados
  const isAuthRoute = pathname === '/login' || pathname === '/register'; // Solo usuarios NO registrados

  // 6. Si no hay usuario y trata de acceder a cualquier ruta protegida
  if (!user && (isProtectedAdminRoute || isProtectedUserRoute)) {
    // Lo redirigimos a iniciar sesión clonando la URL y cambiando el destino
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 7. Si HAY usuario, vamos a verificar su rol para el flujo
  if (user) {
    // Hacemos una consulta rápida a la tabla 'profiles' para saber si es 'admin' o 'user'
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role || 'user';

    // Regla de negocio: Admin -> /admin, User -> /
    
    // Si un admin intenta ir al home o al login (que es para usuarios normales), lo llevamos al panel
    if (role === 'admin' && (pathname === '/' || isAuthRoute)) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }

    // Si un usuario normal intenta escabullirse al panel admin
    if (role === 'user' && isProtectedAdminRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    // Si un usuario normal (ya logueado) intenta ir al login de nuevo
    if (role === 'user' && isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // 8. Si todo está correcto y ninguna regla rompió el flujo, permitimos que la página cargue
  return supabaseResponse;
}

// 9. Configuración adicional de Next.js
export const config = {
  // Le decimos a Next.js en qué rutas queremos que se ejecute este proxy
  matcher: [
    /*
     * Matcher para excluir archivos estáticos y de imagen.
     * No tiene sentido gastar recursos revisando si hay sesión en cada
     * imagen o archivo .css que se descarga.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
