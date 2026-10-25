import PageContent from './PageContent';
import ContactSection from '../../contact/components/ContactSection';

interface Props {
    pageSlug: string;
}

/** A CMS page followed by the practice's contact section (used for the home page). */
export default function PublicPage({ pageSlug }: Props) {
    return (
        <div style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 72px)' }}>
            <PageContent slug={pageSlug}>
                <ContactSection />
            </PageContent>
        </div>
    );
}
