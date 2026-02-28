import type { ArticleResponse } from '../types/article'
import ArticleForm, { type FormData } from './ArticleForm'
import './ArticleFormModal.css'

interface Props {
  initial: ArticleResponse | null  // null = create mode
  onSave: (data: FormData) => void
  onCancel: () => void
  saving: boolean
}

export default function ArticleFormModal({ initial, onSave, onCancel, saving }: Props) {
  const title = initial ? 'Artikel bearbeiten' : 'Neuer Artikel'

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>{title}</h2>
          <button className="modal__close" onClick={onCancel} aria-label="Schliessen">×</button>
        </div>
        <div className="modal__body">
          <ArticleForm initial={initial} onSave={onSave} onCancel={onCancel} saving={saving} />
        </div>
      </div>
    </div>
  )
}
