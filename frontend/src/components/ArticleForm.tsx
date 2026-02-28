import { useState } from 'react'
import type { ArticleResponse, ArticleState, PageType } from '../types/article'
import './ArticleForm.css'

export interface CreateFormData {
  mode: 'create'
  title: string
  content: string
  page: PageType
}

export interface EditFormData {
  mode: 'edit'
  title: string
  content: string
  state: ArticleState
}

export type FormData = CreateFormData | EditFormData

interface Props {
  initial: ArticleResponse | null  // null = create mode
  onSave: (data: FormData) => void
  onCancel: () => void
  saving: boolean
}

export default function ArticleForm({ initial, onSave, onCancel, saving }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [page, setPage] = useState<PageType>(initial?.page ?? 'HOME')
  const [state, setState] = useState<ArticleState>(initial?.state ?? 'CREATED')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (initial) {
      onSave({ mode: 'edit', title, content, state })
    } else {
      onSave({ mode: 'create', title, content, page })
    }
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
