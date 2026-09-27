/**
 * Archivo: src/actions/auth.ts
 * Responsabilidad: Definir Server Actions para manejar la autenticación de usuarios.
 * Estas funciones se ejecutan de manera segura en el servidor y mutan el estado
 * de la sesión, sin exponer la lógica al cliente ni requerir APIs intermedias.
 */
'use server'; // Esta directiva le dice a Next.js que todas las funciones de este archivo deben ejecutarse en el servidor.

import { createClient, createAdminClient } from '@/lib/supabase-server';
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
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // 5. Si las credenciales son incorrectas o hay algún error, devolvemos un mensaje de error
  if (error) {
    return { error: error.message };
  }

  // 6. Verificamos el rol del usuario para redirigirlo a la sección correspondiente
  if (data?.user) {
    const adminSupabase = createAdminClient();
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profile?.role === 'admin') {
      redirect('/admin');
    }
  }

  // 7. Si es un usuario normal, lo redirigimos a la página principal ('/')
  redirect('/');
}

/**
 * Procesa el formulario de registro de nuevos usuarios en Supabase Auth.
 * @param {FormData} formData - Datos capturados del formulario de registro.
 * @returns {Promise<{error: string} | void>} Un error en caso de fallo, o redirige en éxito.
 */
export async function register(formData: FormData) {
  const email = (formData.get('email') as string || '').trim().toLowerCase();
  const password = formData.get('password') as string || '';
  const confirmPassword = formData.get('confirm_password') as string || '';
  const nombre = (formData.get('nombre') as string || '').trim();
  const apellido = (formData.get('apellido') as string || '').trim();
  const dni = (formData.get('dni') as string || '').trim();
  const telefono = (formData.get('telefono') as string || '').trim();
  const calle = (formData.get('calle') as string || '').trim();
  const numero = (formData.get('numero') as string || '').trim();
  const piso = (formData.get('piso') as string || '').trim();
  const departamento = (formData.get('departamento') as string || '').trim();
  const localidad = ((formData.get('localidad') || formData.get('ciudad')) as string || '').trim();
  const provincia = (formData.get('provincia') as string || '').trim();
  const codigo_postal = (formData.get('codigo_postal') as string || '').trim();
  const referencias = (formData.get('referencias') as string || '').trim();
  const shipping_quote_required = formData.get('shipping_quote_required') === 'true';

  // 1. Validaciones de presencia de campos obligatorios
  if (!email) return { error: 'El correo electrónico es obligatorio.' };
  if (!password) return { error: 'La contraseña es obligatoria.' };
  if (!nombre) return { error: 'El nombre es obligatorio.' };
  if (!apellido) return { error: 'El apellido es obligatorio.' };
  if (!dni) return { error: 'El DNI es obligatorio.' };
  if (!telefono) return { error: 'El teléfono es obligatorio.' };
  if (!calle) return { error: 'La calle es obligatoria.' };
  if (!numero) return { error: 'El número de calle es obligatorio.' };
  if (!provincia) return { error: 'Debes seleccionar una provincia.' };
  if (!localidad) return { error: 'Debes seleccionar una localidad.' };
  if (!codigo_postal) return { error: 'El código postal es obligatorio.' };

  // 2. Validación de formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: 'Por favor ingresa un correo electrónico válido (ej: usuario@email.com).' };
  }

  // 3. Validación de contraseña
  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres.' };
  }
  if (confirmPassword && password !== confirmPassword) {
    return { error: 'Las contraseñas no coinciden.' };
  }

  // 4. Validación de nombre y apellido
  if (nombre.length < 2) {
    return { error: 'El nombre debe tener al menos 2 caracteres.' };
  }
  if (apellido.length < 2) {
    return { error: 'El apellido debe tener al menos 2 caracteres.' };
  }

  // 5. Validación de DNI
  const dniClean = dni.replace(/\D/g, '');
  if (dniClean.length < 7 || dniClean.length > 9) {
    return { error: 'El DNI debe contener entre 7 y 9 dígitos numéricos.' };
  }

  // 6. Validación de teléfono
  const phoneClean = telefono.replace(/\D/g, '');
  if (phoneClean.length < 8 || phoneClean.length > 15) {
    return { error: 'El número de teléfono debe tener entre 8 y 15 dígitos numéricos.' };
  }

  // 7. Validación de dirección
  if (calle.length < 2) {
    return { error: 'La calle debe tener al menos 2 caracteres.' };
  }
  if (codigo_postal.length < 3) {
    return { error: 'El código postal no es válido.' };
  }

  const fullAddress = [
    `${calle} ${numero}`,
    piso ? `Piso ${piso}` : '',
    departamento ? `Dpto ${departamento}` : '',
    provincia ? `Prov ${provincia}` : '',
    referencias ? `Ref: ${referencias}` : ''
  ].filter(Boolean).join(', ');

  const fullName = `${nombre} ${apellido}`.trim();

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        nombre,
        apellido,
        dni: dniClean,
        phone: telefono,
        calle,
        numero,
        piso,
        departamento,
        referencias,
        city: localidad,
        provincia,
        localidad,
        postal_code: codigo_postal,
        codigo_postal,
        shipping_quote_required,
        address: fullAddress,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    const adminSupabase = createAdminClient();
    const { error: profileError } = await adminSupabase.from('profiles').upsert({
      id: data.user.id,
      email: email,
      full_name: fullName,
      nombre: nombre,
      apellido: apellido,
      dni: dniClean,
      phone: telefono,
      address: fullAddress,
      calle: calle,
      numero: numero,
      piso: piso,
      departamento: departamento,
      referencias: referencias,
      city: localidad,
      provincia: provincia,
      localidad: localidad,
      postal_code: codigo_postal,
      codigo_postal: codigo_postal,
      shipping_quote_required: shipping_quote_required,
      role: 'user',
    });

    if (profileError) {
      console.error('Error guardando perfil tras registro:', profileError.message);
    }
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
