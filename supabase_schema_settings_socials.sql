-- =============================================
-- AGREGAR REDES SOCIALES
-- Ejecutar en el SQL Editor de Supabase
-- =============================================

ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS instagram_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS facebook_url TEXT DEFAULT '';
