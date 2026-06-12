import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { profileApi } from '../api/profileApi';
import { useAuthContext } from '@/features/auth/context/AuthContext';

export const PROFILE_KEY = ['profile'] as const;

export function useCurrentUser() {
  const { isAuthenticated, setUser } = useAuthContext();

  const query = useQuery({
    queryKey: PROFILE_KEY,
    queryFn: profileApi.getMe,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (query.data) setUser(query.data);
  }, [query.data, setUser]);

  return query;
}
