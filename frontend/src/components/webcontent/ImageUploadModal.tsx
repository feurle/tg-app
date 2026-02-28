import { useState } from 'react'
import './ImageUploadModal.css'

interface Props {
  onUpload: (file: File) => Promise<void>
  onCancel: () => void
  uploading: boolean
}

export default function ImageUploadModal({ onUpload, onCancel, uploading }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Bitte wählen Sie eine Bilddatei aus.')
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('Datei ist zu groß. Maximum: 10 MB.')
      return
    }

    setError(null)
    setSelectedFile(file)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFile) return

    onUpload(selectedFile)
      .then(() => {
        setSelectedFile(null)
        onCancel()
      })
      .catch((err) => setError(err.message || 'Upload fehlgeschlagen.'))
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Bild hochladen</h2>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="file-input" className="form-label">Bilddatei auswählen</label>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="form-input"
              required
            />
            {selectedFile && (
              <p className="form-help">Gewählt: {selectedFile.name}</p>
            )}
          </div>

          {error && (
            <p className="form-error">{error}</p>
          )}

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onCancel}
              disabled={uploading}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={!selectedFile || uploading}
            >
              {uploading ? 'Wird hochgeladen…' : 'Hochladen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
