-- =============================================
-- MIGRACIÓN COMPLETA DE STORE SETTINGS Y TEMA WEB
-- Ejecutar en el SQL Editor de Supabase
-- =============================================

-- 1. Agregar todos los campos de configuración visual y estadística a store_settings
ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS show_stats_numbers BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS theme_mode TEXT DEFAULT 'light',
ADD COLUMN IF NOT EXISTS gradient_color_from TEXT DEFAULT '#18181b',
ADD COLUMN IF NOT EXISTS gradient_color_to TEXT DEFAULT '#09090b',
ADD COLUMN IF NOT EXISTS gradient_text_primary TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS gradient_text_secondary TEXT DEFAULT '#d4d4d8',
ADD COLUMN IF NOT EXISTS hero_title_color TEXT DEFAULT '#FACC15',
ADD COLUMN IF NOT EXISTS hero_subtitle_color TEXT DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS hero_mobile_image_url TEXT,
ADD COLUMN IF NOT EXISTS google_tag_id TEXT,
ADD COLUMN IF NOT EXISTS google_site_verification TEXT,
ADD COLUMN IF NOT EXISTS discount_code TEXT,
ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS style_1_title TEXT DEFAULT 'Hombre',
ADD COLUMN IF NOT EXISTS style_1_link TEXT DEFAULT '/shop?gender=MEN',
ADD COLUMN IF NOT EXISTS style_1_image TEXT,
ADD COLUMN IF NOT EXISTS style_2_title TEXT DEFAULT 'Mujer',
ADD COLUMN IF NOT EXISTS style_2_link TEXT DEFAULT '/shop?gender=WOMEN',
ADD COLUMN IF NOT EXISTS style_2_image TEXT,
ADD COLUMN IF NOT EXISTS style_3_title TEXT DEFAULT 'Urbano',
ADD COLUMN IF NOT EXISTS style_3_link TEXT DEFAULT '/shop?category_name=urbano',
ADD COLUMN IF NOT EXISTS style_3_image TEXT,
ADD COLUMN IF NOT EXISTS style_4_title TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS style_4_link TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS style_4_image TEXT,
ADD COLUMN IF NOT EXISTS favicon_url TEXT;

-- 2. Asegurar campos individuales de registro y perfil en profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS nombre TEXT,
ADD COLUMN IF NOT EXISTS apellido TEXT,
ADD COLUMN IF NOT EXISTS dni TEXT,
ADD COLUMN IF NOT EXISTS calle TEXT,
ADD COLUMN IF NOT EXISTS numero TEXT,
ADD COLUMN IF NOT EXISTS piso TEXT,
ADD COLUMN IF NOT EXISTS departamento TEXT,
ADD COLUMN IF NOT EXISTS referencias TEXT,
ADD COLUMN IF NOT EXISTS provincia TEXT,
ADD COLUMN IF NOT EXISTS localidad TEXT,
ADD COLUMN IF NOT EXISTS codigo_postal TEXT;
