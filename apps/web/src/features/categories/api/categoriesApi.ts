import { apiClient } from '@/core/api/client';
import type { Category } from '@/shared/types';

export const categoriesApi = {
  getAll: () =>
    apiClient.get<{ categories: Category[] }>('/categories').then((r) => r.data.categories),

  getOne: (id: string) =>
    apiClient.get<{ category: Category }>(`/categories/${id}`).then((r) => r.data.category),

  create: (form: FormData) =>
    apiClient.post<{ category: Category }>('/categories', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data.category),

  update: (id: string, form: FormData) =>
    apiClient.patch<{ category: Category }>(`/categories/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data.category),

  delete: (id: string) => apiClient.delete(`/categories/${id}`),
};
