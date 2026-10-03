import { useTranslation } from 'react-i18next';
import PageContent from '../../features/webcontent/components/PageContent';
import ReferralForm from '../../features/contact/components/ReferralForm';
import ContactButton from '../../features/webcontent/components/ContactButton';

export default function ForVetsPage() {
    const { t } = useTranslation();

    return (
        <div className="about-page">
            <div className="about-feed">
                <header className="public-page-header">
                    <h1 className="public-page-title">{t('forVets.title')}</h1>
                    <p className="public-page-subtitle">{t('forVets.subtitle')}</p>
                </header>
                <PageContent slug="for-vets" />
            </div>
            <ReferralForm />
            <div className="cta-section">
                <ContactButton />
            </div>
        </div>
    );
}
