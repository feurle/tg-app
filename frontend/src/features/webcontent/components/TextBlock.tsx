import DOMPurify from 'dompurify';
import type { ArticleResponse, SectionResponse } from '../types';

interface Props {
    article: ArticleResponse;
}

/** Plain text article: title, lead (article content) and the sections below it, all as sanitized HTML. */
export default function TextBlock({ article }: Props) {
    const sorted = [...article.sections].sort((a: SectionResponse, b: SectionResponse) => a.order - b.order);
    return (
        <div className="about-text-block">
            {article.tags.length > 0 && (
                <div className="about-text-tags">
                    {article.tags.map((tag) => (
                        <span key={tag.id} className="badge badge-green">{tag.name}</span>
                    ))}
                </div>
            )}
            {article.title && <h2 className="about-text-title">{article.title}</h2>}
            {article.content && (
                <div
                    className="article-content about-text-content"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
                />
            )}
            {sorted.map((section) => (
                <div key={section.id} className="about-text-section">
                    {section.title && <h3 className="about-text-section-title">{section.title}</h3>}
                    {section.content && (
                        <div
                            className="article-content about-text-section-content"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.content) }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
