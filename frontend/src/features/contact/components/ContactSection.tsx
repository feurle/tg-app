import { useTranslation } from 'react-i18next';
import { useVetInfo } from '../useVetInfo';
import { formatTime, groupByDay, telHref, weekdayName } from '../officeHours';
import OpenStatusLine from './OpenStatusLine';

interface Props {
    /** Heading level: `h1` where this is the main content of the page, `h2` inside a longer page. */
    headingLevel?: 'h1' | 'h2';
}

/** Phone, e-mail, address and office hours of the practice, all from the primary VetInfo. */
export default function ContactSection({ headingLevel: Heading = 'h2' }: Props) {
    const { t, i18n } = useTranslation();
    const info = useVetInfo();

    if (!info) return null;

    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${info.street}, ${info.zip} ${info.city}`,
    )}`;

    return (
        <section className="home-section">
            <Heading className="home-heading">{t('home.contact.title')}</Heading>
            <div className="vet-contact-grid">
                <div className="vet-contact-col">
                    <h3 className="vet-contact-label">{t('contactInfo.phone')}</h3>
                    <a className="vet-contact-link" href={telHref(info.phone)}>
                        {info.phone}
                    </a>
                    <h3 className="vet-contact-label">{t('contactInfo.email')}</h3>
                    <a className="vet-contact-link" href={`mailto:${info.email}`}>
                        {info.email}
                    </a>
                </div>
                <div className="vet-contact-col">
                    <h3 className="vet-contact-label">{t('contactInfo.address')}</h3>
                    <address className="vet-contact-address">
                        {info.street}
                        <br />
                        {info.zip} {info.city}
                    </address>
                    <a className="home-more-link" href={mapUrl} target="_blank" rel="noopener noreferrer">
                        {t('contactInfo.route')} →
                    </a>
                </div>
                <div className="vet-contact-col">
                    <h3 className="vet-contact-label">{t('contactInfo.officeHours')}</h3>
                    <dl className="vet-hours">
                        {groupByDay(info.officeHours).map(({ day, intervals }) => (
                            <div key={day} className="vet-hours-row">
                                <dt>{weekdayName(day, i18n.language)}</dt>
                                <dd>
                                    {intervals
                                        .map((h) => `${formatTime(h.opensAt)}–${formatTime(h.closesAt)}`)
                                        .join(', ')}
                                </dd>
                            </div>
                        ))}
                    </dl>
                    <OpenStatusLine officeHours={info.officeHours} />
                </div>
            </div>
        </section>
    );
}
