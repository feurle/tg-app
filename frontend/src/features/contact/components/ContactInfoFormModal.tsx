import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ContactInfoResponse, ContactInfoFormData, OfficeHour } from '../types';

interface Props {
  initial: ContactInfoResponse | null;
  primaryTaken: boolean;
  onSave: (data: ContactInfoFormData) => void;
  onCancel: () => void;
  saving: boolean;
}

const EMPTY: ContactInfoFormData = {
  name: '', primary: false, phone: '', email: '', street: '', city: '', zip: '', officeHours: [],
};

function toFormData(c: ContactInfoResponse): ContactInfoFormData {
  return {
    name: c.name,
    primary: c.primary,
    phone: c.phone,
    email: c.email,
    street: c.street,
    city: c.city,
    zip: c.zip,
    officeHours: c.officeHours.map((oh) => ({ ...oh })),
  };
}

export default function ContactInfoFormModal({ initial, primaryTaken, onSave, onCancel, saving }: Props) {
  const [form, setForm] = useState<ContactInfoFormData>(initial ? toFormData(initial) : EMPTY);
  const { t } = useTranslation();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleHourChange(index: number, field: keyof OfficeHour, value: string) {
    setForm((prev) => ({
      ...prev,
      officeHours: prev.officeHours.map((oh, i) =>
        i === index ? { ...oh, [field]: value } : oh
      ),
    }));
  }

  function addHour() {
    setForm((prev) => ({
      ...prev,
      officeHours: [...prev.officeHours, { label: '', hours: '' }],
    }));
  }

  function removeHour(index: number) {
    setForm((prev) => ({
      ...prev,
      officeHours: prev.officeHours.filter((_, i) => i !== index),
    }));
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
          {isEdit ? t('contactInfoAdmin.editHeading') : t('contactInfoAdmin.newHeading')}
        </h2>

        <form onSubmit={handleSubmit}>
          <Field label={t('contactInfoAdmin.form.name')} name="name" value={form.name} onChange={handleChange} required />
          <div className="form-group" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              id="primary-checkbox"
              type="checkbox"
              checked={form.primary}
              disabled={primaryTaken && !form.primary}
              onChange={(e) => setForm((prev) => ({ ...prev, primary: e.target.checked }))}
            />
            <label htmlFor="primary-checkbox" className="form-label" style={{ marginBottom: 0, cursor: primaryTaken && !form.primary ? 'not-allowed' : 'pointer', opacity: primaryTaken && !form.primary ? 0.5 : 1 }}>
              {t('contactInfoAdmin.form.primary')}
            </label>
          </div>
          <Field label={t('contactInfoAdmin.form.phone')} name="phone" value={form.phone} onChange={handleChange} required />
          <Field label={t('contactInfoAdmin.form.email')} name="email" value={form.email} onChange={handleChange} required type="email" />
          <Field label={t('contactInfoAdmin.form.street')} name="street" value={form.street} onChange={handleChange} required />
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <Field label={t('contactInfoAdmin.form.zip')} name="zip" value={form.zip} onChange={handleChange} required />
            <Field label={t('contactInfoAdmin.form.city')} name="city" value={form.city} onChange={handleChange} required />
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">{t('contactInfoAdmin.form.officeHours')}</label>
            {form.officeHours.map((oh, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                <input
                  className="form-input"
                  placeholder={t('contactInfoAdmin.form.hourLabel')}
                  value={oh.label}
                  onChange={(e) => handleHourChange(i, 'label', e.target.value)}
                  style={{ flex: 1 }}
                />
                <input
                  className="form-input"
                  placeholder={t('contactInfoAdmin.form.hourTime')}
                  value={oh.hours}
                  onChange={(e) => handleHourChange(i, 'hours', e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={() => removeHour(i)} className="icon-btn danger">
                  🗑
                </button>
              </div>
            ))}
            <button type="button" onClick={addHour} className="btn-secondary" style={{ marginTop: '4px' }}>
              + {t('contactInfoAdmin.form.addHour')}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
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
