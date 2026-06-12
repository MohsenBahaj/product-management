import { apiClient } from '@/core/api/client';
import type { SearchHistoryItem } from '@/shared/types';

export const searchApi = {
  getHistory: (limit = 20) =>
    apiClient.get<{ history: SearchHistoryItem[] }>('/search-history', { params: { limit } })
      .then((r) => r.data.history),

  clearAll: () => apiClient.delete('/search-history'),
};
