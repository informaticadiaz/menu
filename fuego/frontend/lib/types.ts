export interface MenuItem {
  id: number;
  restaurant_id: number;
  name: string;
  category: string;
  description: string | null;
  price: number;
  image_url: string | null;
  available: boolean | number;
  created_at?: string;
  updated_at?: string;
}

export interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  palette_id: string;
  status: string;
}

export interface SystemRestaurant {
  id: number;
  name: string;
  slug: string;
  status: 'active' | 'paused';
  created_at: string;
  admin_email: string | null;
}
