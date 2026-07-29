-- =============================================
-- CREACIÓN DE TABLA DE CONFIGURACIÓN DE TIENDA (STORE SETTINGS)
-- Ejecutar en el SQL Editor de Supabase
-- =============================================

CREATE TABLE IF NOT EXISTS public.store_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  
  -- Top Banner
  top_banner_text TEXT DEFAULT 'Sign up and get 20% off to your first order.',
  
  -- Logo
  store_logo_url TEXT,
  store_logo_text TEXT DEFAULT 'DRAVENIX',
  
  -- Hero Section
  hero_title TEXT DEFAULT 'ENCUENTRA LO QUE COMBINA CON TU ESTILO',
  hero_subtitle TEXT DEFAULT 'Explora nuestra diversa gama de productos cuidadosamente seleccionados, diseñados para resaltar tu individualidad y adaptarse a tu estilo de vida.',
  hero_image_url TEXT,
  
  -- Stats
  stats_1_number TEXT DEFAULT '200+',
  stats_1_label TEXT DEFAULT 'Marcas Internacionales',
  stats_2_number TEXT DEFAULT '2,000+',
  stats_2_label TEXT DEFAULT 'Productos de Alta Calidad',
  stats_3_number TEXT DEFAULT '30,000+',
  stats_3_label TEXT DEFAULT 'Clientes Felices',
  
  -- Brands Carousel (JSON array of image URLs)
  brands_images JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Constraint to ensure only one row exists (id must be 1)
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default row if it doesn't exist
INSERT INTO public.store_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Habilitar RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS "Anyone can view store settings" ON public.store_settings;
CREATE POLICY "Anyone can view store settings" ON public.store_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage store settings" ON public.store_settings;
CREATE POLICY "Admins can manage store settings" ON public.store_settings 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );
