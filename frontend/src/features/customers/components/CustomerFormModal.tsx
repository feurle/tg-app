import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Customer, CustomerFormData } from '../types';

interface Props {
  initial: Customer | null;
  onSave: (data: CustomerFormData) => void;
  onCancel: () => void;
  saving: boolean;
}

const EMPTY: CustomerFormData = {
  firstName: '', lastName: '', email: '',
  phone: '', address: '', city: '', state: '', zip: '', country: '',
};

function toFormData(c: Customer): CustomerFormData {
  return {
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email,
    phone: c.phone ?? '',
    address: c.address ?? '',
    city: c.city ?? '',
    state: c.state ?? '',
    zip: c.zip ?? '',
    country: c.country ?? '',
  };
}

export default function CustomerFormModal({ initial, onSave, onCancel, saving }: Props) {
  const [form, setForm] = useState<CustomerFormData>(initial ? toFormData(initial) : EMPTY);
  const { t } = useTranslation();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  const isEdit = initial !== null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {isEdit ? t('customer.editHeading') : t('customer.newHeading')}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <Field label={t('customer.form.firstName')} name="firstName" value={form.firstName} onChange={handleChange} required />
            <Field label={t('customer.form.lastName')} name="lastName" value={form.lastName} onChange={handleChange} required />
          </div>
          <Field label={t('customer.form.email')} name="email" value={form.email} onChange={handleChange} required type="email" />
          <Field label={t('customer.form.phone')} name="phone" value={form.phone} onChange={handleChange} />
          <Field label={t('customer.form.address')} name="address" value={form.address} onChange={handleChange} />
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <Field label={t('customer.form.zip')} name="zip" value={form.zip} onChange={handleChange} />
            <Field label={t('customer.form.city')} name="city" value={form.city} onChange={handleChange} />
          </div>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <Field label={t('customer.form.state')} name="state" value={form.state} onChange={handleChange} />
            <Field label={t('customer.form.country')} name="country" value={form.country} onChange={handleChange} />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onCancel} disabled={saving} className="btn-secondary">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={saving} className="btn-accent">
              {saving ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  type?: string;
}

function Field({ label, name, value, onChange, required, type = 'text' }: FieldProps) {
  return (
    <div className="form-group" style={{ marginBottom: '16px' }}>
      <label className="form-label">{label}</label>
      <input
        name={name}
        type={type}
        className="form-input"
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
}
