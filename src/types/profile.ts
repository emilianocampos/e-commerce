export interface Profile {
  id: string;
  email: string;
  role: 'admin' | 'user';
  nombre?: string | null;
  apellido?: string | null;
  dni?: string | null;
  telefono?: string | null;
  calle?: string | null;
  numero?: string | null;
  piso?: string | null;
  departamento?: string | null;
  ciudad?: string | null;
  provincia?: string | null;
  codigo_postal?: string | null;
  referencias?: string | null;
  created_at: string;
}
