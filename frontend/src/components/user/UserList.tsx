import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import type { User } from '../../types/user'
import './UserList.css'

interface Props {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function UserList({ users, onEdit, onDelete }: Props) {
  if (users.length === 0) {
    return <p className="user-list__empty">Keine Benutzer vorhanden.</p>
  }

  return (
    <table className="user-list">
      <thead>
        <tr>
          <th>ID</th>
          <th>Benutzername</th>
          <th>Email</th>
          <th>Name</th>
          <th>Rollen</th>
          <th>Status</th>
          <th>Erstellt am</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.id}</td>
            <td>{user.login}</td>
            <td>{user.email}</td>
            <td>
              {user.firstName || user.lastName
                ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                : '—'}
            </td>
            <td>
              <div className="user-list__authorities">
                {user.authorities.map((auth) => (
                  <span key={auth} className="user-list__badge">
                    {auth}
                  </span>
                ))}
              </div>
            </td>
            <td>
              <span className={user.activated ? 'user-list__status-active' : 'user-list__status-inactive'}>
                {user.activated ? 'Aktiv' : 'Inaktiv'}
              </span>
            </td>
            <td>{formatDate(user.createdDate)}</td>
            <td className="user-list__actions">
              <button
                className="user-list__action-btn user-list__action-btn--edit"
                onClick={() => onEdit(user)}
                title="Bearbeiten"
                aria-label="Benutzer bearbeiten"
              >
                <PencilIcon className="user-list__action-icon" />
              </button>
              <button
                className="user-list__action-btn user-list__action-btn--delete"
                onClick={() => onDelete(user)}
                title="Löschen"
                aria-label="Benutzer löschen"
              >
                <TrashIcon className="user-list__action-icon" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
