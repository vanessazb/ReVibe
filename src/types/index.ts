export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  role: 'buyer' | 'seller' | 'admin';
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  gender: 'mujer' | 'hombre' | 'unisex';
  name: string;
  slug: string;
}

export interface Garment {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  category_id: number | null;
  brand: string | null;
  size: string | null;
  condition: 'nuevo_con_etiqueta' | 'como_nuevo' | 'buen_estado' | 'uso_visible' | null;
  price: number;
  status: 'disponible' | 'vendida' | 'pausada' | 'en_revision';
  images: string[];
  images_processed: boolean;
  ai_suggested_size: string | null;
  vibe: string | null;
  created_at: string;
  updated_at: string;
  seller?: Profile;
  category?: Category;
}

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  garment_id: string;
  total_amount: number;
  status: 'pendiente' | 'confirmada' | 'enviada' | 'entregada' | 'cancelada';
  shipping_address: ShippingAddress | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  buyer?: Profile;
  seller?: Profile;
  garment?: Garment;
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  address: string;
  city: string;
  neighborhood: string;
  notes?: string;
}

export interface CartItem {
  id: string;
  buyer_id: string;
  garment_id: string;
  added_at: string;
  garment?: Garment;
}

export interface Favorite {
  id: string;
  user_id: string;
  garment_id: string;
  created_at: string;
  garment?: Garment;
}
