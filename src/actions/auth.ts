/**
 * Archivo: src/actions/auth.ts
 * Responsabilidad: Definir Server Actions para manejar la autenticación de usuarios.
 * Estas funciones se ejecutan de manera segura en el servidor y mutan el estado
 * de la sesión, sin exponer la lógica al cliente ni requerir APIs intermedias.
 */
'use server'; // Esta directiva le dice a Next.js que todas las funciones de este archivo deben ejecutarse en el servidor.

import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

/**
 * Procesa el formulario de inicio de sesión, conectando con Supabase Auth.
 * @param {FormData} formData - Los datos capturados del formulario de cliente.
 * @returns {Promise<{error: string} | void>} Un error en caso de fallo, o redirige en éxito.
 */
export async function login(formData: FormData) {
  // 1. Extraemos el email y contraseña enviados por el usuario desde el formulario
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // 2. Validación básica para asegurarnos de que se enviaron ambos datos
  if (!email || !password) {
    return { error: 'Email y contraseña requeridos' };
  }

  // 3. Inicializamos nuestro cliente de Supabase (específico para el servidor)
  const supabase = await createClient();
  
  // 4. Intentamos iniciar sesión utilizando el método de Supabase con email y password
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // 5. Si las credenciales son incorrectas o hay algún error, devolvemos un mensaje de error
  if (error) {
    return { error: error.message };
  }

  // 6. Si todo salió bien, redirigimos al usuario a la página principal ('/')
  redirect('/');
}

/**
 * Procesa el formulario de registro de nuevos usuarios en Supabase Auth.
 * @param {FormData} formData - Datos capturados del formulario de registro.
 * @returns {Promise<{error: string} | void>} Un error en caso de fallo, o redirige en éxito.
 */
export async function register(formData: FormData) {
  // 1. Extraemos los campos del formulario de registro
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // 2. Validación básica de campos
  if (!email || !password) {
    return { error: 'Email y contraseña requeridos' };
  }

  // 3. Inicializamos el cliente de Supabase
  const supabase = await createClient();
  
  // 4. Utilizamos la función signUp de Supabase para registrar al usuario
  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  // 5. Si la contraseña es débil o el email ya existe, devolvemos el error al usuario
  if (error) {
    return { error: error.message };
  }

  // 6. En caso de éxito, redirigimos al inicio de sesión con un mensaje de éxito
  redirect('/login?message=Revisa tu correo para confirmar tu cuenta');
}

/**
 * Cierra la sesión activa del usuario y borra las cookies de Supabase correspondientes.
 * Luego redirige al usuario de vuelta a la página de inicio de sesión.
 */
export async function logout() {
  // 1. Obtenemos el cliente de Supabase
  const supabase = await createClient();
  
  // 2. Le pedimos a Supabase que destruya la sesión actual del usuario en la base de datos
  await supabase.auth.signOut();
  
  // 3. Redirigimos de vuelta a la página de inicio de sesión
  redirect('/login');
}
