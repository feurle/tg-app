import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import { articleApi } from '../../features/webcontent/api';
import type { ArticleResponse, Language } from '../../features/webcontent/types';
import ImprintPage from './ImprintPage';

vi.mock('../../features/webcontent/api', () => ({
    articleApi: { getPublishedByPage: vi.fn() },
    imageApi: { getDownloadUrl: vi.fn() },
}));

const germanArticle = {
    id: 500,
    order: 1,
    title: 'Impressum',
    content: 'Pflichtangaben gemäß § 5 ECG (E-Commerce-Gesetz) und § 25 MedienG.',
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

describe('ImprintPage', () => {
    it('shows the German imprint with a notice when there is no translation', async () => {
        await i18n.changeLanguage('sv');
        render(<ImprintPage />);

        expect(await screen.findByText('Pflichtangaben gemäß § 5 ECG (E-Commerce-Gesetz) und § 25 MedienG.')).not.toBeNull();
        expect(
            screen.getByText('Det här innehållet finns ännu inte på ditt språk och visas på tyska.'),
        ).not.toBeNull();
    });
});
