import { useTranslation } from 'react-i18next'
import type { Customer } from '../../types/customer'
import type { CreateCustomerData, UpdateCustomerData } from '../../types/customer'
import CustomerForm from './CustomerForm'
import './CustomerFormModal.css'

interface Props {
  initial: Customer | null  // null = create mode
  onSave: (data: CreateCustomerData | UpdateCustomerData) => void
  onCancel: () => void
  saving: boolean
}

export default function CustomerFormModal({ initial, onSave, onCancel, saving }: Props) {
  const { t } = useTranslation('customers')
  const title = initial ? t('modal.editTitle') : t('modal.createTitle')

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>{title}</h2>
          <button className="modal__close" onClick={onCancel} aria-label="Schliessen">×</button>
        </div>
        <div className="modal__body">
          <CustomerForm initial={initial} onSave={onSave} onCancel={onCancel} saving={saving} />
        </div>
      </div>
    </div>
  )
}
