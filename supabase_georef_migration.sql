-- =============================================
-- MIGRACIÓN DE BASE DE DATOS: GeoRef & Envíos
-- Ejecutar en el SQL Editor de Supabase.
-- =============================================

-- 1. Agregar campos de GeoRef y cotización de envío a la tabla profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS provincia TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS localidad TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS shipping_quote_required BOOLEAN DEFAULT false;

-- 2. Agregar el campo de requerimiento de cotización a la tabla orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_quote_required BOOLEAN DEFAULT false;
