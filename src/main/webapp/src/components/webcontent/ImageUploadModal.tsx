import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './ImageUploadModal.css'

interface Props {
  onUpload: (file: File) => Promise<void>
  onCancel: () => void
  uploading: boolean
}

export default function ImageUploadModal({ onUpload, onCancel, uploading }: Props) {
  const { t } = useTranslation(['images', 'common'])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError(t('validation.invalidType'))
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError(t('validation.fileTooLarge'))
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
      .catch((err) => setError(err.message || t('validation.uploadFailed')))
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('modal.title')}</h2>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="file-input" className="form-label">{t('fields.selectFile')}</label>
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
              <p className="form-help">{t('fields.selectedFile', { name: selectedFile.name })}</p>
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
              {t('common:cancel')}
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={!selectedFile || uploading}
            >
              {uploading ? t('buttons.uploading') : t('buttons.upload')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
