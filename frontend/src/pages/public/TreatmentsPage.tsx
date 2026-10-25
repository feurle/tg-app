import { useTranslation } from 'react-i18next';
import PageContent from '../../features/webcontent/components/PageContent';

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
        </div>
    );
}
