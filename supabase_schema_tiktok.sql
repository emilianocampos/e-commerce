-- =============================================
-- AGREGAR TIKTOK A REDES SOCIALES
-- Ejecutar en el SQL Editor de Supabase
-- =============================================

ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS tiktok_url TEXT DEFAULT '';
