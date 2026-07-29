import { getStoreSettings } from '@/actions/settings';
import { PersonalizeForm } from './PersonalizeForm';

export const metadata = {
  title: 'Personalizar Web | Panel de Administración',
};

export default async function CustomizeWebPage() {
  const settings = await getStoreSettings();

  const defaultSettings = {
    top_banner_text: 'Sign up and get 20% off to your first order.',
    store_logo_text: 'DRAVENIX',
    hero_title: 'ENCUENTRA LO\nQUE COMBINA CON\nTU ESTILO',
    hero_subtitle: 'Explora nuestra diversa gama de productos cuidadosamente seleccionados, diseñados para resaltar tu individualidad y adaptarse a tu estilo de vida.',
    stats_1_number: '200+',
    stats_1_label: 'Marcas Internacionales',
    stats_2_number: '2,000+',
    stats_2_label: 'Productos de Alta Calidad',
    stats_3_number: '30,000+',
    stats_3_label: 'Clientes Felices',
    style_1_title: 'Hombre',
    style_1_link: '/shop?gender=MEN',
    style_2_title: 'Mujer',
    style_2_link: '/shop?gender=WOMEN',
    style_3_title: 'Urbano',
    style_3_link: '/shop?category_name=urbano',
    style_4_title: '',
    style_4_link: '',
  };

  const finalSettings = settings || defaultSettings;

  return (
    <PersonalizeForm initialSettings={finalSettings} />
  );
}
