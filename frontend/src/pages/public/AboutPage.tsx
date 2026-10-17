import PageContent from '../../features/webcontent/components/PageContent';
import ContactButton from '../../features/webcontent/components/ContactButton';

export default function AboutPage() {
    return (
        <div className="about-page">
            <div className="about-feed">
                <PageContent slug="about" />
            </div>
            <div className="cta-section">
                <ContactButton />
            </div>
        </div>
    );
}
