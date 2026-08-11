import { getUserProfile } from '@/actions/profile';
import { redirect } from 'next/navigation';
import { ProfileForm } from './ProfileForm';

export const metadata = {
  title: 'Mi Perfil | DRAVENIX',
  description: 'Gestioná tus datos personales y dirección de envío en DRAVENIX.',
};

export default async function PerfilPage() {
  const profile = await getUserProfile();

  if (!profile) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <ProfileForm initialProfile={profile} />
    </div>
  );
}
