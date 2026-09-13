import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {contactApi} from '../api';
import type {ContactInfoResponse} from '../types';

export default function ContactSection() {
    const {t} = useTranslation();
    const [info, setInfo] = useState<ContactInfoResponse | null>(null);

    useEffect(() => {
        contactApi.getInfo()
            .then(setInfo)
            .catch(() => setInfo(null));
    }, []);

    if (!info) return null;

    return (
        <div className="section">
            <div className="section-header">
                <span className="section-title">{t('home.contact.title')}</span>
                <span className="section-sub">{t('home.contact.sub')}</span>
            </div>
            <div className="contact-info-grid">
                <div className="contact-info-col">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.86a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/>
                    </svg>
                    <span className="contact-info-label">{t('contactInfo.phone')}</span>
                    <a className="contact-info-value contact-info-link" href={`tel:${info.phone}`}>
                        {info.phone}
                    </a>
                </div>
                <div className="contact-info-col">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2"/>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                    <span className="contact-info-label">{t('contactInfo.email')}</span>
                    <a className="contact-info-value contact-info-link" href={`mailto:${info.email}`}>
                        {info.email}
                    </a>
                </div>
                <div className="contact-info-col">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span className="contact-info-label">{t('contactInfo.address')}</span>
                    <span className="contact-info-value">{info.street}</span>
                    <span className="contact-info-value">{info.zip} {info.city}</span>
                </div>
                <div className="contact-info-col">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span className="contact-info-label">{t('contactInfo.officeHours')}</span>
                    {info.officeHours.map((oh) => (
                        <div key={oh.label} className="contact-info-hours-row">
                            <span className="contact-info-hours-day">{oh.label}</span>
                            <span className="contact-info-value">{oh.hours}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
