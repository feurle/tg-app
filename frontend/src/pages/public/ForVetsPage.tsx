import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageContent from '../../features/webcontent/components/PageContent';
import { ROUTES } from '../../router/routes';

export default function ForVetsPage() {
    const { t } = useTranslation();

    return (
        <div className="about-page">
            <div className="about-feed">
                <header className="public-page-header">
                    <h1 className="public-page-title">{t('forVets.title')}</h1>
                    <p className="public-page-subtitle">{t('forVets.subtitle')}</p>
                    <Link to={ROUTES.REFERRAL} className="btn-primary public-page-cta">
                        {t('referral.title')}
                    </Link>
                </header>
                <PageContent slug="for-vets" />
            </div>
        </div>
    );
}
