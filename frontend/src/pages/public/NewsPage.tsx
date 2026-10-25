import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ArticleResponse } from '../../features/webcontent/types';
import { usePublishedArticles } from '../../features/webcontent/usePublishedArticles';
import NewsRow from '../../features/webcontent/components/NewsRow';
import ArticleDetailModal from '../../features/webcontent/components/ArticleDetailModal';
import PageBlocks from '../../features/webcontent/components/PageBlocks';
import PageSkeleton from '../../components/PageSkeleton';

export default function NewsPage() {
    const { articles: published, loading, fallback } = usePublishedArticles('news');
    // CTA articles are blocks of the page, everything else is a news entry.
    const articles = published.filter((article) => article.articleType !== 'CTA');
    const ctas = published.filter((article) => article.articleType === 'CTA');
    const [selected, setSelected] = useState<ArticleResponse | null>(null);
    const { t } = useTranslation();

    return (
        <div style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 72px)' }}>
            <div className="news-feed">
                {loading && <PageSkeleton />}
                {!loading && (
                    <>
                        {fallback && <p className="language-fallback">{t('pages.fallbackNotice')}</p>}
                        <header className="public-page-header">
                            <h1 className="public-page-title">{t('pages.news')}</h1>
                            <p className="public-page-subtitle">{t('news.subtitle')}</p>
                        </header>
                        <div className="news-list">
                            {articles.map((article) => (
                                <NewsRow
                                    key={article.id}
                                    article={article}
                                    onClick={() => setSelected(article)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
            {selected && (
                <ArticleDetailModal article={selected} onClose={() => setSelected(null)} />
            )}
            <PageBlocks articles={ctas} />
        </div>
    );
}
