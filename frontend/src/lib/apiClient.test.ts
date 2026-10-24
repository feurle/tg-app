import { afterEach, describe, expect, it, vi } from 'vitest';
import apiClient, { ApiError } from './apiClient';

function mockFetch(response: Response) {
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe('apiClient', () => {
    it('sends JSON, the AJAX header and credentials', async () => {
        const fetchMock = mockFetch(Response.json({ ok: true }));
        await apiClient.post('/api/x', { a: 1 });

        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe('/api/x');
        expect(init.method).toBe('POST');
        expect(init.credentials).toBe('include');
        expect(init.body).toBe('{"a":1}');
        expect(init.headers.get('Content-Type')).toBe('application/json');
        expect(init.headers.get('X-Requested-With')).toBe('XMLHttpRequest');
    });

    it('returns the parsed body', async () => {
        mockFetch(Response.json({ id: 7 }));
        await expect(apiClient.get<{ id: number }>('/api/x')).resolves.toEqual({ id: 7 });
    });

    it('returns undefined for 204 No Content', async () => {
        mockFetch(new Response(null, { status: 204 }));
        await expect(apiClient.delete('/api/x')).resolves.toBeUndefined();
    });

    it('throws an ApiError with the message of a JSON error body', async () => {
        mockFetch(Response.json({ message: 'Nope' }, { status: 400 }));
        const error = await apiClient.get('/api/x').catch((e) => e);
        expect(error).toBeInstanceOf(ApiError);
        expect(error).toMatchObject({ status: 400, message: 'Nope' });
    });

    it('falls back to the plain text body, then the status text', async () => {
        mockFetch(new Response('plain failure', { status: 500 }));
        await expect(apiClient.get('/api/x')).rejects.toMatchObject({ status: 500, message: 'plain failure' });

        mockFetch(new Response('', { status: 404, statusText: 'Not Found' }));
        await expect(apiClient.get('/api/x')).rejects.toMatchObject({ status: 404, message: 'Not Found' });
    });
});
