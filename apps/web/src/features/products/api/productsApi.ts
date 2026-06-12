import { apiClient } from '@/core/api/client';
import type { Product, PaginatedProducts, ProductFilters } from '@/shared/types';

export const productsApi = {
  getAll: (params: ProductFilters) =>
    apiClient.get<PaginatedProducts>('/products', { params }).then((r) => r.data),

  getOne: (id: string) =>
    apiClient.get<{ product: Product }>(`/products/${id}`).then((r) => r.data.product),

  create: (form: FormData) =>
    apiClient.post<{ product: Product }>('/products', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data.product),

  update: (id: string, form: FormData) =>
    apiClient.patch<{ product: Product }>(`/products/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data.product),

  delete: (id: string) => apiClient.delete(`/products/${id}`),
};
