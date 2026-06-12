import { apiClient } from '@/core/api/client';
import type { User } from '@/shared/types';

export const profileApi = {
  getMe: () =>
    apiClient.get<{ user: User }>('/users/profile').then((r) => r.data.user),

  updateMe: (data: { name: string }) =>
    apiClient.patch<{ user: User }>('/users/profile', data).then((r) => r.data.user),

  uploadImage: (file: File) => {
    const form = new FormData();
    form.append('image', file);
    return apiClient.post<{ user: User }>('/users/profile-image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data.user);
  },
};
