-- =========================================================================
-- SISTEMA DE TARJETAS DE CLIENTES VIP DE KLONFARK
-- Ejecutar en el SQL Editor del panel de Supabase
-- =========================================================================

-- 1. Crear tabla de Tarjetas VIP
CREATE TABLE IF NOT EXISTS public.vip_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_number TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  discount_percentage NUMERIC NOT NULL DEFAULT 10,
  active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar RLS en vip_cards
ALTER TABLE public.vip_cards ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de seguridad para vip_cards
-- Los administradores tienen control total (SELECT, INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Admins can manage vip_cards" ON public.vip_cards;
CREATE POLICY "Admins can manage vip_cards" 
ON public.vip_cards 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- Cualquier usuario o visitante puede validar una tarjeta VIP activa
DROP POLICY IF EXISTS "Anyone can validate active vip_cards" ON public.vip_cards;
CREATE POLICY "Anyone can validate active vip_cards" 
ON public.vip_cards FOR SELECT 
USING ( active = true );

-- 4. Agregar columnas de configuración VIP a la tabla de productos (products)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS vip_discount_percentage NUMERIC DEFAULT NULL,
ADD COLUMN IF NOT EXISTS vip_stackable BOOLEAN DEFAULT true;

-- 5. Agregar columnas de desglose a la tabla de pedidos (orders)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS vip_card_code TEXT,
ADD COLUMN IF NOT EXISTS vip_discount_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS promo_discount_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS subtotal_amount NUMERIC DEFAULT 0;

-- 6. Agregar configuración de descuento por transferencia por defecto en store_settings
ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS transfer_discount_percentage NUMERIC DEFAULT 10;

-- 7. Insertar algunas tarjetas VIP de prueba (opcional/seguro con ON CONFLICT)
INSERT INTO public.vip_cards (card_number, client_name, client_email, discount_percentage, active, notes)
VALUES 
  ('VIP-1001', 'Cliente VIP Oro', 'vip.oro@klonfark.com', 15, true, 'Tarjeta VIP Nivel Oro'),
  ('VIP-2002', 'Cliente VIP Plata', 'vip.plata@klonfark.com', 10, true, 'Tarjeta VIP Nivel Plata')
ON CONFLICT (card_number) DO NOTHING;
