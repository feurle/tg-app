import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  title: string;
  subtitle?: string;
  intro?: ReactNode;
  /** Set to false when the form is not directly below the intro (the form then shows the note itself). */
  requiredNote?: boolean;
  children: ReactNode;
}

/** Shared page frame of all public forms: title, short intro, then the form itself. */
export default function FormPage({ title, subtitle, intro, requiredNote = true, children }: Props) {
  const { t } = useTranslation();
  return (
    <div style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 60px)' }}>
      <div className="section form-page">
        <div className="form-intro">
          <h1 className="form-title">{title}</h1>
          {subtitle && <p className="form-subtitle">{subtitle}</p>}
          {intro && <p className="form-lead">{intro}</p>}
          {requiredNote && <p className="form-required-note">{t('form.requiredNote')}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
