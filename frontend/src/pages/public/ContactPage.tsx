import { useTranslation } from 'react-i18next';
import ContactSection from '../../features/contact/components/ContactSection';
import ContactButton from '../../features/webcontent/components/ContactButton';

export default function ContactPage() {
  const { t } = useTranslation();

  return (
    <div style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 60px)' }}>
      <ContactSection headingLevel="h1" />
      <div className="cta-section">
        <p className="cta-tagline">{t('home.contact.sub')}</p>
        <ContactButton />
      </div>
    </div>
  );
}
