export type ProductType = 'SUPPLEMENT' | 'CLOTHES' | 'ACCESSORY';
export type GenderType = 'MEN' | 'WOMEN' | 'UNISEX';

export interface Brand {
  id: string;
  name: string;
  logo: string | null;
  active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  order: number;
  active: boolean;
  created_at: string;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  order: number;
  active: boolean;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  order: number;
  alt: string | null;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  color: string | null;
  stock: number;
  sku: string | null;
}

export interface SupplementInfo {
  product_id: string;
  servings: number | null;
  grams: number | null;
  flavor: string | null;
  net_weight: number | null;
  ingredients: string | null;
  nutrition: any | null; // JSONB
  warnings: string | null;
  entrada?: number | null;
  salida?: number | null;
}

export interface Product {
  // Campos Clásicos (Compatibilidad)
  id: string;
  title: string;
  description: string | null;
  price: number;
  stock: number;
  image: string | null;
  category: string | null;
  sizes?: string[]; 
  created_at: string;
  
  // Nuevos campos v2
  slug?: string | null;
  sale_price?: number | null;
  sku?: string | null;
  barcode?: string | null;
  brand_id?: string | null;
  category_id?: string | null;
  subcategory_id?: string | null;
  gender?: GenderType | null;
  type?: ProductType | null;
  urbano_category?: GenderType | null;
  featured?: boolean;
  new?: boolean;
  active?: boolean;
  weight?: number | null;
  updated_at?: string | null;

  // Relaciones (opcionales para no romper queries actuales)
  brands?: Brand | null;
  categories?: Category | null;
  subcategories?: Subcategory | null;
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
  supplement_information?: SupplementInfo | null;
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedColor?: string;
  quantity: number;
}
