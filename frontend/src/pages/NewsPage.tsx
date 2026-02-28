import { useEffect, useState } from 'react'
import type { ArticleResponse } from '../types/article'
import ArticleCard from '../components/ArticleCard'
import './NewsPage.css'

export default function NewsPage() {
  const [articles, setArticles] = useState<ArticleResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/webcontent/articles/page/NEWS/published')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<ArticleResponse[]>
      })
      .then(setArticles)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="news-page">
      {/* Hero Section */}
      <section className="news-hero-section">
        <div className="news-hero-background">
          <div className="news-hero-gradient" />
        </div>

        <div className="news-hero-content">
          {/* Hero Content */}
          <h1 className="news-hero-title">
            Aktuelle <span className="news-hero-title-accent">News</span>
          </h1>

          <p className="news-hero-subtitle">
            Bleiben Sie auf dem Laufenden mit den neuesten Meldungen und Updates
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
                <span className="news-loading-text">Laden…</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="news-error-state">
              <p className="news-error-text">
                <strong>Fehler:</strong> {error}
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && articles.length === 0 && (
            <div className="news-empty-state">
              <div className="news-empty-icon">
                📰
              </div>
              <p className="news-empty-text">Keine News vorhanden</p>
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
