import { useEffect, useState } from 'react'
import type { ArticleResponse } from '../types/article'
import ArticleCard from '../components/ArticleCard'
import './HomePage.css'


export default function HomePage() {
  const [articles, setArticles] = useState<ArticleResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/webcontent/articles/page/HOME/published')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<ArticleResponse[]>
      })
      .then(setArticles)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="home-page">
      <header className="home-page__header">
        <h1>Willkommen</h1>
        <p className="home-page__subtitle">Aktuelle Artikel und News</p>
      </header>

      {loading && (
        <div className="home-page__status">
          <p>Laden…</p>
        </div>
      )}

      {error && (
        <div className="home-page__status home-page__status--error">
          <p>Fehler beim Laden der Artikel: {error}</p>
        </div>
      )}

      {!loading && !error && articles.length === 0 && (
        <div className="home-page__status">
          <p>Keine Artikel vorhanden.</p>
        </div>
      )}

      {!loading && !error && articles.length > 0 && (
        <>
          <main className="home-page__articles">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
              />
            ))}
          </main>
        </>
      )}
    </div>
  )
}