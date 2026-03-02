import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Customer, CreateCustomerData, UpdateCustomerData } from '../../types/customer'
import './CustomerForm.css'

interface Props {
  initial: Customer | null  // null = create mode
  onSave: (data: CreateCustomerData | UpdateCustomerData) => void
  onCancel: () => void
  saving: boolean
}

export default function CustomerForm({ initial, onSave, onCancel, saving }: Props) {
  const { t } = useTranslation(['customers', 'common'])
  const [firstName, setFirstName] = useState(initial?.firstName ?? '')
  const [lastName, setLastName] = useState(initial?.lastName ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [address, setAddress] = useState(initial?.address ?? '')
  const [city, setCity] = useState(initial?.city ?? '')
  const [state, setState] = useState(initial?.state ?? '')
  const [zip, setZip] = useState(initial?.zip ?? '')
  const [country, setCountry] = useState(initial?.country ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      firstName,
      lastName,
      email,
      phone: phone || undefined,
      address: address || undefined,
      city: city || undefined,
      state: state || undefined,
      zip: zip || undefined,
      country: country || undefined,
    })
  }

  return (
    <form className="customer-form" onSubmit={handleSubmit}>
      <div className="customer-form__row">
        <div className="customer-form__field">
          <label htmlFor="cf-firstName">{t('fields.firstName')} *</label>
          <input
            id="cf-firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            autoFocus
            disabled={saving}
          />
        </div>

        <div className="customer-form__field">
          <label htmlFor="cf-lastName">{t('fields.lastName')} *</label>
          <input
            id="cf-lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            disabled={saving}
          />
        </div>
      </div>

      <div className="customer-form__field">
        <label htmlFor="cf-email">{t('fields.email')} *</label>
        <input
          id="cf-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={saving}
        />
      </div>

      <div className="customer-form__field">
        <label htmlFor="cf-phone">{t('fields.phone')}</label>
        <input
          id="cf-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={saving}
        />
      </div>

      <div className="customer-form__field">
        <label htmlFor="cf-address">{t('fields.address')}</label>
        <input
          id="cf-address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={saving}
        />
      </div>

      <div className="customer-form__row">
        <div className="customer-form__field">
          <label htmlFor="cf-city">{t('fields.city')}</label>
          <input
            id="cf-city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={saving}
          />
        </div>

        <div className="customer-form__field">
          <label htmlFor="cf-state">{t('fields.state')}</label>
          <input
            id="cf-state"
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            disabled={saving}
          />
        </div>

        <div className="customer-form__field">
          <label htmlFor="cf-zip">{t('fields.zip')}</label>
          <input
            id="cf-zip"
            type="text"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            disabled={saving}
          />
        </div>
      </div>

      <div className="customer-form__field">
        <label htmlFor="cf-country">{t('fields.country')}</label>
        <input
          id="cf-country"
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          disabled={saving}
        />
      </div>

      <div className="customer-form__actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={saving}>
          {t('common:cancel')}
        </button>
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? t('common:saving') : t('common:save')}
        </button>
      </div>
    </form>
  )
}
