export interface Profile {
  id: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
}
