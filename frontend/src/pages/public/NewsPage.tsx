import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ArticleResponse } from '../../features/webcontent/types';
import { usePublishedArticles } from '../../features/webcontent/usePublishedArticles';
import NewsRow from '../../features/webcontent/components/NewsRow';
import ArticleDetailModal from '../../features/webcontent/components/ArticleDetailModal';
import ContactButton from '../../features/webcontent/components/ContactButton';
import PageSkeleton from '../../components/PageSkeleton';

export default function NewsPage() {
    const { articles, loading, fallback } = usePublishedArticles('news');
    const [selected, setSelected] = useState<ArticleResponse | null>(null);
    const { t } = useTranslation();

    return (
        <div style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 72px)' }}>
            <div className="news-feed">
                {loading && <PageSkeleton />}
                {!loading && (
                    <>
                        {fallback && <p className="language-fallback">{t('pages.fallbackNotice')}</p>}
                        <header className="news-page-header">
                            <p className="news-page-eyebrow">{t('nav.news')}</p>
                            <h1 className="news-page-title">{t('pages.news')}</h1>
                            <p className="news-page-sub">{t('news.subtitle')}</p>
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
            <div className="cta-section">
                <ContactButton />
            </div>
        </div>
    );
}
