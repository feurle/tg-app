import { useTranslation } from 'react-i18next'
import type { ArticleResponse } from '../../types/article.ts'
import './ArticleDetailsModal.css'

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
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface Props {
  article: ArticleResponse
  onEdit: (article: ArticleResponse) => void
  onDelete: (article: ArticleResponse) => void
  onClose: () => void
}

export default function ArticleDetailsModal({ article, onEdit, onDelete, onClose }: Props) {
  const { t } = useTranslation('articles')

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal--large" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>{article.title}</h2>
          <button className="modal__close" onClick={onClose} aria-label="Schliessen">×</button>
        </div>

        <div className="modal__body">
          <div className="details-grid">
            <div className="details-row">
              <label>{t('fields.state')}</label>
              <span className={`badge badge--${article.state.toLowerCase()}`}>
                {STATE_LABELS[article.state]}
              </span>
            </div>

            <div className="details-row">
              <label>{t('fields.page')}</label>
              <span>{PAGE_LABELS[article.page] ?? article.page}</span>
            </div>

            <div className="details-row">
              <label>{t('fields.createdAt')}</label>
              <span>{formatDate(article.createdAt)}</span>
            </div>

            <div className="details-row">
              <label>{t('fields.publishedAt')}</label>
              <span>{formatDate(article.publishedDate)}</span>
            </div>

            <div className="details-row">
              <label>{t('fields.updatedAt')}</label>
              <span>{formatDate(article.updatedAt)}</span>
            </div>

            <div className="details-row">
              <label>{t('fields.images')}</label>
              <span>{article.images.length}</span>
            </div>
          </div>

          <div className="details-section">
            <h3>{t('sections.content')}</h3>
            <div className="details-content">
              {article.content}
            </div>
          </div>

          {article.images.length > 0 && (
            <div className="details-section">
              <h3>{t('sections.images', { count: article.images.length })}</h3>
              <div className="details-images">
                {article.images.map(image => (
                  <div key={image.id} className="details-image-item">
                    <img
                      src={`/api/webcontent/images/${image.id}/download`}
                      alt={image.fileName}
                      title={image.fileName}
                    />
                    <p className="details-image-name">{image.fileName}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal__footer">
          <button className="btn btn--secondary" onClick={onClose}>{t('actions.close')}</button>
          <button className="btn btn--secondary" onClick={() => onEdit(article)}>{t('actions.edit')}</button>
          <button className="btn btn--danger" onClick={() => onDelete(article)}>{t('actions.delete')}</button>
        </div>
      </div>
    </div>
  )
}
