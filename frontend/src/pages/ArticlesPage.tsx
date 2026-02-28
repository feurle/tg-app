import { useEffect, useState } from 'react'
import type { ArticleResponse, ImageResponse } from '../types/article'
import ArticleList from '../components/ArticleList'
import ArticleDetailsModal from '../components/ArticleDetailsModal'
import ArticleFormModal from '../components/ArticleFormModal'
import ConfirmDialog from '../components/ConfirmDialog'
import type { FormData } from '../components/ArticleForm'
import './ArticlesPage.css'

type ModalState =
  | null
  | { mode: 'create' }
  | { mode: 'edit'; article: ArticleResponse }

interface Props {
  onBack: () => void
}

export default function ArticlesPage({ onBack }: Props) {
  const [articles, setArticles] = useState<ArticleResponse[]>([])
  const [images, setImages] = useState<ImageResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<ArticleResponse | null>(null)
  const [modal, setModal] = useState<ModalState>(null)
  const [deleteTarget, setDeleteTarget] = useState<ArticleResponse | null>(null)
  const [saving, setSaving] = useState(false)

  function fetchArticles() {
    return fetch('/api/webcontent/articles')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<ArticleResponse[]>
      })
      .then(setArticles)
      .catch((err: Error) => setError(err.message))
  }

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
    Promise.all([fetchArticles(), fetchImages()]).finally(() => setLoading(false))
  }, [])

  function handleSave(data: FormData) {
    setSaving(true)
    const isEdit = data.mode === 'edit' && modal?.mode === 'edit'
    const url = isEdit
      ? `/api/webcontent/articles/${(modal as { mode: 'edit'; article: ArticleResponse }).article.id}`
      : '/api/webcontent/articles'

    const body =
      data.mode === 'create'
        ? { title: data.title, content: data.content, page: data.page, imageIds: data.imageIds }
        : {
            title: data.title,
            content: data.content,
            state: data.state,
            imageIds: data.imageIds,
          }

    fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        setModal(null)
        return fetchArticles()
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setSaving(false))
  }

  function handleDelete() {
    if (!deleteTarget) return
    fetch(`/api/webcontent/articles/${deleteTarget.id}`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        setDeleteTarget(null)
        return fetchArticles()
      })
      .catch((err: Error) => setError(err.message))
  }

  return (
    <div className="articles-page">
      <button className="articles-page__back" onClick={onBack}>← Zurück</button>

      <div className="articles-page__header">
        <h1>Artikel</h1>
        <button className="btn btn--primary" onClick={() => setModal({ mode: 'create' })}>
          + Neuer Artikel
        </button>
      </div>

      {loading && <p className="articles-page__status">Laden…</p>}
      {error && <p className="articles-page__status articles-page__status--error">Fehler: {error}</p>}
      {!loading && !error && (
        <ArticleList
          articles={articles}
          onView={setSelectedArticle}
          onEdit={(article) => setModal({ mode: 'edit', article })}
          onDelete={setDeleteTarget}
        />
      )}

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
          message={`Artikel „${deleteTarget.title}" wirklich löschen?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
