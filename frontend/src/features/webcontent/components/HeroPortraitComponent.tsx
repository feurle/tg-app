import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import type { ArticleResponse } from '../types';
import { imageApi } from '../api';
import ContactFormModal from '../../contact/components/ContactFormModal';

interface Props {
    article: ArticleResponse;
}

/** Home hero: headline, subline and a first-person statement (first section) next to a portrait (first image). */
export default function HeroPortraitComponent({ article }: Props) {
    const { t } = useTranslation();
    const [showAppointment, setShowAppointment] = useState(false);
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
                    <p
                        className="hero-portrait-statement"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(statement.content) }}
                    />
                )}
                <button type="button" className="btn-primary btn-large" onClick={() => setShowAppointment(true)}>
                    {t('nav.appointment')}
                </button>
            </div>
            {portrait && (
                <img
                    className="hero-portrait-img"
                    src={imageApi.getDownloadUrl(portrait.id)}
                    alt={portrait.title || portrait.fileName}
                />
            )}
            {showAppointment && <ContactFormModal mode="appointment" onClose={() => setShowAppointment(false)} />}
        </section>
    );
}
