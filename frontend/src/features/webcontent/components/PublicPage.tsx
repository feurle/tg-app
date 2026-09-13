import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { articleApi } from '../api';
import type { ArticleResponse } from '../types';
import { resolveLanguage } from '../language';
import HeroComponent from './HeroComponent';
import Col3Component from './Col3Component';
import Col4Component from './Col4Component';
import ArticleBlock from './ArticleBlock';
import ContactButton from './ContactButton';
import PageSkeleton from '../../../components/PageSkeleton';

interface Props {
    pageSlug: string;
}

export default function PublicPage({ pageSlug }: Props) {
    const [articles, setArticles] = useState<ArticleResponse[]>([]);
    const [fetchedLanguage, setFetchedLanguage] = useState<string | null>(null);
    const { t, i18n: i18nInstance } = useTranslation();
    const language = resolveLanguage(i18nInstance.language);
    const loading = fetchedLanguage !== language;

    useEffect(() => {
        let cancelled = false;
        articleApi.getPublishedByPage(pageSlug, language)
            .then((data) => {
                if (!cancelled) {
                    setArticles(data);
                    setFetchedLanguage(language);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setArticles([]);
                    setFetchedLanguage(language);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [pageSlug, language]);

    return (
        <div style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 72px)' }}>
            {loading && <PageSkeleton />}
            {!loading && articles.map((article) => {
                if (article.articleType === 'HERO') return <HeroComponent key={article.id} article={article} />;
                if (article.articleType === 'COL3') return <Col3Component key={article.id} article={article} />;
                if (article.articleType === 'COL4') return <Col4Component key={article.id} article={article} />;
                if (article.articleType === 'TEXT') return <ArticleBlock key={article.id} article={article} />;
                return null;
            })}
            {!loading && (
                <div className="cta-section">
                    <p className="cta-tagline">{t('home.contact.sub')}</p>
                    <ContactButton />
                </div>
            )}
        </div>
    );
}
