import DOMPurify from 'dompurify';
import type { ArticleResponse } from '../types';

interface Props {
    article: ArticleResponse;
}

/** First-visit process: each section is one step, shown in order with arrows between them. */
export default function StepsComponent({ article }: Props) {
    const sections = [...article.sections].sort((a, b) => a.order - b.order);

    return (
        <section className="home-section">
            <h2 className="home-heading" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.title) }} />
            {article.content && (
                <p className="home-lead" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }} />
            )}
            <ol className="step-list">
                {sections.map((section) => (
                    <li key={section.id} className="step-item">
                        <h3 className="step-title">{section.title}</h3>
                        <div
                            className="step-text"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.content) }}
                        />
                    </li>
                ))}
            </ol>
        </section>
    );
}
