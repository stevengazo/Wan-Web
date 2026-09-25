import { AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { PlusIcon } from '@/components/atoms/icons'
import { ConfirmSheet } from '@/components/molecules/ConfirmSheet'
import { PageHeader } from '@/components/organisms/PageHeader'
import { CreateUserForm } from '@/components/organisms/users/CreateUserForm'
import { roleLabels } from '@/components/organisms/users/roleLabels'
import { UserList } from '@/components/organisms/users/UserList'
import { ApiError, useCreateUser, useDeleteUser, useResetUserPassword, useUpdateUser, useUsers, type UserListItem } from '@/services/api'

/** Contenedor: conecta los datos de usuarios con los organismos que los muestran. */
export function UsersPage() {
  const { data: users, isPending, error } = useUsers()
  const create = useCreateUser()
  const update = useUpdateUser()
  const resetPassword = useResetUserPassword()
  const remove = useDeleteUser()
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<UserListItem | null>(null)

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
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              <PlusIcon />
              <span className="hidden sm:inline">Nuevo usuario</span>
            </button>
          )
        }
      />

      <dl className="mt-8 grid gap-3 sm:grid-cols-2">
        {Object.values(roleLabels).map((role) => (
          <div key={role.label} className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
            <dt className="text-sm font-medium">{role.label}</dt>
            <dd className="mt-1 text-sm text-slate-500 dark:text-slate-400">{role.description}</dd>
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
        {isPending && <p className="text-slate-500">Cargando…</p>}
        {error && <p className="text-red-600 dark:text-red-400">{error.message}</p>}
        {users && (
          <UserList
            users={users}
            onChangeRole={(user, role) => update.mutate({ id: user.id, displayName: user.displayName, role })}
            onResetPassword={(user, password) => resetPassword.mutate({ id: user.id, password })}
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
        </AnimatePresence>,
        document.body,
      )}
    </div>
  )
}
