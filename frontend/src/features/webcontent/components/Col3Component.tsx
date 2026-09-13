import DOMPurify from 'dompurify';
import type { ArticleResponse } from '../types';

interface Props {
  article: ArticleResponse;
}

// Icons mapped by service order: Schulmedizin, Naturheilkunde, Ganzheitliche Betreuung
const SERVICE_ICONS = [
  // Schulmedizin — medical cross inside a circle
  <svg key="schulmedizin" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28" aria-hidden="true">
    <circle cx="24" cy="24" r="19" stroke="currentColor" strokeWidth="2"/>
    <path d="M24 13v22M13 24h22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>,

  // Naturheilkunde — botanical leaf with central vein and branch veins
  <svg key="naturheilkunde" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28" aria-hidden="true">
    <path d="M24 43C24 43 7 34 7 20C7 11.16 14.84 4 24 4C33.16 4 41 11.16 41 20C41 34 24 43 24 43Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <line x1="24" y1="43" x2="24" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M24 33C20 29 14 26 11 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M24 26C28 22 34 19 37 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>,

  // Ganzheitliche Betreuung — paw print inside a circle (mirrors the practice logo)
  <svg key="ganzheitlich" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28" aria-hidden="true">
    <circle cx="24" cy="24" r="19" stroke="currentColor" strokeWidth="2"/>
    <ellipse cx="24" cy="32" rx="6.5" ry="4" stroke="currentColor" strokeWidth="1.8"/>
    <ellipse cx="15.5" cy="25" rx="2.6" ry="3.2" stroke="currentColor" strokeWidth="1.8"/>
    <ellipse cx="32.5" cy="25" rx="2.6" ry="3.2" stroke="currentColor" strokeWidth="1.8"/>
    <ellipse cx="19.5" cy="20" rx="2.3" ry="2.8" stroke="currentColor" strokeWidth="1.8"/>
    <ellipse cx="28.5" cy="20" rx="2.3" ry="2.8" stroke="currentColor" strokeWidth="1.8"/>
  </svg>,
];

export default function Col3Component({ article }: Props) {
  const sorted = [...article.sections].sort((a, b) => a.order - b.order);

  return (
    <div className="section">
      <div className="section-header">
        <p className="section-eyebrow">Leistungen</p>
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
      <div className="service-grid">
        {sorted.map((section, idx) => (
          <div key={section.id} className="service-card">
            <div className="service-icon-wrap">
              {SERVICE_ICONS[idx] ?? null}
            </div>
            <h3
              className="service-title"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.title) }}
            />
            <p
              className="service-body"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.content) }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
