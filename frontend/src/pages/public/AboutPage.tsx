import { useTranslation } from 'react-i18next';
import PageContent from '../../features/webcontent/components/PageContent';
import ContactButton from '../../features/webcontent/components/ContactButton';

export default function AboutPage() {
    const { t } = useTranslation();

    return (
        <div className="about-page">
            <div className="about-feed">
                <h1 className="visually-hidden">{t('nav.aboutMe')}</h1>
                <PageContent slug="about" />
            </div>
            <div className="cta-section">
                <ContactButton />
            </div>
        </div>
    );
}
