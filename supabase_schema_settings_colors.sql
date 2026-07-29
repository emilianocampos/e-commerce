-- =============================================
-- AGREGAR COLORES PARA EL HERO
-- Ejecutar en el SQL Editor de Supabase
-- =============================================

ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS hero_title_color TEXT DEFAULT '#FACC15',
ADD COLUMN IF NOT EXISTS hero_subtitle_color TEXT DEFAULT '#FFFFFF';
