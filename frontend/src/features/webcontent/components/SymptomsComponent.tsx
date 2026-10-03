import DOMPurify from 'dompurify';
import type { ArticleResponse } from '../types';

interface Props {
    article: ArticleResponse;
}

/** Complaints an owner recognises (pain, lameness, ...). Each section is one complaint. */
export default function SymptomsComponent({ article }: Props) {
    const sections = [...article.sections].sort((a, b) => a.order - b.order);

    return (
        <section className="home-section">
            <h2 className="home-heading" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.title) }} />
            {article.content && (
                <p className="home-lead" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }} />
            )}
            <ul className="symptom-list">
                {sections.map((section) => (
                    <li key={section.id} className="symptom-item">
                        <h3 className="symptom-title">{section.title}</h3>
                        <p
                            className="symptom-text"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.content) }}
                        />
                    </li>
                ))}
            </ul>
        </section>
    );
}
