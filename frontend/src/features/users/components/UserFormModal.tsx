import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CreateUserData, UpdateUserData, User } from '../types';

const KNOWN_AUTHORITIES = ['ROLE_ADMIN', 'ROLE_USER'];

interface CreateProps {
  mode: 'create';
  onSave: (data: CreateUserData) => void;
  onCancel: () => void;
  saving: boolean;
}

interface EditProps {
  mode: 'edit';
  user: User;
  onSave: (data: UpdateUserData) => void;
  onCancel: () => void;
  saving: boolean;
}

type Props = CreateProps | EditProps;

interface FormState {
  login: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  langKey: string;
  imageUrl: string;
  activated: boolean;
  authorities: string[];
}

function initForm(user?: User): FormState {
  if (!user) {
    return {
      login: '', password: '', email: '', firstName: '', lastName: '',
      langKey: 'de', imageUrl: '', activated: false, authorities: [],
    };
  }
  return {
    login: user.login,
    password: '',
    email: user.email,
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    langKey: user.langKey,
    imageUrl: user.imageUrl ?? '',
    activated: user.activated,
    authorities: [...user.authorities],
  };
}

export default function UserFormModal(props: Props) {
  const isEdit = props.mode === 'edit';
  const [form, setForm] = useState<FormState>(
    isEdit ? initForm((props as EditProps).user) : initForm()
  );
  const { t } = useTranslation();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  function toggleAuthority(role: string) {
    setForm((prev) => ({
      ...prev,
      authorities: prev.authorities.includes(role)
        ? prev.authorities.filter((r) => r !== role)
        : [...prev.authorities, role],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEdit) {
      (props as EditProps).onSave({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        langKey: form.langKey,
        imageUrl: form.imageUrl,
        activated: form.activated,
        authorities: form.authorities,
      });
    } else {
      (props as CreateProps).onSave({
        login: form.login,
        password: form.password,
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        langKey: form.langKey,
        imageUrl: form.imageUrl,
        authorities: form.authorities,
      });
    }
  }

  return (
    <div style={overlay} onClick={props.onCancel}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: '1rem' }}>
          {isEdit
            ? t('user.editHeading', { login: (props as EditProps).user.login })
            : t('user.newHeading')}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {!isEdit && (
            <Field label={t('user.form.login')} name="login" value={form.login} onChange={handleChange} required />
          )}

          <div style={row}>
            <Field label={t('user.form.firstName')} name="firstName" value={form.firstName} onChange={handleChange} />
            <Field label={t('user.form.lastName')} name="lastName" value={form.lastName} onChange={handleChange} />
          </div>

          <Field label={t('user.form.email')} name="email" value={form.email} onChange={handleChange} required type="email" />

          <Field
            label={isEdit ? t('user.form.passwordEdit') : t('user.form.password')}
            name="password"
            value={form.password}
            onChange={handleChange}
            required={!isEdit}
            type="password"
          />

          <div style={row}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <label style={labelStyle}>{t('user.form.language')}</label>
              <select name="langKey" value={form.langKey} onChange={handleChange} style={selectStyle}>
                <option value="de">Deutsch</option>
                <option value="en">English</option>
                <option value="sv">Svenska</option>
                <option value="ru">Русский</option>
              </select>
            </div>
            <Field label={t('user.form.imageUrl')} name="imageUrl" value={form.imageUrl} onChange={handleChange} />
          </div>

          <div>
            <label style={labelStyle}>{t('user.form.roles')}</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '4px' }}>
              {KNOWN_AUTHORITIES.map((role) => (
                <label key={role} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.authorities.includes(role)}
                    onChange={() => toggleAuthority(role)}
                  />
                  {role}
                </label>
              ))}
            </div>
          </div>

          {isEdit && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="activated"
                checked={form.activated}
                onChange={handleChange}
              />
              {t('user.form.activated')}
            </label>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" onClick={props.onCancel} disabled={props.saving} className="btn-secondary">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={props.saving} className="btn-accent">
              {props.saving ? t('common.saving') : t('common.save')}
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
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <label style={labelStyle}>{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        style={{ padding: '0.35rem 0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
      />
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
};

const modal: React.CSSProperties = {
  background: '#fff', padding: '2rem', borderRadius: '8px',
  width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto',
};

const row: React.CSSProperties = { display: 'flex', gap: '0.75rem' };

const labelStyle: React.CSSProperties = { fontSize: '0.8rem', fontWeight: 500, marginBottom: '2px' };

const selectStyle: React.CSSProperties = {
  padding: '0.35rem 0.5rem', border: '1px solid #ccc', borderRadius: '4px',
};
