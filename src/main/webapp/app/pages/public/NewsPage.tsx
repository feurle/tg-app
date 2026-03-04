import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from '../../config/translation.ts'
import type { ArticleResponse } from '../../types/article.ts'
import { articleService } from '../../services/article.service.ts'
import ArticleCard from '../../components/common/ArticleCard.tsx'
import './NewsPage.css'

export default function NewsPage() {
  const { t } = useTranslation('news')
  const [teaserArticle, setTeaserArticle] = useState<ArticleResponse | null>(null)
  const [articles, setArticles] = useState<ArticleResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Note: i18n.language is checked within effect, not as dependency
    // because i18n doesn't re-render when language changes
    const language = i18n.language.toUpperCase()
    ;(async () => {
      try {
        const [teaser, pageArticles] = await Promise.all([
          articleService.getPublished('NEWS_TEASER', language).catch(() => []),
          articleService.getPublished('NEWS_PAGE', language).catch((err) => {
            throw err
          }),
        ])
        setTeaserArticle(teaser[0] || null)
        setArticles(pageArticles)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load articles'
        setError(message)
      } finally {
        setLoading(false)
      }
    })()
  }, [[i18n.language]])

  return (
    <div className="news-page">
      {/* Hero Section */}
      <section className="news-hero-section">
        <div className="news-hero-background">
          <div className="news-hero-gradient" />
        </div>

        <div className="news-hero-content">
          {/* Hero Content from NEWS_TEASER article or fallback */}
          <h1 className="news-hero-title">
            {teaserArticle ? teaserArticle.title : t('hero.titleFallback')} <span className="news-hero-title-accent">{teaserArticle ? '' : t('hero.accentFallback')}</span>
          </h1>

          <p className="news-hero-subtitle">
            {teaserArticle
              ? teaserArticle.content
              : t('hero.subtitleFallback')}
          </p>
        </div>
      </section>

      {/* Articles Section */}
      <section className="news-articles-section">
        <div className="news-articles-container">
          {/* Loading State */}
          {loading && (
            <div className="news-loading-state">
              <div className="news-loading-indicator">
                <div className="news-loading-dot" />
                <span className="news-loading-text">{t('common:loading')}</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="news-error-state">
              <p className="news-error-text">
                <strong>{t('common:error')}:</strong> {error}
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && articles.length === 0 && (
            <div className="news-empty-state">
              <div className="news-empty-icon">
                📰
              </div>
              <p className="news-empty-text">{t('empty')}</p>
            </div>
          )}

          {/* Articles Grid */}
          {!loading && !error && articles.length > 0 && (
            <div className="news-articles-grid">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
