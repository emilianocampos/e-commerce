-- =============================================
-- ACTUALIZACIÓN DE TABLA DE CONFIGURACIÓN DE TIENDA (STORE SETTINGS)
-- Añadir campos para código de descuento
-- Ejecutar en el SQL Editor de Supabase
-- =============================================

ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS discount_code TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC DEFAULT 0;
