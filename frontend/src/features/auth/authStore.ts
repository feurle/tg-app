import { useSyncExternalStore } from 'react';
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

/** Immutable, replaced on every change, so useSyncExternalStore can compare it by reference. */
let _snapshot: { user: AuthUser | null; isLoading: boolean } = { user: _user, isLoading: _loading };

function notify() {
  _snapshot = { user: _user, isLoading: _loading };
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
    return () => { _listeners.delete(listener); };
  },

  getSnapshot: () => _snapshot,

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

/**
 * React Hook für Auth-State. useSyncExternalStore re-checks the snapshot after subscribing, so a
 * change between render and subscription (e.g. /api/auth/me answering while a lazy route mounts)
 * is not lost (#151).
 */
export function useAuth() {
  const { user, isLoading } = useSyncExternalStore(authStore.subscribe, authStore.getSnapshot);

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login: (user: AuthUser) => authStore.login(user),
    logout: authStore.logout.bind(authStore),
  };
}
