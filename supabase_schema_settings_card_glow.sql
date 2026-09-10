-- =============================================
-- MIGRACIÓN PARA COLOR DE DEGRADÉ / GLOW EN CARDS
-- Ejecutar en el SQL Editor de Supabase
-- =============================================

ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS card_glow_color TEXT DEFAULT '#10b981';
