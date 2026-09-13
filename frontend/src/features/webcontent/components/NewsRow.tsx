import type { ArticleResponse } from '../types';

interface Props {
    article: ArticleResponse;
    onClick: () => void;
}

export default function NewsRow({ article, onClick }: Readonly<Props>) {
    const rawText =
        article.content ||
        [...article.sections].sort((a, b) => a.order - b.order)[0]?.content ||
        '';
    const plainText = rawText.replace(/<[^>]*>/g, '').trim();
    const excerpt = plainText.length > 280 ? plainText.substring(0, 280) + ' …' : plainText;

    const dateStr = article.publishedDate
        ? new Date(article.publishedDate).toLocaleDateString('de-DE', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
          })
        : article.createdAt
          ? new Date(article.createdAt).toLocaleDateString('de-DE', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            })
          : '';

    return (
        <article className="news-row" onClick={onClick} role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}>
            {article.tags.length > 0 && (
                <div className="news-row-tags">
                    {article.tags.map((tag) => (
                        <span key={tag.id} className="news-row-tag">{tag.name}</span>
                    ))}
                </div>
            )}
            <h2 className="news-row-title">{article.title}</h2>
            {excerpt && <p className="news-row-excerpt">{excerpt}</p>}
            <div className="news-row-footer">
                {dateStr && <span className="news-row-date">{dateStr}</span>}
                <span className="news-row-read">
                    Lesen
                    <span className="news-row-read-arrow">→</span>
                </span>
            </div>
        </article>
    );
}
