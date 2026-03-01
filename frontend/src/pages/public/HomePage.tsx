import { useEffect, useState } from 'react'
import type { ArticleResponse } from '../../types/article.ts'
import ArticleCard from '../../components/ArticleCard.tsx'
import './HomePage.css'

interface Props {
  onManageArticles?: () => void
}

export default function HomePage({ onManageArticles }: Props) {
  const [teaserArticle, setTeaserArticle] = useState<ArticleResponse | null>(null)
  const [articles, setArticles] = useState<ArticleResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      // Load HOME_TEASER article for hero section
      fetch('/api/webcontent/articles/page/HOME_TEASER/published')
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json() as Promise<ArticleResponse[]>
        })
        .then((results) => setTeaserArticle(results[0] || null))
        .catch(() => setTeaserArticle(null)), // Teaser is optional
      // Load HOME_PAGE articles
      fetch('/api/webcontent/articles/page/HOME_PAGE/published')
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json() as Promise<ArticleResponse[]>
        })
        .then(setArticles)
        .catch((err: Error) => setError(err.message)),
    ]).finally(() => setLoading(false))
  }, [])

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
            {teaserArticle ? teaserArticle.title : 'Willkommen bei'} <span className="hero-title-accent">{teaserArticle ? '' : 'TG App'}</span>
          </h1>

          <p className="hero-subtitle">
            {teaserArticle
              ? teaserArticle.content
              : 'Entdecken Sie aktuelle Artikel und News. Bleiben Sie informiert über die neuesten Inhalte.'}
          </p>

          {/* CTA Buttons */}
          <div className="hero-buttons">
            <a href="#articles" className="hero-button-primary">
              Artikel lesen
            </a>
            {onManageArticles && (
              <button onClick={onManageArticles} className="hero-button-secondary">
                Verwalten
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">{articles.length}</div>
              <div className="hero-stat-label">Artikel</div>
            </div>
            {teaserArticle && (
              <div className="hero-stat">
                <div className="hero-stat-value">{teaserArticle.images.length}</div>
                <div className="hero-stat-label">Bilder</div>
              </div>
            )}
            <div className="hero-stat">
              <div className="hero-stat-value">24/7</div>
              <div className="hero-stat-label">Verfügbar</div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section id="articles" className="articles-section">
        <div className="articles-container">
          {/* Section Header */}
          <div className="section-header">
            <h2 className="section-title">Neueste Artikel</h2>
            <p className="section-subtitle">Lesen Sie unsere aktuellen Beiträge und Meldungen</p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="loading-indicator">
                <div className="loading-dot" />
                <span className="loading-text">Laden…</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="error-state">
              <p className="error-text">
                <strong>Fehler:</strong> {error}
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && articles.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <span className="text-gray-500">📄</span>
              </div>
              <p className="empty-text">Keine Artikel vorhanden</p>
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
