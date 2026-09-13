import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  onUpload: (file: File, title: string) => void;
  onCancel: () => void;
  saving: boolean;
}

export default function ImageUploadModal({ onUpload, onCancel, saving }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const { t } = useTranslation();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSelectedFile(e.target.files?.[0] ?? null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedFile) {
      onUpload(selectedFile, title);
    }
  }

  return (
    <div style={overlay} onClick={onCancel}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: '1rem' }}>{t('image.uploadHeading')}</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={dropArea}
            onClick={() => inputRef.current?.click()}
          >
            {selectedFile ? (
              <span>{selectedFile.name}</span>
            ) : (
              <span style={{ color: '#888' }}>{t('image.selectFile')}</span>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          <label style={labelStyle}>
            {t('image.title')}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
            />
          </label>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onCancel} disabled={saving} className="btn-secondary">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={!selectedFile || saving} className="btn-accent">
              {saving ? t('image.uploading') : t('image.uploadAction')}
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
  width: '100%', maxWidth: '400px',
};

const labelStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', fontSize: '0.8rem', fontWeight: 500, gap: '2px',
};

const inputStyle: React.CSSProperties = {
  padding: '0.35rem 0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem',
};

const dropArea: React.CSSProperties = {
  border: '2px dashed #ccc',
  borderRadius: '6px',
  padding: '2rem',
  textAlign: 'center',
  cursor: 'pointer',
};
