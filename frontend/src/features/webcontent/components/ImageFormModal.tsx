import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ImageResponse, UpdateImageRequest } from '../types';

interface Props {
  image: ImageResponse;
  onSave: (data: UpdateImageRequest) => void;
  onCancel: () => void;
  saving: boolean;
}

export default function ImageFormModal({ image, onSave, onCancel, saving }: Props) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(image.title ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ title });
  }

  return (
    <div style={overlay} onClick={onCancel}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: '1rem' }}>{t('image.editHeading')}</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={labelStyle}>
            {t('image.fileName')}
            <input value={image.fileName} disabled style={{ ...inputStyle, color: 'var(--text-muted)' }} />
          </label>

          <label style={labelStyle}>
            {t('image.title')}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
            />
          </label>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" onClick={onCancel} disabled={saving} className="btn-secondary">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={saving} className="btn-accent">
              {saving ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
};

const modal: React.CSSProperties = {
  background: '#fff', padding: '2rem', borderRadius: '8px',
  width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto',
};

const labelStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', fontSize: '0.8rem', fontWeight: 500, gap: '2px',
};

const inputStyle: React.CSSProperties = {
  padding: '0.35rem 0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem',
};
