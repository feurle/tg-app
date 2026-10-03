import { useTranslation } from 'react-i18next';
import PageContent from './PageContent';
import ContactSection from '../../contact/components/ContactSection';
import ContactButton from './ContactButton';

interface Props {
    pageSlug: string;
}

/** A CMS page followed by the practice's contact section and the contact buttons (used for the home page). */
export default function PublicPage({ pageSlug }: Props) {
    const { t } = useTranslation();

    return (
        <div style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 72px)' }}>
            <PageContent slug={pageSlug}>
                <ContactSection />
                <div className="cta-section">
                    <p className="cta-tagline">{t('home.contact.sub')}</p>
                    <ContactButton />
                </div>
            </PageContent>
        </div>
    );
}
