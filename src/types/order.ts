export type OrderStatus = 'pending' | 'paid' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';

export interface ShippingAddress {
  id: string;
  profile_id: string;
  nombre: string | null;
  apellido: string | null;
  dni: string | null;
  telefono: string | null;
  email: string | null;
  provincia: string | null;
  ciudad: string | null;
  codigo_postal: string | null;
  direccion: string | null;
  numero: string | null;
  piso: string | null;
  departamento: string | null;
  observaciones: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  selected_size: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: number;
  user_id: string;
  status: OrderStatus;
  total: number;
  payment_id: string | null;
  preference_id: string | null;
  tracking_number: string | null;
  shipping_company: string | null;
  created_at: string;
  
  // Nuevos campos v2
  payment_status?: string;
  shipping_status?: string;
  notes?: string | null;
  shipping_address_id?: string | null;
  
  // Relaciones Opcionales
  shipping_address?: ShippingAddress | null;
  items?: OrderItem[];
  user?: {
    email: string;
    nombre: string | null;
    apellido: string | null;
    dni: string | null;
    telefono: string | null;
    calle: string | null;
    numero: string | null;
    piso: string | null;
    departamento: string | null;
    ciudad: string | null;
    provincia: string | null;
    codigo_postal: string | null;
    referencias: string | null;
  };
}
