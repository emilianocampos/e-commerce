-- ==============================================================================
-- MIGRACIÓN PARA SUPABASE: Soporte de 'COMBO' y Corrección de Sabores / Stock
-- ==============================================================================

-- 1. Agregar el valor 'COMBO' al enum product_type (si no existe)
ALTER TYPE product_type ADD VALUE IF NOT EXISTS 'COMBO';

-- 2. Asegurar que la tabla supplement_information tenga las columnas entrada y salida
--    (Estas columnas faltaban en la BD y provocaban el error 400 PGRST204 que impedía guardar los sabores)
ALTER TABLE public.supplement_information ADD COLUMN IF NOT EXISTS entrada INTEGER;
ALTER TABLE public.supplement_information ADD COLUMN IF NOT EXISTS salida INTEGER;

-- 3. Confirmar que la política RLS permita a los administradores gestionar supplement_information
DROP POLICY IF EXISTS "Admins can manage supplement info" ON public.supplement_information;
CREATE POLICY "Admins can manage supplement info" 
ON public.supplement_information 
FOR ALL 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' )
WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- 4. Permitir lectura pública de la información de suplementos a cualquier visitante
DROP POLICY IF EXISTS "Anyone can view supplement info" ON public.supplement_information;
CREATE POLICY "Anyone can view supplement info" 
ON public.supplement_information 
FOR SELECT 
USING (true);

-- 5. Agregar columna combo_items en la tabla products para almacenar los productos incluidos en los combos
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS combo_items JSONB;

