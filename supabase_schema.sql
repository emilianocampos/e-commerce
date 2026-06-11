-- 1. Crear tipo enumerado para roles (opcional, pero buena práctica)
-- CREATE TYPE user_role AS ENUM ('admin', 'user');

-- 2. Crear tabla profiles
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Crear tabla products
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Crear tabla orders
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  total NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Crear tabla order_items
CREATE TABLE public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- HABILITAR SEGURIDAD A NIVEL DE FILA (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA PROFILES
-- Permitir que el usuario logueado pueda ver su propio perfil
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Permitir a admins ver todos los perfiles (opcional pero útil para el panel admin)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- Permitir que el usuario pueda actualizar su perfil (si fuese necesario)
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- POLÍTICAS PARA PRODUCTS
-- Cualquiera (incluso no autenticados) puede ver los productos
CREATE POLICY "Anyone can view products" 
ON public.products FOR SELECT 
USING (true);

-- Solo administradores pueden insertar/actualizar/borrar productos
CREATE POLICY "Admins can insert products" 
ON public.products FOR INSERT 
WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

CREATE POLICY "Admins can update products" 
ON public.products FOR UPDATE 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

CREATE POLICY "Admins can delete products" 
ON public.products FOR DELETE 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- POLÍTICAS PARA ORDERS
-- Usuarios pueden ver sus propias órdenes
CREATE POLICY "Users can view own orders" 
ON public.orders FOR SELECT 
USING (auth.uid() = user_id);

-- Usuarios pueden crear sus propias órdenes
CREATE POLICY "Users can insert own orders" 
ON public.orders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins pueden ver todas las órdenes
CREATE POLICY "Admins can view all orders" 
ON public.orders FOR SELECT 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- POLÍTICAS PARA ORDER_ITEMS
-- Usuarios pueden ver sus propios order_items a través de la orden
CREATE POLICY "Users can view own order items" 
ON public.order_items FOR SELECT 
USING ( 
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Usuarios pueden insertar sus propios order_items
CREATE POLICY "Users can insert own order items" 
ON public.order_items FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Admins pueden ver todos los order items
CREATE POLICY "Admins can view all order items" 
ON public.order_items FOR SELECT 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- TRIGGER PARA CREAR PERFIL AUTOMÁTICAMENTE CUANDO UN USUARIO SE REGISTRA EN SUPABASE AUTH
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- POLÍTICAS DE STORAGE (Debes tener un bucket creado llamado 'products')
-- Nota: Asegúrate de crear el bucket 'products' y marcarlo como público
-- Las siguientes políticas asumen que el bucket 'products' existe

-- CREATE POLICY "Cualquiera puede ver las imágenes"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'products');

-- CREATE POLICY "Solo admins pueden subir imágenes"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'products' AND 
--   (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
-- );

-- CREATE POLICY "Solo admins pueden eliminar imágenes"
-- ON storage.objects FOR DELETE
-- USING (
--   bucket_id = 'products' AND 
--   (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
-- );
