import { AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { PlusIcon } from '@/components/atoms/icons'
import { ConfirmSheet } from '@/components/molecules/ConfirmSheet'
import { PageHeader } from '@/components/organisms/PageHeader'
import { CreateUserForm } from '@/components/organisms/users/CreateUserForm'
import { roleLabels } from '@/components/organisms/users/roleLabels'
import { UserList } from '@/components/organisms/users/UserList'
import { ApiError, useCreateUser, useDeleteUser, useResetUserMfa, useResetUserPassword, useUpdateUser, useUsers, type UserListItem } from '@/services/api'

/** Contenedor: conecta los datos de usuarios con los organismos que los muestran. */
export function UsersPage() {
  const { data: users, isPending, error } = useUsers()
  const create = useCreateUser()
  const update = useUpdateUser()
  const resetPassword = useResetUserPassword()
  const resetMfa = useResetUserMfa()
  const remove = useDeleteUser()
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<UserListItem | null>(null)
  const [resettingMfa, setResettingMfa] = useState<UserListItem | null>(null)

  return (
    <div>
      <PageHeader
        title="Usuarios"
        subtitle="Quién entra al panel y qué puede hacer."
        action={
          !creating && (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-600 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-brand-500 dark:bg-brand-600 dark:text-white dark:hover:bg-brand-500"
            >
              <PlusIcon />
              <span className="hidden sm:inline">Nuevo usuario</span>
            </button>
          )
        }
      />

      <dl className="mt-8 grid gap-3 sm:grid-cols-2">
        {Object.values(roleLabels).map((role) => (
          <div key={role.label} className="rounded-xl border border-zinc-200 p-4 dark:border-white/10">
            <dt className="text-sm font-medium">{role.label}</dt>
            <dd className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{role.description}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 space-y-4">
        {creating && (
          <CreateUserForm
            saving={create.isPending}
            fieldErrors={create.error instanceof ApiError ? create.error.fieldErrors : {}}
            onSubmit={(input, reset) =>
              create.mutate(input, {
                onSuccess: () => {
                  reset()
                  setCreating(false)
                },
              })
            }
            onCancel={() => {
              create.reset()
              setCreating(false)
            }}
          />
        )}
        {isPending && <p className="text-zinc-500">Cargando…</p>}
        {error && <p className="text-red-600 dark:text-red-400">{error.message}</p>}
        {users && (
          <UserList
            users={users}
            onChangeRole={(user, role) => update.mutate({ id: user.id, displayName: user.displayName, role })}
            onResetPassword={(user, password) => resetPassword.mutate({ id: user.id, password })}
            onResetMfa={setResettingMfa}
            onDelete={setDeleting}
          />
        )}
      </div>

      {createPortal(
        <AnimatePresence>
          {deleting && (
            <ConfirmSheet
              title={`¿Eliminar a ${deleting.displayName}?`}
              description="Ya no podrá entrar al panel. Esta acción no se puede deshacer."
              error={remove.error?.message}
              loading={remove.isPending}
              onConfirm={() => remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
              onCancel={() => {
                remove.reset()
                setDeleting(null)
              }}
            />
          )}
          {resettingMfa && (
            <ConfirmSheet
              title={`¿Quitar el doble factor a ${resettingMfa.displayName}?`}
              description="Podrá entrar solo con la contraseña hasta que vuelva a activarlo. Hazlo solo si confirmaste que es la persona (por ejemplo, perdió el teléfono)."
              error={resetMfa.error?.message}
              loading={resetMfa.isPending}
              onConfirm={() => resetMfa.mutate(resettingMfa.id, { onSuccess: () => setResettingMfa(null) })}
              onCancel={() => {
                resetMfa.reset()
                setResettingMfa(null)
              }}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  )
}
