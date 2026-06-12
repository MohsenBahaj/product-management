import { apiClient } from '@/core/api/client';
import type { AuthResponse, User } from '@/shared/types';

interface LoginPayload { email: string; password: string }
interface RegisterPayload { name: string; email: string; password: string }
interface BackendAuthResponse { user: User; token: string }

export const authApi = {
  login: async (data: LoginPayload): Promise<AuthResponse> => {
    const r = await apiClient.post<BackendAuthResponse>('/auth/login', data);
    return { user: r.data.user, accessToken: r.data.token, refreshToken: '' };
  },

  register: async (data: RegisterPayload): Promise<AuthResponse> => {
    const r = await apiClient.post<BackendAuthResponse>('/auth/register', data);
    return { user: r.data.user, accessToken: r.data.token, refreshToken: '' };
  },

  logout: () =>
    apiClient.post('/auth/logout'),

  refresh: (refreshToken: string) =>
    apiClient.post<{ accessToken: string }>('/auth/refresh', { refreshToken }).then((r) => r.data),
};
