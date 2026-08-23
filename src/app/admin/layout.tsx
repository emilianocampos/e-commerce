import { requireAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminNavigation } from '@/components/AdminNavigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdmin();
  } catch (error) {
    redirect('/login');
  }

  return (
    <div className="admin-container min-h-screen bg-zinc-50 text-zinc-900 font-sans" data-theme="light">
      <AdminNavigation>{children}</AdminNavigation>
    </div>
  );
}
