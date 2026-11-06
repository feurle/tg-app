import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { ArticleResponse } from '../types';
import NewsRow from './NewsRow';

afterEach(cleanup);

const article: ArticleResponse = {
    id: 1,
    order: 0,
    title: 'Neue Sprechzeiten',
    content: '<p>Ab November gelten neue Sprechzeiten.</p>',
    sections: [],
    state: 'PUBLISHED',
    articleType: 'DEFAULT',
    language: 'GERMAN',
    publishedDate: '2026-10-25T10:00:00',
    images: [],
    tags: [],
    createdAt: '2026-10-01T10:00:00',
    updatedAt: '2026-10-25T10:00:00',
    pageId: '1',
};

describe('NewsRow', () => {
    it('shows title, excerpt and read link but no date', () => {
        const { container } = render(<NewsRow article={article} onClick={() => {}} />);

        expect(screen.getByRole('heading', { name: 'Neue Sprechzeiten' })).not.toBeNull();
        expect(screen.getByText('Ab November gelten neue Sprechzeiten.')).not.toBeNull();
        expect(screen.getByText('Lesen')).not.toBeNull();
        expect(container.textContent).not.toMatch(/2026/);
    });
});
