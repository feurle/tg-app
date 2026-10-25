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
 * Last loaded result per page and language. Coming back to a page renders it at full height right
 * away, so the router can restore the scroll position (the loading skeleton is much shorter). The
 * articles are still fetched again on every mount, so changes made in the CMS show up.
 */
const cache = new Map<string, Loaded>();

/**
 * Published articles of a CMS page in the visitor's language. If the page has no content in that
 * language yet, the German articles are returned and `fallback` is set, so a page is never empty
 * just because it has not been translated.
 */
export function usePublishedArticles(slug: string): PublishedArticles {
    const { i18n } = useTranslation();
    const language = resolveLanguage(i18n.language);
    const key = `${slug}:${language}`;
    const [loaded, setLoaded] = useState<Loaded | null>(null);

    useEffect(() => {
        let cancelled = false;
        const done = (articles: ArticleResponse[], fallback: boolean) => {
            if (cancelled) return;
            const result = { slug, language, articles, fallback };
            cache.set(key, result);
            setLoaded(result);
        };

        articleApi
            .getPublishedByPage(slug, language)
            .then(async (articles) => {
                if (articles.length > 0 || language === DEFAULT_LANGUAGE) return done(articles, false);
                const german = await articleApi.getPublishedByPage(slug, DEFAULT_LANGUAGE);
                done(german, german.length > 0);
            })
            .catch(() => {
                // A failed refresh keeps what is cached; a failure is never cached itself.
                if (!cancelled && !cache.has(key)) setLoaded({ slug, language, articles: [], fallback: false });
            });

        return () => {
            cancelled = true;
        };
    }, [slug, language, key]);

    const fresh = loaded !== null && loaded.slug === slug && loaded.language === language ? loaded : null;
    const current = fresh ?? cache.get(key) ?? null;
    return {
        articles: current?.articles ?? [],
        loading: current === null,
        fallback: current?.fallback ?? false,
    };
}
