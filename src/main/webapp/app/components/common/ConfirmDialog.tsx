import { useTranslation } from 'react-i18next'
import './ConfirmDialog.css'

interface Props {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ message, onConfirm, onCancel }: Props) {
  const { t } = useTranslation('common')

  return (
    <div className="confirm-backdrop" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <p>{message}</p>
        <div className="confirm-dialog__actions">
          <button className="btn btn--secondary" onClick={onCancel}>{t('cancel')}</button>
          <button className="btn btn--danger" onClick={onConfirm}>{t('delete')}</button>
        </div>
      </div>
    </div>
  )
}
