import type { ArticleResponse } from '../types/article'
import './ArticleList.css'

interface Props {
  articles: ArticleResponse[]
  onView: (article: ArticleResponse) => void
  onEdit: (article: ArticleResponse) => void
  onDelete: (article: ArticleResponse) => void
}

const STATE_LABELS: Record<string, string> = {
  CREATED: 'Erstellt',
  PUBLISHED: 'Publiziert',
  CLOSED: 'Geschlossen',
}

const PAGE_LABELS: Record<string, string> = {
  TEASER: 'Teaser',
  HOME: 'Home',
  NEWS: 'News',
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function ArticleList({ articles, onView, onEdit, onDelete }: Props) {
  if (articles.length === 0) {
    return <p className="article-list__empty">Keine Artikel vorhanden.</p>
  }

  return (
    <table className="article-list">
      <thead>
        <tr>
          <th>ID</th>
          <th>Titel</th>
          <th>Seite</th>
          <th>Status</th>
          <th>Erstellt am</th>
          <th>Publiziert am</th>
          <th>Geändert am</th>
          <th>Bilder</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {articles.map((article) => (
          <tr key={article.id}>
            <td>{article.id}</td>
            <td>{article.title}</td>
            <td>{PAGE_LABELS[article.page] ?? article.page}</td>
            <td>
              <span className={`badge badge--${article.state.toLowerCase()}`}>
                {STATE_LABELS[article.state] ?? article.state}
              </span>
            </td>
            <td>{formatDate(article.createdAt)}</td>
            <td>{formatDate(article.publishedDate)}</td>
            <td>{formatDate(article.updatedAt)}</td>
            <td>{article.images.length}</td>
            <td className="article-list__actions">
              <button className="btn btn--sm btn--secondary" onClick={() => onView(article)}>
                Ansehen
              </button>
              <button className="btn btn--sm btn--secondary" onClick={() => onEdit(article)}>
                Bearbeiten
              </button>
              <button className="btn btn--sm btn--danger" onClick={() => onDelete(article)}>
                Löschen
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
