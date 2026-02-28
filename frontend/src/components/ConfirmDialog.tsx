import './ConfirmDialog.css'

interface Props {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ message, onConfirm, onCancel }: Props) {
  return (
    <div className="confirm-backdrop" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <p>{message}</p>
        <div className="confirm-dialog__actions">
          <button className="btn btn--secondary" onClick={onCancel}>Abbrechen</button>
          <button className="btn btn--danger" onClick={onConfirm}>Löschen</button>
        </div>
      </div>
    </div>
  )
}
