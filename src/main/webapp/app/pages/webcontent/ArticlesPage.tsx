import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ArticleResponse } from '../../types/article.ts'
import { useArticles } from '../../hooks/useArticles.ts'
import { useImages } from '../../hooks/useImages.ts'
import ArticleList from '../../components/webcontent/ArticleList.tsx'
import ArticleDetailsModal from '../../components/webcontent/ArticleDetailsModal.tsx'
import ArticleFormModal from '../../components/webcontent/ArticleFormModal.tsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.tsx'
import type { FormData } from '../../components/webcontent/ArticleForm.tsx'
import './ArticlesPage.css'

type ModalState =
  | null
  | { mode: 'create' }
  | { mode: 'edit'; article: ArticleResponse }

interface Props {
  onBack: () => void
}

export default function ArticlesPage({ onBack }: Props) {
  const { t } = useTranslation(['articles', 'common'])
  const { articles, loading: articlesLoading, error: articlesError, create, update, remove } = useArticles()
  const { images, loading: imagesLoading } = useImages()
  const [selectedArticle, setSelectedArticle] = useState<ArticleResponse | null>(null)
  const [modal, setModal] = useState<ModalState>(null)
  const [deleteTarget, setDeleteTarget] = useState<ArticleResponse | null>(null)
  const [saving, setSaving] = useState(false)

  const loading = articlesLoading || imagesLoading
  const error = articlesError

  async function handleSave(data: FormData) {
    setSaving(true)
    try {
      if (data.mode === 'edit' && modal?.mode === 'edit') {
        await update((modal as { mode: 'edit'; article: ArticleResponse }).article.id, {
          title: data.title,
          content: data.content,
          state: (data as typeof data & { state: string }).state,
          language: data.language,
          imageIds: data.imageIds,
        })
      } else {
        await create({
          title: data.title,
          content: data.content,
          page: (data as typeof data & { page: string }).page,
          language: data.language,
          imageIds: data.imageIds,
        })
      }
      setModal(null)
    } catch {
      // Error is already handled in hook
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await remove(deleteTarget.id)
      setDeleteTarget(null)
    } catch {
      // Error is already handled in hook
    }
  }

  return (
    <div className="articles-page">
      {/* Header */}
      <div className="articles-page-header">
        <div className="articles-page-header-content">
          <h1 className="articles-page-title">{t('pageTitle')}</h1>
          <p className="articles-page-subtitle">{t('pageSubtitle')}</p>

          <div className="articles-page-actions">
            <button
              className="btn btn--primary"
              onClick={() => setModal({ mode: 'create' })}
              disabled={loading || saving}
            >
              {t('createNew')}
            </button>
            <button
              className="btn btn--secondary"
              onClick={onBack}
              disabled={loading || saving}
            >
              {t('common:back')}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="articles-page-content">
        {loading && <div className="articles-page-loading">{t('common:loading')}</div>}

        {error && (
          <div className="articles-page-error">
            <strong>{t('common:error')}:</strong> {error}
          </div>
        )}

        {!loading && !error && (
          <ArticleList
            articles={articles}
            onView={setSelectedArticle}
            onEdit={(article) => setModal({ mode: 'edit', article })}
            onDelete={setDeleteTarget}
          />
        )}
      </div>

      {selectedArticle && (
        <ArticleDetailsModal
          article={selectedArticle}
          onEdit={(article) => {
            setSelectedArticle(null)
            setModal({ mode: 'edit', article })
          }}
          onDelete={(article) => {
            setSelectedArticle(null)
            setDeleteTarget(article)
          }}
          onClose={() => setSelectedArticle(null)}
        />
      )}

      {modal !== null && (
        <ArticleFormModal
          initial={modal.mode === 'edit' ? modal.article : null}
          onSave={handleSave}
          onCancel={() => setModal(null)}
          saving={saving}
          availableImages={images}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={t('deleteConfirm', { title: deleteTarget.title })}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
