import { useEffect, useState } from 'react'
import type { ImageResponse } from '../types/image'
import ImageList from '../components/ImageList'
import ImageUploadModal from '../components/ImageUploadModal'
import ConfirmDialog from '../components/ConfirmDialog'
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
      <button className="images-page__back" onClick={onBack}>← Zurück</button>

      <div className="images-page__header">
        <h1>Bilder</h1>
        <button className="btn btn--primary" onClick={() => setShowUploadModal(true)}>
          + Neues Bild
        </button>
      </div>

      {loading && <p className="images-page__status">Laden…</p>}
      {error && <p className="images-page__status images-page__status--error">Fehler: {error}</p>}
      {!loading && !error && (
        <ImageList
          images={images}
          onDelete={setDeleteTarget}
        />
      )}

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
