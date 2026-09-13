import DOMPurify from 'dompurify';
import type { ArticleResponse } from '../types';

interface Props {
    article: ArticleResponse;
}

export default function EditorialBlock({ article }: Props) {
    const sorted = [...article.sections].sort((a, b) => a.order - b.order);
    return (
        <div className="editorial-block">
            {article.tags.length > 0 && (
                <div className="article-card-tags">
                    {article.tags.map((tag) => (
                        <span key={tag.id} className="badge badge-green">{tag.name}</span>
                    ))}
                </div>
            )}
            <h2 className="editorial-title">{article.title}</h2>
            {article.content && (
                <div
                    className="article-content editorial-content"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
                />
            )}
            {sorted.map((section) => (
                <div key={section.id} className="editorial-section">
                    {section.title && (
                        <h3 className="editorial-section-title">{section.title}</h3>
                    )}
                    {section.content && (
                        <div
                            className="article-content editorial-content"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.content) }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
