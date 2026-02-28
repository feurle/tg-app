import { useEffect, useState } from 'react'
import type { ImageResponse } from '../../types/image.ts'
import ImageList from '../../components/webcontent/ImageList.tsx'
import ImageUploadModal from '../../components/webcontent/ImageUploadModal.tsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.tsx'
import './ImagesPage.css'

interface Props {
  onBack: () => void
}

export default function ImagesPage({ onBack }: Props) {
  const [images, setImages] = useState<ImageResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ImageResponse | null>(null)
  const [uploading, setUploading] = useState(false)

  function fetchImages() {
    return fetch('/api/webcontent/images')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<ImageResponse[]>
      })
      .then(setImages)
      .catch((err: Error) => setError(err.message))
  }

  useEffect(() => {
    fetchImages().finally(() => setLoading(false))
  }, [])

  function handleUpload(file: File) {
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    return fetch('/api/webcontent/images', {
      method: 'POST',
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return fetchImages()
      })
      .catch((err: Error) => {
        setError(err.message)
        throw err
      })
      .finally(() => setUploading(false))
  }

  function handleDelete() {
    if (!deleteTarget) return
    fetch(`/api/webcontent/images/${deleteTarget.id}`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        setDeleteTarget(null)
        return fetchImages()
      })
      .catch((err: Error) => setError(err.message))
  }

  return (
    <div className="images-page">
      {/* Header */}
      <div className="images-page-header">
        <div className="images-page-header-content">
          <h1 className="images-page-title">Bilderverwaltung</h1>
          <p className="images-page-subtitle">Verwalten Sie alle hochgeladenen Bilder</p>

          <div className="images-page-actions">
            <button
              className="btn btn--primary"
              onClick={() => setShowUploadModal(true)}
              disabled={loading || uploading}
            >
              + Neues Bild
            </button>
            <button
              className="btn btn--secondary"
              onClick={onBack}
              disabled={loading || uploading}
            >
              Zurück
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="images-page-content">
        {loading && <div className="images-page-loading">Laden…</div>}

        {error && (
          <div className="images-page-error">
            <strong>Fehler:</strong> {error}
          </div>
        )}

        {!loading && !error && (
          <ImageList
            images={images}
            onDelete={setDeleteTarget}
          />
        )}
      </div>

      {showUploadModal && (
        <ImageUploadModal
          onUpload={handleUpload}
          onCancel={() => setShowUploadModal(false)}
          uploading={uploading}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Bild „${deleteTarget.fileName}" wirklich löschen?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
