import type { User, CreateUserData, UpdateUserData } from '../../types/user'
import UserForm from './UserForm'
import './UserFormModal.css'

interface Props {
  initial: User | null  // null = create mode
  onSave: (data: CreateUserData | UpdateUserData) => void
  onCancel: () => void
  saving: boolean
}

export default function UserFormModal({ initial, onSave, onCancel, saving }: Props) {
  const title = initial ? 'Benutzer bearbeiten' : 'Neuer Benutzer'

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>{title}</h2>
          <button className="modal__close" onClick={onCancel} aria-label="Schliessen">×</button>
        </div>
        <div className="modal__body">
          <UserForm initial={initial} onSave={onSave} onCancel={onCancel} saving={saving} />
        </div>
      </div>
    </div>
  )
}
