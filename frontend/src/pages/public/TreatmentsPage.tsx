import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../router/routes';
import PageContent from '../../features/webcontent/components/PageContent';
import ContactButton from '../../features/webcontent/components/ContactButton';

export default function TreatmentsPage() {
    const { t } = useTranslation();

    return (
        <div className="about-page">
            <div className="about-feed">
                <header className="public-page-header">
                    <h1 className="public-page-title">{t('treatments.title')}</h1>
                    <p className="public-page-subtitle">{t('treatments.subtitle')}</p>
                </header>
                <PageContent slug="treatments" />
            </div>
            <div className="cta-section questionnaire-cta">
                <h2 className="questionnaire-cta-title">{t('questionnaire.cta.title')}</h2>
                <p className="questionnaire-cta-text">{t('questionnaire.cta.text')}</p>
                <Link to={ROUTES.QUESTIONNAIRE} className="btn-accent">
                    {t('questionnaire.cta.button')}
                </Link>
            </div>
            <div className="cta-section">
                <ContactButton />
            </div>
        </div>
    );
}
