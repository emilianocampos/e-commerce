export interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  stock: number;
  image: string | null;
  category: string | null;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
