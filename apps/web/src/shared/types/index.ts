export interface User {
  id: string;
  name: string;
  email: string;
  profile_image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  image_url: string | null;
  thumbnail_image_url: string | null;
  price: number;
  quantity: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  category_name: string | null;
  images?: ProductImage[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedProducts {
  data: Product[];
  pagination: Pagination;
}

export interface SearchHistoryItem {
  id: string;
  search_term: string;
  searched_at: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  minQuantity?: number | string;
  maxQuantity?: number | string;
  sortBy?: 'created_at' | 'price' | 'name' | 'quantity';
  order?: 'asc' | 'desc';
  featured?: 'true';
  page?: number;
  limit?: number;
}

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  error?: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
  message?: string;
}
