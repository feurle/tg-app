import { useTranslation } from 'react-i18next';
import { useVetInfoState } from '../useVetInfo';
import { formatTime, groupByDay, telHref, weekdayName } from '../officeHours';
import { addressLines, filled, mapUrl } from '../contactInfo';
import OpenStatusLine from './OpenStatusLine';

interface Props {
    /** Heading level: `h1` where this is the main content of the page, `h2` inside a longer page. */
    headingLevel?: 'h1' | 'h2';
}

/**
 * Phone, e-mail, address and office hours of the practice, all from the primary VetInfo.
 * Parts that are missing in the data are left out; without any data a hint points to the forms.
 */
export default function ContactSection({ headingLevel: Heading = 'h2' }: Props) {
    const { t, i18n } = useTranslation();
    const { info, loaded } = useVetInfoState();
    // The labels sit one level below the section heading.
    const Label = Heading === 'h1' ? 'h2' : 'h3';

    const { street, place } = info ? addressLines(info) : { street: null, place: null };
    const route = info ? mapUrl(info) : null;
    const hours = info ? groupByDay(info.officeHours) : [];
    const hasData = filled(info?.phone) || filled(info?.email) || !!street || !!place || hours.length > 0;

    return (
        <section className="home-section">
            <Heading className="home-heading">{t('home.contact.title')}</Heading>

            {!loaded && <div className="vet-contact-placeholder" aria-hidden="true" />}
            {loaded && !hasData && <p className="home-lead">{t('contactInfo.unavailable')}</p>}

            {info && hasData && (
                <div className="vet-contact-grid">
                    {(filled(info.phone) || filled(info.email)) && (
                        <div className="vet-contact-col">
                            {filled(info.phone) && (
                                <>
                                    <Label className="vet-contact-label">{t('contactInfo.phone')}</Label>
                                    <a className="vet-contact-link" href={telHref(info.phone)}>
                                        {info.phone}
                                    </a>
                                </>
                            )}
                            {filled(info.email) && (
                                <>
                                    <Label className="vet-contact-label">{t('contactInfo.email')}</Label>
                                    <a className="vet-contact-link" href={`mailto:${info.email}`}>
                                        {info.email}
                                    </a>
                                </>
                            )}
                        </div>
                    )}
                    {(street || place) && (
                        <div className="vet-contact-col">
                            <Label className="vet-contact-label">{t('contactInfo.address')}</Label>
                            <address className="vet-contact-address">
                                {street}
                                {street && place && <br />}
                                {place}
                            </address>
                            {route && (
                                <a className="home-more-link" href={route} target="_blank" rel="noopener noreferrer">
                                    {t('contactInfo.route')} →
                                </a>
                            )}
                        </div>
                    )}
                    {hours.length > 0 && (
                        <div className="vet-contact-col">
                            <Label className="vet-contact-label">{t('contactInfo.officeHours')}</Label>
                            <dl className="vet-hours">
                                {hours.map(({ day, intervals }) => (
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
                    )}
                </div>
            )}
        </section>
    );
}
