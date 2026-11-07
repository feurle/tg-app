import { act, cleanup, render, screen } from '@testing-library/react';
import { useLayoutEffect } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { authStore, useAuth } from './authStore';

function AuthState() {
    const { isAuthenticated } = useAuth();
    return <span>{isAuthenticated ? 'logged in' : 'logged out'}</span>;
}

/** Changes the store after the first render but before useAuth's passive effects run. */
function LogInDuringCommit() {
    useLayoutEffect(() => {
        authStore.login({ username: 'admin', roles: ['ROLE_ADMIN'] });
    }, []);
    return null;
}

afterEach(() => {
    cleanup();
    act(() => authStore.logout());
});

describe('useAuth', () => {
    it('follows changes of the store', () => {
        render(<AuthState />);
        expect(screen.getByText('logged out')).toBeTruthy();

        act(() => authStore.login({ username: 'admin', roles: ['ROLE_ADMIN'] }));
        expect(screen.getByText('logged in')).toBeTruthy();
    });

    it('does not miss a change between render and subscription', () => {
        // On a reload of a lazily loaded admin route, /api/auth/me can answer in exactly this
        // window. A missed update left ProtectedRoute loading forever, so the page stayed blank (#151).
        render(
            <>
                <AuthState />
                <LogInDuringCommit />
            </>,
        );
        expect(screen.getByText('logged in')).toBeTruthy();
    });
});
