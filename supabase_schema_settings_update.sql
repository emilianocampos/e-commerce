-- =============================================
-- ACTUALIZACIÓN DE TABLA DE CONFIGURACIÓN
-- Ejecutar en el SQL Editor de Supabase
-- =============================================

ALTER TABLE public.store_settings 
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
ADD COLUMN IF NOT EXISTS style_4_image TEXT;
