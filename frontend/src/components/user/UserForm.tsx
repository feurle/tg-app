import { useState } from 'react'
import type { User, CreateUserData, UpdateUserData } from '../../types/user'
import './UserForm.css'

interface Props {
  initial: User | null  // null = create mode
  onSave: (data: CreateUserData | UpdateUserData) => void
  onCancel: () => void
  saving: boolean
}

const AVAILABLE_AUTHORITIES = ['ROLE_USER', 'ROLE_ADMIN']

export default function UserForm({ initial, onSave, onCancel, saving }: Props) {
  const [email, setEmail] = useState(initial?.email ?? '')
  const [login, setLogin] = useState(initial?.login ?? '')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState(initial?.firstName ?? '')
  const [lastName, setLastName] = useState(initial?.lastName ?? '')
  const [langKey, setLangKey] = useState(initial?.langKey ?? 'de')
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '')
  const [activated, setActivated] = useState(initial?.activated ?? false)
  const [selectedAuthorities, setSelectedAuthorities] = useState<Set<string>>(
    new Set(initial?.authorities ?? [])
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (initial) {
      // Update mode
      const updateData: UpdateUserData = {
        email,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        langKey: langKey || undefined,
        imageUrl: imageUrl || undefined,
        activated,
        authorities: Array.from(selectedAuthorities),
      }
      if (password) {
        updateData.password = password
      }
      onSave(updateData)
    } else {
      // Create mode
      if (!password) {
        alert('Passwort ist erforderlich')
        return
      }
      onSave({
        login,
        password,
        email,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        langKey: langKey || undefined,
        imageUrl: imageUrl || undefined,
        authorities: Array.from(selectedAuthorities),
      } as CreateUserData)
    }
  }

  function toggleAuthority(authority: string) {
    const newAuthorities = new Set(selectedAuthorities)
    if (newAuthorities.has(authority)) {
      newAuthorities.delete(authority)
    } else {
      newAuthorities.add(authority)
    }
    setSelectedAuthorities(newAuthorities)
  }

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <div className="user-form__row">
        <div className="user-form__field">
          <label htmlFor="uf-email">Email *</label>
          <input
            id="uf-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={saving}
          />
        </div>

        {!initial && (
          <div className="user-form__field">
            <label htmlFor="uf-login">Benutzername *</label>
            <input
              id="uf-login"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              disabled={saving}
            />
          </div>
        )}
      </div>

      <div className="user-form__field">
        <label htmlFor="uf-password">Passwort {!initial && '*'}</label>
        <input
          id="uf-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={initial ? 'Leer lassen zum Behalten des aktuellen Passworts' : ''}
          required={!initial}
          disabled={saving}
        />
      </div>

      <div className="user-form__row">
        <div className="user-form__field">
          <label htmlFor="uf-firstName">Vorname</label>
          <input
            id="uf-firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={saving}
          />
        </div>

        <div className="user-form__field">
          <label htmlFor="uf-lastName">Nachname</label>
          <input
            id="uf-lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={saving}
          />
        </div>
      </div>

      <div className="user-form__row">
        <div className="user-form__field">
          <label htmlFor="uf-langKey">Sprache</label>
          <select
            id="uf-langKey"
            value={langKey}
            onChange={(e) => setLangKey(e.target.value)}
            disabled={saving}
          >
            <option value="de">Deutsch</option>
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </div>

        <div className="user-form__field">
          <label htmlFor="uf-imageUrl">Profilbild URL</label>
          <input
            id="uf-imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={saving}
          />
        </div>
      </div>

      {initial && (
        <div className="user-form__field">
          <label>
            <input
              type="checkbox"
              checked={activated}
              onChange={(e) => setActivated(e.target.checked)}
              disabled={saving}
            />
            <span>Aktiviert</span>
          </label>
        </div>
      )}

      <div className="user-form__field">
        <label>Rollen</label>
        <div className="user-form__authorities">
          {AVAILABLE_AUTHORITIES.map((authority) => (
            <label key={authority} className="user-form__authority">
              <input
                type="checkbox"
                checked={selectedAuthorities.has(authority)}
                onChange={() => toggleAuthority(authority)}
                disabled={saving}
              />
              <span>{authority}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="user-form__actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={saving}>
          Abbrechen
        </button>
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? 'Speichern…' : 'Speichern'}
        </button>
      </div>
    </form>
  )
}
