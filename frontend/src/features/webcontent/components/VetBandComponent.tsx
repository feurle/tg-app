import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import type { ArticleResponse } from '../types';
import { ROUTES } from '../../../router/routes';

interface Props {
    article: ArticleResponse;
}

/** Slim band that points referring vets to the referral page. */
export default function VetBandComponent({ article }: Props) {
    const { t } = useTranslation();

    return (
        <section className="vet-band">
            <div className="vet-band-inner">
                <div>
                    <h2 className="vet-band-title" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.title) }} />
                    {article.content && (
                        <p className="vet-band-text" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }} />
                    )}
                </div>
                <Link to={ROUTES.FOR_VETS} className="btn-secondary btn-large">
                    {t('home.vetBand.cta')} →
                </Link>
            </div>
        </section>
    );
}
