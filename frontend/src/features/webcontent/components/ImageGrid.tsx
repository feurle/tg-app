import { useTranslation } from 'react-i18next';
import { imageApi } from '../api';
import type { ImageResponse } from '../types';

interface Props {
  images: ImageResponse[];
  onEdit: (image: ImageResponse) => void;
  onDelete: (image: ImageResponse) => void;
}

export default function ImageGrid({ images, onEdit, onDelete }: Props) {
  const { t } = useTranslation();

  if (images.length === 0) {
    return (
      <div style={{ margin: '0 32px' }}>
        <p style={{ color: 'var(--text-muted)' }}>{t('image.empty')}</p>
      </div>
    );
  }

  return (
    <div style={grid}>
      {images.map((img) => (
        <div key={img.id} style={tile}>
          <img
            src={imageApi.getDownloadUrl(img.id)}
            alt={img.fileName}
            style={imgStyle}
          />
          <p style={fileName} title={img.fileName}>{img.fileName}</p>
          {img.title && <p style={fileName} title={img.title}>{img.title}</p>}
          <button
            onClick={() => onEdit(img)}
            className="icon-btn"
            title={t('common.edit')}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            ✏️ {t('common.edit')}
          </button>
          <button
            onClick={() => onDelete(img)}
            className="icon-btn danger"
            title={t('common.delete')}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            🗑 {t('common.delete')}
          </button>
        </div>
      ))}
    </div>
  );
}

const grid: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1rem',
};

const tile: React.CSSProperties = {
  border: '1px solid #ddd',
  borderRadius: '6px',
  padding: '0.75rem',
  width: '180px',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const imgStyle: React.CSSProperties = {
  width: '100%',
  height: '120px',
  objectFit: 'cover',
  borderRadius: '4px',
};

const fileName: React.CSSProperties = {
  margin: 0,
  fontSize: '0.8rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};
