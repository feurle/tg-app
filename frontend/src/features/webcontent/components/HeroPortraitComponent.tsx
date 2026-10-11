import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import type { ArticleResponse } from '../types';
import { imageApi } from '../api';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../router/routes';
import OpenStatusLine from '../../contact/components/OpenStatusLine';
import { useVetInfo } from '../../contact/useVetInfo';
import { telHref } from '../../contact/officeHours';

interface Props {
    article: ArticleResponse;
}

/** Home hero: headline, subline and a first-person statement (first section) next to a portrait (first image). */
export default function HeroPortraitComponent({ article }: Props) {
    const { t } = useTranslation();
    const vetInfo = useVetInfo();
    const portrait = article.images[0] ?? null;
    const statement = [...article.sections].sort((a, b) => a.order - b.order)[0];

    return (
        <section className="hero-portrait">
            <div className="hero-portrait-text">
                <h1
                    className="hero-portrait-title"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.title) }}
                />
                {article.content && (
                    <p
                        className="hero-portrait-sub"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
                    />
                )}
                {statement?.content && (
                    <div
                        className="hero-portrait-statement"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(statement.content) }}
                    />
                )}
                <div className="hero-portrait-actions">
                    <Link to={ROUTES.APPOINTMENT} className="btn-primary btn-large">
                        {t('nav.appointment')}
                    </Link>
                    {vetInfo?.phone && (
                        <a className="hero-portrait-phone" href={telHref(vetInfo.phone)}>
                            {vetInfo.phone}
                        </a>
                    )}
                </div>
                {vetInfo && <OpenStatusLine officeHours={vetInfo.officeHours} />}
            </div>
            {portrait && (
                <img
                    className="hero-portrait-img"
                    src={imageApi.getDownloadUrl(portrait.id)}
                    alt={portrait.title || portrait.fileName}
                />
            )}
        </section>
    );
}
