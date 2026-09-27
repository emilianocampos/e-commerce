export interface Profile {
  id: string;
  email: string;
  role: 'admin' | 'user';
  full_name?: string | null;
  phone?: string | null;
  telefono?: string | null;
  nombre?: string | null;
  apellido?: string | null;
  dni?: string | null;
  address?: string | null;
  calle?: string | null;
  numero?: string | null;
  piso?: string | null;
  departamento?: string | null;
  ciudad?: string | null;
  localidad?: string | null;
  provincia?: string | null;
  codigo_postal?: string | null;
  postal_code?: string | null;
  referencias?: string | null;
  shipping_quote_required?: boolean;
  created_at: string;
}
