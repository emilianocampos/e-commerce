-- =============================================
-- ACTUALIZACIÓN DE TABLA DE CONFIGURACIÓN DE TIENDA (STORE SETTINGS)
-- Añadir soporte para múltiples códigos de descuento (JSONB)
-- Ejecutar en el SQL Editor de Supabase
-- =============================================

ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS discount_codes JSONB DEFAULT '[]'::jsonb;
