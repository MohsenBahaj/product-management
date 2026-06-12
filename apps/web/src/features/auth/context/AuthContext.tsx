import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User } from '@/shared/types';
import { storage } from '@/core/utils/storage';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/core/constants';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setUser: (user: User) => void;
}

const AuthCtx = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: !!storage.get(ACCESS_TOKEN_KEY),
  });

  const setAuth = useCallback((user: User, accessToken: string, refreshToken: string) => {
    storage.set(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) storage.set(REFRESH_TOKEN_KEY, refreshToken);
    setState({ user, isAuthenticated: true });
  }, []);

  const clearAuth = useCallback(() => {
    storage.remove(ACCESS_TOKEN_KEY);
    storage.remove(REFRESH_TOKEN_KEY);
    setState({ user: null, isAuthenticated: false });
  }, []);

  const setUser = useCallback((user: User) => {
    setState((prev) => ({ ...prev, user }));
  }, []);

  return (
    <AuthCtx.Provider value={{ ...state, setAuth, clearAuth, setUser }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
