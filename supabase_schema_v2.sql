-- =============================================
-- FASE 1: MIGRACIÓN DE BASE DE DATOS
-- Este script es NO DESTRUCTIVO. Solo agrega tablas, columnas y políticas.
-- =============================================

-- 1. Crear Enums (solo si no existen)
DO $$ BEGIN
    CREATE TYPE product_type AS ENUM ('SUPPLEMENT', 'CLOTHES', 'ACCESSORY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE gender_type AS ENUM ('MEN', 'WOMEN', 'UNISEX');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Crear Tabla Brands (Marcas)
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Crear Tabla Categories (Categorías)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  image TEXT,
  "order" INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Crear Tabla Subcategories (Subcategorías)
CREATE TABLE IF NOT EXISTS public.subcategories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  "order" INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Modificar Tabla Products (manteniendo columnas existentes intactas)
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS sale_price NUMERIC,
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS barcode TEXT,
  ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS gender gender_type,
  ADD COLUMN IF NOT EXISTS type product_type,
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS new BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS weight NUMERIC,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 6. Crear Tabla Product Images (Galería)
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  alt TEXT
);

-- 7. Crear Tabla Product Variants (Talles y colores para ropa)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  size TEXT NOT NULL,
  color TEXT,
  stock INTEGER DEFAULT 0,
  sku TEXT
);

-- 8. Crear Tabla Supplement Information (Info Nutricional)
CREATE TABLE IF NOT EXISTS public.supplement_information (
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE PRIMARY KEY,
  servings INTEGER,
  grams NUMERIC,
  flavor TEXT,
  net_weight NUMERIC,
  ingredients TEXT,
  nutrition JSONB, -- Guarda la tabla en formato JSON
  warnings TEXT,
  entrada INTEGER,
  salida INTEGER
);

-- 9. Crear Tabla Shipping Addresses
CREATE TABLE IF NOT EXISTS public.shipping_addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT,
  apellido TEXT,
  dni TEXT,
  telefono TEXT,
  email TEXT,
  provincia TEXT,
  ciudad TEXT,
  codigo_postal TEXT,
  direccion TEXT,
  numero TEXT,
  piso TEXT,
  departamento TEXT,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Modificar Tabla Orders
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS shipping_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS tracking_number TEXT,
  ADD COLUMN IF NOT EXISTS shipping_company TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS shipping_address_id UUID REFERENCES public.shipping_addresses(id) ON DELETE SET NULL;

-- 11. Habilitar Seguridad (RLS)
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplement_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_addresses ENABLE ROW LEVEL SECURITY;

-- 12. Políticas RLS
-- Brands
DROP POLICY IF EXISTS "Anyone can view active brands" ON public.brands;
CREATE POLICY "Anyone can view active brands" ON public.brands FOR SELECT USING (active = true);
DROP POLICY IF EXISTS "Admins can manage brands" ON public.brands;
CREATE POLICY "Admins can manage brands" ON public.brands USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- Categories
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;
CREATE POLICY "Anyone can view active categories" ON public.categories FOR SELECT USING (active = true);
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" ON public.categories USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- Subcategories
DROP POLICY IF EXISTS "Anyone can view active subcategories" ON public.subcategories;
CREATE POLICY "Anyone can view active subcategories" ON public.subcategories FOR SELECT USING (active = true);
DROP POLICY IF EXISTS "Admins can manage subcategories" ON public.subcategories;
CREATE POLICY "Admins can manage subcategories" ON public.subcategories USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- Product Images
DROP POLICY IF EXISTS "Anyone can view product images" ON public.product_images;
CREATE POLICY "Anyone can view product images" ON public.product_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage product images" ON public.product_images;
CREATE POLICY "Admins can manage product images" ON public.product_images USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- Product Variants
DROP POLICY IF EXISTS "Anyone can view product variants" ON public.product_variants;
CREATE POLICY "Anyone can view product variants" ON public.product_variants FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage product variants" ON public.product_variants;
CREATE POLICY "Admins can manage product variants" ON public.product_variants USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- Supplement Info
DROP POLICY IF EXISTS "Anyone can view supplement info" ON public.supplement_information;
CREATE POLICY "Anyone can view supplement info" ON public.supplement_information FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage supplement info" ON public.supplement_information;
CREATE POLICY "Admins can manage supplement info" ON public.supplement_information USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- Shipping Addresses
DROP POLICY IF EXISTS "Users can view own shipping addresses" ON public.shipping_addresses;
CREATE POLICY "Users can view own shipping addresses" ON public.shipping_addresses FOR SELECT USING (auth.uid() = profile_id);
DROP POLICY IF EXISTS "Users can manage own shipping addresses" ON public.shipping_addresses;
CREATE POLICY "Users can manage own shipping addresses" ON public.shipping_addresses USING (auth.uid() = profile_id);
DROP POLICY IF EXISTS "Admins can view all shipping addresses" ON public.shipping_addresses;
CREATE POLICY "Admins can view all shipping addresses" ON public.shipping_addresses FOR SELECT USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );
