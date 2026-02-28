import { useEffect, useState } from 'react'
import type { ArticleResponse } from '../types/article'
import ArticleList from '../components/ArticleList'
import './ArticlesPage.css'

interface Props {
  onBack: () => void
}

export default function ArticlesPage({ onBack }: Props) {
  const [articles, setArticles] = useState<ArticleResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/webcontent/articles')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<ArticleResponse[]>
      })
      .then(setArticles)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="articles-page">
      <button className="articles-page__back" onClick={onBack}>← Zurück</button>
      <h1>Artikel</h1>
      {loading && <p className="articles-page__status">Laden…</p>}
      {error && <p className="articles-page__status articles-page__status--error">Fehler: {error}</p>}
      {!loading && !error && <ArticleList articles={articles} />}
    </div>
  )
}