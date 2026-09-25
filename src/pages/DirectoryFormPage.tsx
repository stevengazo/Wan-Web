import { AnimatePresence } from 'motion/react'
import { useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useParams } from 'react-router'
import { ApiError } from '@/services/api/client'
import { useDeleteDirectoryEntry, useDirectory, useDirectoryEntry, useSaveDirectoryEntry } from '@/services/api/queries'
import type { DirectoryEntry, DirectoryEntryInput } from '@/services/api/types'
import { Button } from '@/components/atoms/Button'
import { ConfirmSheet } from '@/components/molecules/ConfirmSheet'
import { TextAreaField, TextField } from '@/components/molecules/Field'
import { FormSection, FormSections } from '@/components/organisms/FormSection'
import { ChevronLeftIcon } from '@/components/atoms/icons'
import { Switch } from '@/components/atoms/Switch'

export function DirectoryFormPage() {
  const { id } = useParams()
  const { data: entry, isPending, error } = useDirectoryEntry(id)

  return (
    <div>
      <div className="flex items-center gap-2">
        <Link
          to="/directorio"
          aria-label="Volver al directorio"
          className="-ml-3 flex size-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <ChevronLeftIcon />
        </Link>
        <h1 className="font-display text-4xl md:text-5xl">{id ? 'Editar entrada' : 'Nueva entrada'}</h1>
      </div>
      <p className="mt-2 text-slate-500 dark:text-slate-400">Una persona, un área o un número externo al que el bot puede transferir.</p>

      <div className="mt-10">
        {id && isPending && <p className="text-slate-500">Cargando…</p>}
        {id && error && <p className="text-red-600 dark:text-red-400">{error.message}</p>}
        {(!id || entry) && <EntryForm key={entry?.id ?? 'new'} entry={entry} />}
      </div>
    </div>
  )
}

function EntryForm({ entry }: { entry?: DirectoryEntry }) {
  const navigate = useNavigate()
  const save = useSaveDirectoryEntry(entry?.id)
  const remove = useDeleteDirectoryEntry()
  const { data: directory } = useDirectory()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [form, setForm] = useState<DirectoryEntryInput>({
    name: entry?.name ?? '',
    department: entry?.department ?? null,
    target: entry?.target ?? '',
    description: entry?.description ?? null,
    enabled: entry?.enabled ?? true,
  })

  // Áreas ya usadas, para sugerirlas y que no aparezcan escritas de dos formas.
  const departments = [...new Set(directory?.map((d) => d.department).filter((d): d is string => !!d))].sort()

  const fieldErrors = save.error instanceof ApiError ? save.error.fieldErrors : {}
  const generalError = save.error && Object.keys(fieldErrors).length === 0 ? save.error.message : null

  const set = <K extends keyof DirectoryEntryInput>(key: K, value: DirectoryEntryInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    save.mutate(form, { onSuccess: () => navigate('/directorio') })
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSections>
        <FormSection title="Destino" description="Cómo lo nombra quien llama y a dónde se transfiere.">
          <TextField
            label="Nombre"
            placeholder="Ventas o Ana Rodríguez"
            required
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            error={fieldErrors.name?.[0]}
          />
          <TextField
            label="Área"
            placeholder="Comercial"
            list="directory-departments"
            value={form.department ?? ''}
            onChange={(e) => set('department', e.target.value)}
            hint="Agrupa las entradas en el directorio."
            error={fieldErrors.department?.[0]}
          />
          <datalist id="directory-departments">
            {departments.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
          <TextField
            label="Transferir a"
            placeholder="101"
            required
            autoCapitalize="off"
            spellCheck={false}
            value={form.target}
            onChange={(e) => set('target', e.target.value)}
            hint="Extensión, número telefónico o URI SIP (sip:ventas@pbx.local)."
            error={fieldErrors.target?.[0]}
          />
        </FormSection>

        <FormSection title="Cuándo transferir" description="El bot lo usa para decidir. Sé concreto con los temas que atiende.">
          <TextAreaField
            label="Atiende"
            rows={4}
            placeholder="Cotizaciones, precios de planes y contratos nuevos."
            value={form.description ?? ''}
            onChange={(e) => set('description', e.target.value)}
            error={fieldErrors.description?.[0]}
          />
          <Switch
            label="Activa"
            description="Solo las entradas activas llegan al bot."
            checked={form.enabled}
            onChange={(value) => set('enabled', value)}
          />
        </FormSection>
      </FormSections>

      {generalError && (
        <p role="alert" className="mt-6 border-l-2 border-red-500 py-1 pl-3 text-sm text-red-600 dark:text-red-400">
          {generalError}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-between dark:border-white/10">
        {entry ? (
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
          {confirmingDelete && entry && (
            <ConfirmSheet
              title={`¿Eliminar "${entry.name}"?`}
              description="El bot dejará de ofrecer este destino. Esta acción no se puede deshacer."
              error={remove.error?.message}
              loading={remove.isPending}
              onConfirm={() => remove.mutate(entry.id, { onSuccess: () => navigate('/directorio') })}
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
