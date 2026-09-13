import DOMPurify from 'dompurify';
import type { ArticleResponse } from '../types';

interface Props {
  article: ArticleResponse;
}

// Icons by contact field order: Telefon, E-Mail, Adresse, Sprechzeiten
const CONTACT_ICONS = [
  // Phone
  <svg key="phone" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20" aria-hidden="true">
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
  </svg>,

  // Mail
  <svg key="mail" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20" aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.8"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>,

  // Map pin
  <svg key="address" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20" aria-hidden="true">
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.8"/>
  </svg>,

  // Clock
  <svg key="hours" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M12 6v6l3.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>,
];

export default function Col4Component({ article }: Props) {
  const sorted = [...article.sections].sort((a, b) => a.order - b.order);

  return (
    <div className="section">
      <div className="section-header">
        <p className="section-eyebrow">Kontakt</p>
        <h2
          className="section-heading"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.title) }}
        />
        {article.content && (
          <p
            className="section-description"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
          />
        )}
      </div>
      <div className="contact-info-grid">
        {sorted.map((section, idx) => (
          <div key={section.id} className="contact-info-col">
            <div className="contact-icon-wrap">
              {CONTACT_ICONS[idx] ?? null}
            </div>
            <span
              className="contact-info-label"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.title) }}
            />
            <span
              className="contact-info-value"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.content) }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
