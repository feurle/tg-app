import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import { articleApi } from '../../features/webcontent/api';
import type { ArticleResponse, SectionResponse } from '../../features/webcontent/types';
import { resolveLanguage } from '../../features/webcontent/language';
import Col2Component from '../../features/webcontent/components/Col2Component';
import HeroComponent from '../../features/webcontent/components/HeroComponent';
import Col3Component from '../../features/webcontent/components/Col3Component';
import Col4Component from '../../features/webcontent/components/Col4Component';
import ContactButton from '../../features/webcontent/components/ContactButton';
import PageSkeleton from '../../components/PageSkeleton';

function AboutTextBlock({ article }: { article: ArticleResponse }) {
    const sorted = [...article.sections].sort((a: SectionResponse, b: SectionResponse) => a.order - b.order);
    return (
        <div className="about-text-block">
            {article.tags.length > 0 && (
                <div className="about-text-tags">
                    {article.tags.map(tag => (
                        <span key={tag.id} className="badge badge-green">{tag.name}</span>
                    ))}
                </div>
            )}
            {article.title && (
                <h2 className="about-text-title">{article.title}</h2>
            )}
            {article.content && (
                <div
                    className="article-content about-text-content"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
                />
            )}
            {sorted.map(section => (
                <div key={section.id} className="about-text-section">
                    {section.title && (
                        <h3 className="about-text-section-title">{section.title}</h3>
                    )}
                    {section.content && (
                        <div
                            className="article-content about-text-section-content"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.content) }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}

export default function AboutPage() {
    const [articles, setArticles] = useState<ArticleResponse[]>([]);
    const [fetchedLanguage, setFetchedLanguage] = useState<string | null>(null);
    const { i18n: i18nInstance } = useTranslation();
    const language = resolveLanguage(i18nInstance.language);
    const loading = fetchedLanguage !== language;

    useEffect(() => {
        let cancelled = false;
        articleApi.getPublishedByPage('about', language)
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
        return () => { cancelled = true; };
    }, [language]);

    return (
        <div className="about-page">
            <div className="about-feed">
                {loading && <PageSkeleton />}
                {!loading && articles.map((article) => {
                    if (article.articleType === 'COL2') return <Col2Component key={article.id} article={article} />;
                    if (article.articleType === 'HERO') return <HeroComponent key={article.id} article={article} />;
                    if (article.articleType === 'COL3') return <Col3Component key={article.id} article={article} />;
                    if (article.articleType === 'COL4') return <Col4Component key={article.id} article={article} />;
                    if (article.articleType === 'TEXT') return <AboutTextBlock key={article.id} article={article} />;
                    return null;
                })}
            </div>
            <div className="cta-section">
                <ContactButton />
            </div>
        </div>
    );
}
