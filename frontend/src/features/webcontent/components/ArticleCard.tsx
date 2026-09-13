import type { ArticleResponse } from '../types';
import DOMPurify from "dompurify";

interface Props {
  article: ArticleResponse;
  onClick?: () => void;
}

export default function ArticleCard({ article, onClick }: Readonly<Props>) {
  const rawText = article.content
    || [...article.sections].sort((a, b) => a.order - b.order)[0]?.content
    || '';
  const plainText = rawText.replace(/<[^>]*>/g, '').trim();
  const excerpt = plainText.length > 150 ? plainText.substring(0, 150) + ' ...' : plainText;

  // Format date if it exists
  const dateStr = article.createdAt
    ? new Date(article.createdAt).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : '';

  return (
    <div
      className={`article-card${onClick ? ' article-card--interactive' : ''}`}
      onClick={onClick}
      style={onClick ? {cursor: 'pointer'} : undefined}
    >
      {article.tags.length > 0 && (
        <div className="article-card-tags">
          {article.tags.map((tag) => (
            <span key={tag.id} className="badge badge-green">{tag.name}</span>
          ))}
        </div>
      )}
      <div className="article-card-title">{article.title}</div>
      <div className="article-content article-card-content" dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(excerpt)}} />
      {dateStr && <div className="article-card-date">{dateStr}</div>}
    </div>
  );
}
