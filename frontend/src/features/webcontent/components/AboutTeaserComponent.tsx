import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import type { ArticleResponse } from '../types';
import { imageApi } from '../api';
import { ROUTES } from '../../../router/routes';

interface Props {
    article: ArticleResponse;
}

/** Short "about me" teaser on the home page; sections are rendered as a muted qualifications line. */
export default function AboutTeaserComponent({ article }: Props) {
    const { t } = useTranslation();
    const image = article.images[0] ?? null;
    const sections = [...article.sections].sort((a, b) => a.order - b.order);

    return (
        <section className="home-section about-teaser">
            {image && (
                <img
                    className="about-teaser-img"
                    src={imageApi.getDownloadUrl(image.id)}
                    alt={image.title || image.fileName}
                    loading="lazy"
                />
            )}
            <div className="about-teaser-body">
                <h2 className="home-heading" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.title) }} />
                {article.content && (
                    <div
                        className="about-teaser-text"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
                    />
                )}
                {sections.map((section) => (
                    <p
                        key={section.id}
                        className="about-teaser-quals"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.content) }}
                    />
                ))}
                <Link to={ROUTES.ABOUT} className="home-more-link">
                    {t('home.more.about')} →
                </Link>
            </div>
        </section>
    );
}
