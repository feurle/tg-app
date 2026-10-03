import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import type { ArticleResponse } from '../types';
import { imageApi } from '../api';
import { ROUTES } from '../../../router/routes';

interface Props {
    article: ArticleResponse;
}

/**
 * Focus areas as alternating image/text rows. Each section is one area; the article's
 * images are matched to the sections in ascending image-id order. Sections without a
 * matching image render as text only.
 */
export default function MethodsComponent({ article }: Props) {
    const { t } = useTranslation();
    const sections = [...article.sections].sort((a, b) => a.order - b.order);
    const images = [...article.images].sort((a, b) => a.id - b.id);

    return (
        <section className="home-section">
            <h2 className="home-heading" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.title) }} />
            {article.content && (
                <p className="home-lead" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }} />
            )}
            <div className="method-list">
                {sections.map((section, idx) => {
                    const image = images[idx];
                    return (
                        <article key={section.id} className={`method-row${idx % 2 === 1 ? ' method-row-flip' : ''}`}>
                            {image && (
                                <img
                                    className="method-img"
                                    src={imageApi.getDownloadUrl(image.id)}
                                    alt={image.title || image.fileName}
                                    loading="lazy"
                                />
                            )}
                            <div className="method-body">
                                <h3 className="method-title">{section.title}</h3>
                                <div
                                    className="method-text"
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.content) }}
                                />
                            </div>
                        </article>
                    );
                })}
            </div>
            <Link to={ROUTES.TREATMENTS} className="home-more-link">
                {t('home.more.treatments')} →
            </Link>
        </section>
    );
}
