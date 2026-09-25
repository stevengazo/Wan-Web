import { useState, type FormEvent } from 'react'
import { Avatar } from '@/components/atoms/Avatar'
import { Button } from '@/components/atoms/Button'
import { PasswordField } from '@/components/molecules/PasswordField'
import { formatDateTime } from '@/lib/format'
import type { UserListItem, UserRole } from '@/services/api'
import { roleLabels } from './roleLabels'

interface UserListProps {
  users: UserListItem[]
  onChangeRole: (user: UserListItem, role: UserRole) => void
  onResetPassword: (user: UserListItem, password: string) => void
  onDelete: (user: UserListItem) => void
}

export function UserList({ users, onChangeRole, onResetPassword, onDelete }: UserListProps) {
  return (
    <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 dark:divide-white/10 dark:border-white/10">
      {users.map((user) => (
        <UserRow key={user.id} user={user} onChangeRole={onChangeRole} onResetPassword={onResetPassword} onDelete={onDelete} />
      ))}
    </ul>
  )
}

function UserRow({ user, onChangeRole, onResetPassword, onDelete }: { user: UserListItem } & Omit<UserListProps, 'users'>) {
  const [resetting, setResetting] = useState(false)
  const [password, setPassword] = useState('')

  const submitPassword = (event: FormEvent) => {
    event.preventDefault()
    onResetPassword(user, password)
    setPassword('')
    setResetting(false)
  }

  return (
    <li className="px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <Avatar name={user.displayName} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 truncate font-medium">
            {user.displayName}
            {user.isCurrent && <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-white/10 dark:text-zinc-300">Tú</span>}
          </p>
          <p className="truncate text-sm text-zinc-500 dark:text-zinc-400" title={`Desde ${formatDateTime(user.createdAt)}`}>
            {user.email}
          </p>
        </div>
        <select
          aria-label={`Rol de ${user.displayName}`}
          value={user.role}
          onChange={(e) => onChangeRole(user, e.target.value as UserRole)}
          className="min-h-10 rounded-lg border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          {Object.entries(roleLabels).map(([value, { label }]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => setResetting(!resetting)} className="min-h-10 rounded-lg px-3 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-white/10">
          Contraseña
        </button>
        {!user.isCurrent && (
          <button type="button" onClick={() => onDelete(user)} className="min-h-10 rounded-lg px-3 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">
            Eliminar
          </button>
        )}
      </div>
      {resetting && (
        <form onSubmit={submitPassword} className="mt-3 flex items-end gap-2 pl-12">
          <div className="flex-1">
            <PasswordField label="Contraseña nueva" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" disabled={password.length < 8}>
            Cambiar
          </Button>
        </form>
      )}
    </li>
  )
}
