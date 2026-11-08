import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import { articleApi } from '../../features/webcontent/api';
import type { ArticleResponse, Language } from '../../features/webcontent/types';
import PrivacyPage from './PrivacyPage';

vi.mock('../../features/webcontent/api', () => ({
    articleApi: { getPublishedByPage: vi.fn() },
    imageApi: { getDownloadUrl: vi.fn() },
}));

const germanArticle = {
    id: 400,
    order: 1,
    title: 'Datenschutzerklärung',
    content: 'Diese Datenschutzerklärung informiert Sie über die Verarbeitung Ihrer Daten.',
    sections: [],
    state: 'PUBLISHED',
    articleType: 'TEXT',
    language: 'GERMAN',
    images: [],
    tags: [],
} as unknown as ArticleResponse;

// Only German content is seeded: the API has articles for German and none for any other language.
vi.mocked(articleApi.getPublishedByPage).mockImplementation(async (_slug: string, language?: Language) =>
    language === 'GERMAN' ? [germanArticle] : [],
);

afterEach(async () => {
    cleanup();
    await i18n.changeLanguage('de');
});

describe('PrivacyPage', () => {
    it('shows the German privacy policy with a notice when there is no translation', async () => {
        await i18n.changeLanguage('en');
        render(<PrivacyPage />);

        expect(await screen.findByRole('heading', { level: 2, name: 'Datenschutzerklärung' })).not.toBeNull();
        expect(
            screen.getByText('This content is not available in your language yet and is shown in German.'),
        ).not.toBeNull();
    });
});
