import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import type { ArticleResponse } from '../types';
import { resolveCtaTarget } from '../ctaTarget';

interface Props {
    article: ArticleResponse;
}

/**
 * Call to action: optional headline (`title`), optional text (`content`) and up to two buttons
 * (sections: `title` = label, `content` = target). A CTA with a headline uses the accent look.
 */
export default function CtaComponent({ article }: Props) {
    const hasHeadline = article.title.trim() !== '';
    const buttons = [...article.sections]
        .sort((a, b) => a.order - b.order || a.id - b.id)
        .slice(0, 2)
        .map((section) => ({ section, target: resolveCtaTarget(section.content) }))
        .filter((button) => button.target !== null);

    return (
        <div className={hasHeadline ? 'cta-section questionnaire-cta' : 'cta-section'}>
            {hasHeadline && (
                <h2
                    className="questionnaire-cta-title"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.title) }}
                />
            )}
            {article.content && (
                <p
                    className={hasHeadline ? 'questionnaire-cta-text' : 'cta-tagline'}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
                />
            )}
            {buttons.length > 0 && (
                <div className="hero-actions">
                    {buttons.map(({ section, target }, index) => {
                        const className = hasHeadline ? 'btn-accent' : index === 0 ? 'btn-primary' : 'btn-secondary';
                        return target!.kind === 'internal' ? (
                            <Link key={section.id} to={target!.to} className={className}>
                                {section.title}
                            </Link>
                        ) : (
                            <a key={section.id} href={target!.href} className={className} rel="noopener noreferrer">
                                {section.title}
                            </a>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
