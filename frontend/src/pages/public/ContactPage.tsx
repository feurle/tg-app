import ContactSection from '../../features/contact/components/ContactSection';
import PageContent from '../../features/webcontent/components/PageContent';

export default function ContactPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 60px)' }}>
      <ContactSection headingLevel="h1" />
      <PageContent slug="contact" />
    </div>
  );
}
