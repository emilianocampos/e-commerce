/**
 * Archivo: src/lib/auth.ts
 * Responsabilidad: Proveer funciones utilitarias de servidor (Server-Side) para 
 * interactuar con la sesión actual y extraer información útil como el perfil o el rol
 * del usuario para comprobaciones de seguridad.
 */
// Importamos la función para crear el cliente de Supabase optimizado para el servidor
import { createClient } from './supabase-server';

/**
 * Obtiene el usuario autenticado actualmente verificando su sesión.
 * @returns {Promise<User | null>} Objeto User de Supabase o null si no está logueado.
 */
export async function getUser() {
  // 1. Inicializamos el cliente de Supabase (lee las cookies de Next.js automáticamente)
  const supabase = await createClient();
  
  // 2. Le pedimos a Supabase el usuario de la sesión actual de forma segura (auth.getUser)
  const {
    data: { user }, // Extraemos 'user' del objeto 'data'
    error,          // Extraemos cualquier posible 'error'
  } = await supabase.auth.getUser();

  // 3. Si hubo un error o no se encontró ningún usuario, devolvemos null
  if (error || !user) {
    return null;
  }

  // 4. Si todo salió bien, devolvemos los datos básicos del usuario (email, id, etc.)
  return user;
}

/**
 * Obtiene el registro completo de la tabla `profiles` correspondiente al usuario actual.
 * Ideal para consultar el rol ('admin' o 'user') del usuario autenticado.
 * @returns {Promise<Profile | null>} Datos del perfil del usuario o null.
 */
export async function getProfile() {
  // 1. Primero llamamos a nuestra función getUser() para saber quién es el usuario
  const user = await getUser();
  
  // 2. Si no hay usuario logueado, no hay perfil que buscar, salimos devolviendo null
  if (!user) return null;

  // 3. Inicializamos el cliente de Supabase para poder hacer una consulta a la base de datos
  const supabase = await createClient();
  
  // 4. Hacemos una consulta (SELECT) a la tabla 'profiles'
  const { data: profile, error } = await supabase
    .from('profiles') // De la tabla 'profiles'
    .select('*')      // Seleccionamos todas las columnas
    .eq('id', user.id) // Donde la columna 'id' sea igual al 'id' de nuestro usuario
    .single();        // Esperamos un único resultado (no un array)

  // 5. Si ocurre algún error en la consulta (ej. la tabla no existe), lo imprimimos en consola
  if (error) {
    console.error('Error fetching profile:', error.message);
    return null; // Y devolvemos null para no romper la aplicación
  }

  // 6. Devolvemos el perfil encontrado (que contiene el 'role', 'email', etc.)
  return profile;
}

/**
 * Verifica si el usuario actual es un administrador.
 * Lanza un error si no está autenticado o si su rol no es 'admin',
 * protegiendo así Server Actions o Server Components contra accesos no autorizados.
 * @returns {Promise<Profile>} El perfil del administrador si tiene éxito.
 * @throws {Error} Si el usuario no tiene permisos.
 */
export async function requireAdmin() {
  // 1. Obtenemos el perfil completo del usuario actual usando nuestra función anterior
  const profile = await getProfile();
  
  // 2. Verificamos dos cosas:
  //    - Si 'profile' no existe (es decir, el usuario no está logueado o no tiene perfil)
  //    - O si la columna 'role' del perfil NO es igual a 'admin'
  if (!profile || profile.role !== 'admin') {
    // 3. Si alguna es cierta, lanzamos un error bloqueando la ejecución del código siguiente
    throw new Error('Unauthorized');
  }
  
  // 4. Si pasa la verificación, devolvemos el perfil del administrador
  return profile;
}
