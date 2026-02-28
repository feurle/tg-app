import type { ArticleResponse } from '../types/article'
import './ArticleCard.css'

interface Props {
  article: ArticleResponse
}

export default function ArticleCard({ article }: Props) {
  function formatDate(iso: string | null): string {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <article className="article-card">
      <div className="article-card__main">
        <div className="article-card__header">
          <h2 className="article-card__title">{article.title}</h2>
          {article.publishedDate && (
            <time className="article-card__date">{formatDate(article.publishedDate)}</time>
          )}
        </div>

        <div className="article-card__content">{article.content}</div>
      </div>

      {article.images.length > 0 && (
        <div className="article-card__images">
          {article.images.slice(0, 3).map((image) => (
            <img
              key={image.id}
              src={`/api/webcontent/images/${image.id}/download`}
              alt={image.fileName}
              className="article-card__image"
            />
          ))}
          {article.images.length > 3 && (
            <div className="article-card__image-more">
              +{article.images.length - 3}
            </div>
          )}
        </div>
      )}
    </article>
  )
}