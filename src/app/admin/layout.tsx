import { requireAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminNavigation } from '@/components/AdminNavigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdmin();
  } catch (error) {
    redirect('/login');
  }

  return <AdminNavigation>{children}</AdminNavigation>;
}
