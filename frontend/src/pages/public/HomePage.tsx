import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from '../../i18n/config'
import type { ArticleResponse } from '../../types/article.ts'
import ArticleCard from '../../components/ArticleCard.tsx'
import './HomePage.css'

interface Props {
  onManageArticles?: () => void
}

export default function HomePage({ onManageArticles }: Props) {
  const { t } = useTranslation('home')
  const [teaserArticle, setTeaserArticle] = useState<ArticleResponse | null>(null)
  const [articles, setArticles] = useState<ArticleResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const language = i18n.language.toUpperCase()
    Promise.all([
      // Load HOME_TEASER article for hero section
      fetch(`/api/webcontent/articles/page/HOME_TEASER/published?language=${language}`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json() as Promise<ArticleResponse[]>
        })
        .then((results) => setTeaserArticle(results[0] || null))
        .catch(() => setTeaserArticle(null)), // Teaser is optional
      // Load HOME_PAGE articles
      fetch(`/api/webcontent/articles/page/HOME_PAGE/published?language=${language}`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json() as Promise<ArticleResponse[]>
        })
        .then(setArticles)
        .catch((err: Error) => setError(err.message)),
    ]).finally(() => setLoading(false))
  }, [i18n.language])

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
          <div className="hero-buttons">
            <a href="#articles" className="hero-button-primary">
              {t('hero.ctaRead')}
            </a>
            {onManageArticles && (
              <button onClick={onManageArticles} className="hero-button-secondary">
                {t('hero.ctaManage')}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section id="articles" className="articles-section">
        <div className="articles-container">
          {/* Section Header */}
          <div className="section-header">
            <h2 className="section-title">{t('section.title')}</h2>
            <p className="section-subtitle">{t('section.subtitle')}</p>
          </div>

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
