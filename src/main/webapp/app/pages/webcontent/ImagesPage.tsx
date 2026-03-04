import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useImages } from '../../hooks/useImages.ts'
import ImageList from '../../components/webcontent/ImageList.tsx'
import ImageUploadModal from '../../components/webcontent/ImageUploadModal.tsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.tsx'
import './ImagesPage.css'

interface Props {
  onBack: () => void
}

export default function ImagesPage({ onBack }: Props) {
  const { t } = useTranslation(['images', 'common'])
  const { images, loading, error, upload, remove } = useImages()
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<(typeof images)[number] | null>(null)
  const [uploading, setUploading] = useState(false)

  async function handleUpload(file: File) {
    setUploading(true)
    try {
      await upload(file)
      setShowUploadModal(false)
    } catch {
      // Error already handled in hook
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await remove(deleteTarget.id)
      setDeleteTarget(null)
    } catch {
      // Error already handled in hook
    }
  }

  return (
    <div className="images-page">
      {/* Header */}
      <div className="images-page-header">
        <div className="images-page-header-content">
          <h1 className="images-page-title">{t('pageTitle')}</h1>
          <p className="images-page-subtitle">{t('pageSubtitle')}</p>

          <div className="images-page-actions">
            <button
              className="btn btn--primary"
              onClick={() => setShowUploadModal(true)}
              disabled={loading || uploading}
            >
              {t('createNew')}
            </button>
            <button
              className="btn btn--secondary"
              onClick={onBack}
              disabled={loading || uploading}
            >
              {t('common:back')}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="images-page-content">
        {loading && <div className="images-page-loading">{t('common:loading')}</div>}

        {error && (
          <div className="images-page-error">
            <strong>{t('common:error')}:</strong> {error}
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
          message={t('deleteConfirm', { name: deleteTarget.fileName })}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
