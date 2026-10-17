import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { articleApi } from './api';
import { DEFAULT_LANGUAGE, resolveLanguage } from './language';
import type { ArticleResponse, Language } from './types';

interface Loaded {
    slug: string;
    language: Language;
    articles: ArticleResponse[];
    fallback: boolean;
}

export interface PublishedArticles {
    articles: ArticleResponse[];
    loading: boolean;
    /** `true` if there is no content in the visitor's language yet and the German content is shown instead. */
    fallback: boolean;
}

/**
 * Published articles of a CMS page in the visitor's language. If the page has no content in that
 * language yet, the German articles are returned and `fallback` is set, so a page is never empty
 * just because it has not been translated.
 */
export function usePublishedArticles(slug: string): PublishedArticles {
    const { i18n } = useTranslation();
    const language = resolveLanguage(i18n.language);
    const [loaded, setLoaded] = useState<Loaded | null>(null);

    useEffect(() => {
        let cancelled = false;
        const done = (articles: ArticleResponse[], fallback: boolean) => {
            if (!cancelled) setLoaded({ slug, language, articles, fallback });
        };

        articleApi
            .getPublishedByPage(slug, language)
            .then(async (articles) => {
                if (articles.length > 0 || language === DEFAULT_LANGUAGE) return done(articles, false);
                const german = await articleApi.getPublishedByPage(slug, DEFAULT_LANGUAGE);
                done(german, german.length > 0);
            })
            .catch(() => done([], false));

        return () => {
            cancelled = true;
        };
    }, [slug, language]);

    const current = loaded !== null && loaded.slug === slug && loaded.language === language;
    return {
        articles: current ? loaded.articles : [],
        loading: !current,
        fallback: current && loaded.fallback,
    };
}
