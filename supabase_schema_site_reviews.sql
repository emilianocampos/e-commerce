-- =============================================
-- TABLA DE RESEÑAS DE LA TIENDA (SITE REVIEWS)
-- Ejecutar en el SQL Editor de Supabase
-- =============================================

CREATE TABLE IF NOT EXISTS public.site_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Políticas de seguridad (RLS)
ALTER TABLE public.site_reviews ENABLE ROW LEVEL SECURITY;

-- Todos pueden leer las reseñas
CREATE POLICY "Public profiles are viewable by everyone." 
  ON public.site_reviews FOR SELECT 
  USING (true);

-- Solo los usuarios autenticados pueden crear reseñas
CREATE POLICY "Users can insert their own reviews." 
  ON public.site_reviews FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Opcional: permitir a los usuarios editar/eliminar sus propias reseñas
CREATE POLICY "Users can update their own reviews." 
  ON public.site_reviews FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews." 
  ON public.site_reviews FOR DELETE 
  USING (auth.uid() = user_id);
