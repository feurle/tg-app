import { useEffect, useState } from 'react';
import apiClient from '../../lib/apiClient';

export interface AuthUser {
  username: string;
  roles: string[];
}

interface MeResponse {
  login: string;
  authorities: string[];
}

let _user: AuthUser | null = null;
let _loading = true;
const _listeners = new Set<() => void>();

function notify() {
  _listeners.forEach((l) => l());
}

export const authStore = {
  getUser: () => _user,
  isAuthenticated: () => _user !== null,
  isLoading: () => _loading,

  login(user: AuthUser) {
    _user = user;
    notify();
  },

  logout() {
    _user = null;
    notify();
  },

  subscribe(listener: () => void) {
    _listeners.add(listener);
    return () => _listeners.delete(listener);
  },

  async init() {
    try {
      const data = await apiClient.get<MeResponse | undefined>('/api/auth/me');
      _user = data ? { username: data.login, roles: data.authorities } : null;
    } catch {
      _user = null;
    } finally {
      _loading = false;
      notify();
    }
  },
};

/** React Hook für Auth-State */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(authStore.getUser());
  const [isLoading, setIsLoading] = useState(authStore.isLoading());

  useEffect(() => {
    const unsub = authStore.subscribe(() => {
      setUser(authStore.getUser());
      setIsLoading(authStore.isLoading());
    });
    return () => { unsub(); };
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login: (user: AuthUser) => authStore.login(user),
    logout: authStore.logout.bind(authStore),
  };
}
