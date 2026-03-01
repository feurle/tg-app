import {useTranslation} from 'react-i18next'
import type {ArticleResponse} from '../types/article'
import './ArticleCard.css'

interface Props {
    article: ArticleResponse
}

export default function ArticleCard({article}: Props) {
    const {t} = useTranslation(['home', 'common'])

    function formatDate(iso: string | null): string {
        if (!iso) return ''
        return new Date(iso).toLocaleDateString('de-CH', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }

    return (
        <article className="article-card">
            {/* Header */}
            <div className="article-card-header">
                <h3 className="article-card-title">{article.title}</h3>
                {article.publishedDate && (
                    <time className="article-card-date">{formatDate(article.publishedDate)}</time>
                )}
            </div>

            {/* Content */}
            <p className="article-card-content">{article.content}</p>

            {/* Images */}
            {article.images.length > 0 && (
                <div className="article-card-images">
                    <div className="article-card-images-grid">
                        {article.images.slice(0, 3).map((image) => (
                            <img
                                key={image.id}
                                src={`/api/webcontent/images/${image.id}/download`}
                                alt={image.fileName}
                                className="article-card-image"
                            />
                        ))}
                        {article.images.length > 3 && (
                            <div className="article-card-image-more">
                                +{article.images.length - 3}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="article-card-footer">
                <div>
                    {article.state === 'PUBLISHED' && (
                        <span className="article-card-badge article-card-badge-published">{t('common:states.published')}</span>
                    )}
                    {article.state === 'CREATED' && (
                        <span className="article-card-badge article-card-badge-draft">{t('common:states.draft')}</span>
                    )}
                </div>
                {article.publishedDate && (
                    <time className="article-card-date">{formatDate(article.publishedDate)}</time>
                )}
                <a href="#" className="article-card-read-link">
                    {t('readMore')} →
                </a>
            </div>
        </article>
    )
}
