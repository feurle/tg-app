import type { ImageResponse } from '../types/image'
import './ImageList.css'

interface Props {
  images: ImageResponse[]
  onDelete: (image: ImageResponse) => void
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ImageList({ images, onDelete }: Props) {
  if (images.length === 0) {
    return <p className="image-list__empty">Keine Bilder vorhanden.</p>
  }

  return (
    <div className="image-list">
      {images.map((image) => (
        <div key={image.id} className="image-list__item">
          <div className="image-list__preview">
            <img
              src={`/api/webcontent/images/${image.id}/download`}
              alt={image.fileName}
              loading="lazy"
            />
          </div>
          <div className="image-list__info">
            <h3 className="image-list__filename">{image.fileName}</h3>
            <p className="image-list__meta">
              <span className="image-list__type">{image.mimeType}</span>
              <span className="image-list__date">{formatDate(image.createdAt)}</span>
            </p>
          </div>
          <div className="image-list__actions">
            <button
              className="btn btn--sm btn--danger"
              onClick={() => onDelete(image)}
            >
              Löschen
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
