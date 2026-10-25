import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { articleApi } from './api';
import type { ArticleResponse } from './types';
import { usePublishedArticles } from './usePublishedArticles';

vi.mock('./api', () => ({ articleApi: { getPublishedByPage: vi.fn() } }));

const getPublishedByPage = vi.mocked(articleApi.getPublishedByPage);
const articles = (...ids: number[]) => ids.map((id) => ({ id })) as unknown as ArticleResponse[];

afterEach(() => {
    cleanup();
    vi.resetAllMocks();
});

describe('usePublishedArticles', () => {
    it('is loading on the first visit and has the articles afterwards', async () => {
        getPublishedByPage.mockResolvedValue(articles(1));
        const { result } = renderHook(() => usePublishedArticles('first-visit'));

        expect(result.current.loading).toBe(true);
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.articles).toEqual(articles(1));
    });

    it('returns the cached articles right away on a repeat visit and refreshes them', async () => {
        getPublishedByPage.mockResolvedValue(articles(1));
        const first = renderHook(() => usePublishedArticles('repeat-visit'));
        await waitFor(() => expect(first.result.current.loading).toBe(false));
        first.unmount();

        getPublishedByPage.mockResolvedValue(articles(1, 2));
        const { result } = renderHook(() => usePublishedArticles('repeat-visit'));

        expect(result.current.loading).toBe(false);
        expect(result.current.articles).toEqual(articles(1));
        await waitFor(() => expect(result.current.articles).toEqual(articles(1, 2)));
    });

    it('keeps the cached articles when the refresh fails', async () => {
        getPublishedByPage.mockResolvedValue(articles(1));
        const first = renderHook(() => usePublishedArticles('failed-refresh'));
        await waitFor(() => expect(first.result.current.loading).toBe(false));
        first.unmount();

        getPublishedByPage.mockRejectedValue(new Error('offline'));
        const { result } = renderHook(() => usePublishedArticles('failed-refresh'));
        await waitFor(() => expect(getPublishedByPage).toHaveBeenCalledTimes(2));

        expect(result.current.articles).toEqual(articles(1));
    });

    it('does not cache a failed first load', async () => {
        getPublishedByPage.mockRejectedValue(new Error('offline'));
        const first = renderHook(() => usePublishedArticles('failed-first'));
        await waitFor(() => expect(first.result.current.loading).toBe(false));
        first.unmount();

        getPublishedByPage.mockResolvedValue(articles(3));
        const { result } = renderHook(() => usePublishedArticles('failed-first'));

        expect(result.current.loading).toBe(true);
        await waitFor(() => expect(result.current.articles).toEqual(articles(3)));
    });
});
