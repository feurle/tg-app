import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from '../../config/translation.ts'
import type { ArticleResponse } from '../../types/article.ts'
import { articleService } from '../../services/article.service.ts'
import ArticleCard from '../../components/common/ArticleCard.tsx'
import './HomePage.css'

export default function HomePage() {
  const { t } = useTranslation('home')
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
          articleService.getPublished('HOME_TEASER', language).catch(() => []),
          articleService.getPublished('HOME_PAGE', language).catch((err) => {
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
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-gradient" />
        </div>

        <div className="hero-content">
          {/* Hero Content from TEASER article or fallback */}
          <h1 className="hero-title">
            {teaserArticle ? teaserArticle.title : t('hero.titleFallback')} <span className="hero-title-accent">{teaserArticle ? '' : t('hero.accentFallback')}</span>
          </h1>

          <p className="hero-subtitle">
            {teaserArticle
              ? teaserArticle.content
              : t('hero.subtitleFallback')}
          </p>

          {/* CTA Buttons */}
        </div>
      </section>

      {/* Articles Section */}
      <section id="articles" className="articles-section">
        <div className="articles-container">
          {/* Section Header */}

          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="loading-indicator">
                <div className="loading-dot" />
                <span className="loading-text">{t('common:loading')}</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="error-state">
              <p className="error-text">
                <strong>{t('common:error')}:</strong> {error}
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && articles.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <span className="text-gray-500">📄</span>
              </div>
              <p className="empty-text">{t('empty')}</p>
            </div>
          )}

          {/* Articles Grid */}
          {!loading && !error && articles.length > 0 && (
            <div className="articles-grid">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
