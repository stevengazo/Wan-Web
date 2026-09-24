import { AnimatePresence, motion } from 'motion/react'
import { useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useParams } from 'react-router'
import { ApiError } from '../api/client'
import { useDeleteExtension, useExtension, useProviders, useSaveExtension } from '../api/queries'
import type { Extension, ExtensionInput } from '../api/types'
import { Button } from '../ui/Button'
import { SelectField, TextField } from '../ui/Field'
import { ChevronLeftIcon } from '../ui/icons'
import { Switch } from '../ui/Switch'

export function ExtensionFormPage() {
  const { id } = useParams()
  const { data: extension, isPending, error } = useExtension(id)

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center gap-2">
        <Link
          to="/extensiones"
          aria-label="Volver a extensiones"
          className="-ml-3 flex size-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <ChevronLeftIcon />
        </Link>
        <h1 className="text-2xl font-semibold md:text-3xl">{id ? 'Editar extensión' : 'Nueva extensión'}</h1>
      </div>

      {id && isPending && <p className="text-slate-500">Cargando…</p>}
      {id && error && <p className="text-red-600 dark:text-red-400">{error.message}</p>}
      {(!id || extension) && <ExtensionForm key={extension?.id ?? 'new'} extension={extension} />}
    </div>
  )
}

function ExtensionForm({ extension }: { extension?: Extension }) {
  const navigate = useNavigate()
  const providers = useProviders()
  const save = useSaveExtension(extension?.id)
  const remove = useDeleteExtension()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [form, setForm] = useState<ExtensionInput>({
    name: extension?.name ?? '',
    providerId: extension?.providerId ?? '',
    sipUsername: extension?.sipUsername ?? '',
    sipPassword: '',
    enabled: extension?.enabled ?? true,
  })

  // Con un solo proveedor no tiene sentido obligar a elegirlo.
  const providerId = form.providerId || (providers.data?.length === 1 ? providers.data[0].id : '')
  const fieldErrors = save.error instanceof ApiError ? save.error.fieldErrors : {}
  const generalError = save.error && Object.keys(fieldErrors).length === 0 ? save.error.message : null

  const set = <K extends keyof ExtensionInput>(key: K, value: ExtensionInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    save.mutate({ ...form, providerId }, { onSuccess: () => navigate('/extensiones') })
  }

  const handleDelete = () => {
    if (!extension) return
    remove.mutate(extension.id, { onSuccess: () => navigate('/extensiones') })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <TextField
        label="Nombre"
        placeholder="Recepción"
        required
        value={form.name}
        onChange={(e) => set('name', e.target.value)}
        error={fieldErrors.name?.[0]}
      />

      <SelectField
        label="Proveedor"
        required
        value={providerId}
        onChange={(e) => set('providerId', e.target.value)}
        error={fieldErrors.providerId?.[0]}
      >
        <option value="" disabled>
          {providers.isPending ? 'Cargando…' : 'Elegir proveedor'}
        </option>
        {providers.data?.map((provider) => (
          <option key={provider.id} value={provider.id}>
            {provider.name} ({provider.sipServer})
          </option>
        ))}
      </SelectField>

      <TextField
        label="Usuario SIP"
        placeholder="123456-100"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        required
        value={form.sipUsername}
        onChange={(e) => set('sipUsername', e.target.value)}
        error={fieldErrors.sipUsername?.[0]}
      />

      <TextField
        label="Contraseña SIP"
        type="password"
        autoComplete="new-password"
        required={!extension}
        value={form.sipPassword}
        onChange={(e) => set('sipPassword', e.target.value)}
        hint={extension ? 'Déjala vacía para conservar la actual. Se guarda cifrada.' : 'Se guarda cifrada y no se vuelve a mostrar.'}
        error={fieldErrors.sipPassword?.[0]}
      />

      <Switch
        label="Habilitada"
        description="El bot registra la extensión y atiende sus llamadas."
        checked={form.enabled}
        onChange={(value) => set('enabled', value)}
      />

      {generalError && (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
          {generalError}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
        {extension ? (
          <Button variant="secondary" onClick={() => setConfirmingDelete(true)} className="text-red-600 dark:text-red-400">
            Eliminar
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" loading={save.isPending} className="sm:min-w-32">
          Guardar
        </Button>
      </div>

      {/* Portal: la animación de página aplica transform y rompería el position: fixed. */}
      {createPortal(
      <AnimatePresence>
        {confirmingDelete && extension && (
          <ConfirmSheet
            title={`¿Eliminar "${extension.name}"?`}
            description="El bot dejará de registrar esta extensión. Esta acción no se puede deshacer."
            error={remove.error?.message}
            loading={remove.isPending}
            onConfirm={handleDelete}
            onCancel={() => {
              remove.reset()
              setConfirmingDelete(false)
            }}
          />
        )}
      </AnimatePresence>,
        document.body,
      )}
    </form>
  )
}

/** Hoja inferior en móvil, diálogo centrado desde sm:. */
function ConfirmSheet(props: {
  title: string
  description: string
  error?: string
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <motion.div
      className="fixed inset-0 z-30 flex items-end bg-slate-950/50 sm:items-center sm:justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={props.onCancel}
    >
      <motion.div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full space-y-4 rounded-t-3xl bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:max-w-md sm:rounded-3xl dark:bg-slate-900"
      >
        <h2 id="confirm-title" className="text-lg font-semibold">
          {props.title}
        </h2>
        <p className="text-slate-600 dark:text-slate-400">{props.description}</p>
        {props.error && <p className="text-sm text-red-600 dark:text-red-400">{props.error}</p>}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={props.onCancel}>
            Cancelar
          </Button>
          <Button variant="danger" loading={props.loading} onClick={props.onConfirm}>
            Eliminar
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
