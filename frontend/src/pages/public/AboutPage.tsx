import { useTranslation } from 'react-i18next';
import PageContent from '../../features/webcontent/components/PageContent';

export default function AboutPage() {
    const { t } = useTranslation();

    return (
        <div className="about-page">
            <div className="about-feed">
                <h1 className="visually-hidden">{t('nav.aboutMe')}</h1>
                <PageContent slug="about" />
            </div>
        </div>
    );
}
