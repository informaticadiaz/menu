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
