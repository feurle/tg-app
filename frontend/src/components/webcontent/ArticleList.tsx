import type { ArticleResponse } from '../../types/article.ts'
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
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
  HOME_TEASER: 'Home Teaser',
  HOME_PAGE: 'Home Seite',
  NEWS_TEASER: 'News Teaser',
  NEWS_PAGE: 'News Seite',
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
              <button
                className="article-list__action-btn article-list__action-btn--view"
                onClick={() => onView(article)}
                title="Ansehen"
                aria-label="Artikel ansehen"
              >
                <EyeIcon className="article-list__action-icon" />
              </button>
              <button
                className="article-list__action-btn article-list__action-btn--edit"
                onClick={() => onEdit(article)}
                title="Bearbeiten"
                aria-label="Artikel bearbeiten"
              >
                <PencilIcon className="article-list__action-icon" />
              </button>
              <button
                className="article-list__action-btn article-list__action-btn--delete"
                onClick={() => onDelete(article)}
                title="Löschen"
                aria-label="Artikel löschen"
              >
                <TrashIcon className="article-list__action-icon" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
