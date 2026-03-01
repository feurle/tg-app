import { useState } from 'react'
import type { ArticleResponse, ArticleState, PageType, Language, ImageResponse } from '../../types/article.ts'
import './ArticleForm.css'

export interface CreateFormData {
  mode: 'create'
  title: string
  content: string
  page: PageType
  language: Language
  imageIds: number[]
}

export interface EditFormData {
  mode: 'edit'
  title: string
  content: string
  state: ArticleState
  language: Language
  imageIds: number[]
}

export type FormData = CreateFormData | EditFormData

interface Props {
  initial: ArticleResponse | null  // null = create mode
  onSave: (data: FormData) => void
  onCancel: () => void
  saving: boolean
  availableImages: ImageResponse[]
}

export default function ArticleForm({ initial, onSave, onCancel, saving, availableImages }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [page, setPage] = useState<PageType>(initial?.page ?? 'HOME')
  const [language, setLanguage] = useState<Language>(initial?.language ?? 'GERMAN')
  const [state, setState] = useState<ArticleState>(initial?.state ?? 'CREATED')
  const [imageIds, setImageIds] = useState<number[]>(initial?.images.map(img => img.id) ?? [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (initial) {
      onSave({ mode: 'edit', title, content, state, language, imageIds })
    } else {
      onSave({ mode: 'create', title, content, page, language, imageIds })
    }
  }

  function toggleImageSelection(imageId: number) {
    setImageIds(prev =>
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    )
  }

  return (
    <form className="article-form" onSubmit={handleSubmit}>
      <div className="article-form__field">
        <label htmlFor="af-title">Titel</label>
        <input
          id="af-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />
      </div>

      {!initial && (
        <div className="article-form__field">
          <label htmlFor="af-page">Seite</label>
          <select id="af-page" value={page} onChange={(e) => setPage(e.target.value as PageType)}>
            <option value="HOME">Home</option>
            <option value="TEASER">Teaser</option>
            <option value="NEWS">News</option>
          </select>
        </div>
      )}

      <div className="article-form__field">
        <label htmlFor="af-language">Sprache</label>
        <select id="af-language" value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
          <option value="GERMAN">Deutsch</option>
          <option value="ENGLISH">English</option>
          <option value="SWEDISH">Svenska</option>
          <option value="RUSSIAN">Русский</option>
        </select>
      </div>

      {initial && (
        <div className="article-form__field">
          <label htmlFor="af-state">Status</label>
          <select id="af-state" value={state} onChange={(e) => setState(e.target.value as ArticleState)}>
            <option value="CREATED">Erstellt</option>
            <option value="PUBLISHED">Publiziert</option>
            <option value="CLOSED">Geschlossen</option>
          </select>
        </div>
      )}

      <div className="article-form__field">
        <label htmlFor="af-content">Inhalt</label>
        <textarea
          id="af-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          required
        />
      </div>

      {availableImages.length > 0 && (
        <div className="article-form__field">
          <label>Bilder</label>
          <div className="article-form__images">
            {availableImages.map(image => (
              <label key={image.id} className="article-form__image-option">
                <input
                  type="checkbox"
                  checked={imageIds.includes(image.id)}
                  onChange={() => toggleImageSelection(image.id)}
                  disabled={saving}
                />
                <span className="article-form__image-label">{image.fileName}</span>
              </label>
            ))}
          </div>

          {imageIds.length > 0 && (
            <div className="article-form__preview">
              <p className="article-form__preview-title">Vorschau ({imageIds.length} ausgewählt)</p>
              <div className="article-form__preview-grid">
                {availableImages
                  .filter(img => imageIds.includes(img.id))
                  .map(image => (
                    <div key={image.id} className="article-form__preview-item">
                      <img
                        src={`/api/webcontent/images/${image.id}/download`}
                        alt={image.fileName}
                        title={image.fileName}
                      />
                      <p className="article-form__preview-name">{image.fileName}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="article-form__actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={saving}>
          Abbrechen
        </button>
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? 'Speichern…' : 'Speichern'}
        </button>
      </div>
    </form>
  )
}
