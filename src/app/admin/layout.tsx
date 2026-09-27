import { requireAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminNavigation } from '@/components/AdminNavigation';
import { getStoreSettings } from '@/actions/settings';
import { hexToRgb } from '@/lib/utils';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdmin();
  } catch (error) {
    redirect('/login');
  }

  const settings = await getStoreSettings();
  const themeMode = settings?.theme_mode || 'light';
  const cardGlowColor = settings?.card_glow_color || '#10b981';
  const cardGlowRgb = hexToRgb(cardGlowColor);

  return (
    <div 
      className={`admin-container min-h-screen font-sans ${
        themeMode === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-[#f1f4f9] text-slate-900'
      }`}
      data-theme={themeMode}
      style={{
        '--card-glow-color': cardGlowColor,
        '--card-glow-rgb': cardGlowRgb,
        colorScheme: themeMode === 'dark' ? 'dark' : 'light',
      } as React.CSSProperties}
    >
      <AdminNavigation themeMode={themeMode}>{children}</AdminNavigation>
    </div>
  );
}
