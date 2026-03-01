import { useTranslation } from 'react-i18next'
import type { ArticleResponse, ImageResponse } from '../../types/article.ts'
import ArticleForm, { type FormData } from './ArticleForm.tsx'
import './ArticleFormModal.css'

interface Props {
  initial: ArticleResponse | null  // null = create mode
  onSave: (data: FormData) => void
  onCancel: () => void
  saving: boolean
  availableImages: ImageResponse[]
}

export default function ArticleFormModal({ initial, onSave, onCancel, saving, availableImages }: Props) {
  const { t } = useTranslation('articles')
  const title = initial ? t('modal.editTitle') : t('modal.createTitle')

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>{title}</h2>
          <button className="modal__close" onClick={onCancel} aria-label="Schliessen">×</button>
        </div>
        <div className="modal__body">
          <ArticleForm initial={initial} onSave={onSave} onCancel={onCancel} saving={saving} availableImages={availableImages} />
        </div>
      </div>
    </div>
  )
}
