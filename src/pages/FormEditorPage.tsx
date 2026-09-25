import { AnimatePresence, motion } from 'motion/react'
import { useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useParams } from 'react-router'
import { ApiError } from '../api/client'
import { useDeleteForm, useForm, useSaveForm } from '../api/queries'
import type { FormField, FormFieldType, FormTemplate, FormTemplateInput } from '../api/types'
import { Button } from '../ui/Button'
import { ConfirmSheet } from '../ui/ConfirmSheet'
import { SelectField, TextAreaField, TextField } from '../ui/Field'
import { FormSection, FormSections } from '../ui/FormSection'
import { PlusIcon } from '../ui/icons'
import { PageHeader } from '../ui/PageHeader'
import { Switch } from '../ui/Switch'

export function FormEditorPage() {
  const { id } = useParams()
  const { data: form, isPending, error } = useForm(id)

  return (
    <div>
      <PageHeader
        title={id ? 'Editar formulario' : 'Nuevo formulario'}
        subtitle="Define qué datos pide el bot. La clave de cada campo es como el bot lo nombra al enviarlo."
        back={{ to: id ? `/formularios/${id}` : '/formularios', label: 'Volver' }}
      />
      <div className="mt-10">
        {id && isPending && <p className="text-slate-500">Cargando…</p>}
        {id && error && <p className="text-red-600 dark:text-red-400">{error.message}</p>}
        {(!id || form) && <Editor key={form?.id ?? 'new'} form={form} />}
      </div>
    </div>
  )
}

const fieldTypeLabels: Record<FormFieldType, string> = {
  Text: 'Texto',
  Number: 'Número',
  Phone: 'Teléfono',
  Email: 'Correo',
  Date: 'Fecha',
  YesNo: 'Sí / No',
  Choice: 'Opciones',
}

/** "Nombre del cliente" → "nombre_del_cliente". */
function toKey(label: string) {
  return label
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 64)
}

interface DraftField extends FormField {
  /** La clave se deriva de la etiqueta hasta que el usuario la edita a mano. */
  keyTouched: boolean
  uid: string
}

const newField = (): DraftField => ({
  key: '',
  label: '',
  type: 'Text',
  required: false,
  hint: null,
  options: [],
  keyTouched: false,
  uid: crypto.randomUUID(),
})

function Editor({ form }: { form?: FormTemplate }) {
  const navigate = useNavigate()
  const save = useSaveForm(form?.id)
  const remove = useDeleteForm()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [name, setName] = useState(form?.name ?? '')
  const [description, setDescription] = useState(form?.description ?? '')
  const [enabled, setEnabled] = useState(form?.enabled ?? true)
  const [fields, setFields] = useState<DraftField[]>(
    () => form?.fields.map((f) => ({ ...f, keyTouched: true, uid: crypto.randomUUID() })) ?? [newField()],
  )

  const fieldErrors = save.error instanceof ApiError ? save.error.fieldErrors : {}
  const generalError = save.error && Object.keys(fieldErrors).length === 0 ? save.error.message : null
  const fieldError = (index: number, prop: string) => fieldErrors[`fields[${index}].${prop}`]?.[0]

  const update = (uid: string, patch: Partial<DraftField>) =>
    setFields((current) =>
      current.map((f) => {
        if (f.uid !== uid) return f
        const next = { ...f, ...patch }
        if (patch.label !== undefined && !next.keyTouched) next.key = toKey(patch.label)
        return next
      }),
    )

  const move = (index: number, offset: number) =>
    setFields((current) => {
      const next = [...current]
      const [item] = next.splice(index, 1)
      next.splice(index + offset, 0, item)
      return next
    })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const input: FormTemplateInput = {
      name,
      description: description.trim() || null,
      enabled,
      fields: fields.map((f) => ({
        key: f.key,
        label: f.label,
        type: f.type,
        required: f.required,
        hint: f.hint?.trim() || null,
        options: f.options,
      })),
    }
    save.mutate(input, { onSuccess: (saved) => navigate(`/formularios/${saved.id}`) })
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSections>
        <FormSection title="General" description="El bot decide cuándo usarlo según la descripción.">
          <TextField label="Nombre" placeholder="Solicitud de cotización" required value={name} onChange={(e) => setName(e.target.value)} error={fieldErrors.name?.[0]} />
          <TextAreaField
            label="Cuándo usarlo"
            rows={3}
            placeholder="Cuando alguien pide precios o quiere contratar un plan."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={fieldErrors.description?.[0]}
          />
          <Switch label="Activo" description="Solo los formularios activos llegan al bot." checked={enabled} onChange={setEnabled} />
        </FormSection>

        <section className="py-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-medium">Campos</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">En el orden en que el bot los va a pedir.</p>
            </div>
          </div>
          {fieldErrors.fields?.[0] && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{fieldErrors.fields[0]}</p>}

          <ol className="mt-6 space-y-3">
            <AnimatePresence initial={false}>
              {fields.map((field, index) => (
                <motion.li
                  key={field.uid}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="rounded-xl border border-slate-200 p-4 dark:border-white/10"
                >
                  <div className="grid gap-4 md:grid-cols-[1fr_1fr_180px]">
                    <TextField
                      label="Etiqueta"
                      placeholder="Nombre del cliente"
                      value={field.label}
                      onChange={(e) => update(field.uid, { label: e.target.value })}
                      error={fieldError(index, 'label')}
                    />
                    <TextField
                      label="Clave"
                      placeholder="nombre_cliente"
                      autoCapitalize="off"
                      spellCheck={false}
                      className="font-mono"
                      value={field.key}
                      onChange={(e) => update(field.uid, { key: e.target.value, keyTouched: true })}
                      error={fieldError(index, 'key')}
                    />
                    <SelectField label="Tipo" value={field.type} onChange={(e) => update(field.uid, { type: e.target.value as FormFieldType })}>
                      {Object.entries(fieldTypeLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </SelectField>
                  </div>

                  {field.type === 'Choice' && (
                    <div className="mt-4">
                      <TextField
                        label="Opciones"
                        placeholder="Básico, Pro, Empresa"
                        value={field.options.join(', ')}
                        onChange={(e) => update(field.uid, { options: e.target.value.split(',').map((o) => o.trimStart()) })}
                        hint="Separadas por comas."
                        error={fieldError(index, 'options')}
                      />
                    </div>
                  )}

                  <div className="mt-4">
                    <TextField
                      label="Indicación para el bot"
                      placeholder="Opcional: cómo pedirlo o validarlo"
                      value={field.hint ?? ''}
                      onChange={(e) => update(field.uid, { hint: e.target.value })}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => update(field.uid, { required: e.target.checked })}
                        className="size-4 accent-slate-900 dark:accent-white"
                      />
                      Obligatorio
                    </label>
                    <div className="flex items-center gap-1">
                      <IconButton label="Subir" disabled={index === 0} onClick={() => move(index, -1)}>
                        ↑
                      </IconButton>
                      <IconButton label="Bajar" disabled={index === fields.length - 1} onClick={() => move(index, 1)}>
                        ↓
                      </IconButton>
                      <button
                        type="button"
                        onClick={() => setFields((current) => current.filter((f) => f.uid !== field.uid))}
                        className="min-h-11 rounded-lg px-3 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>

          <button
            type="button"
            onClick={() => setFields((current) => [...current, newField()])}
            className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 text-sm font-medium text-slate-600 hover:border-slate-400 hover:text-slate-900 dark:border-white/15 dark:text-slate-300 dark:hover:border-white/30 dark:hover:text-white"
          >
            <PlusIcon />
            Agregar campo
          </button>
        </section>
      </FormSections>

      {generalError && (
        <p role="alert" className="mt-6 border-l-2 border-red-500 py-1 pl-3 text-sm text-red-600 dark:text-red-400">
          {generalError}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-between dark:border-white/10">
        {form ? (
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

      {createPortal(
        <AnimatePresence>
          {confirmingDelete && form && (
            <ConfirmSheet
              title={`¿Eliminar "${form.name}"?`}
              description={`Se borran también sus ${form.submissionCount} respuestas. Esta acción no se puede deshacer.`}
              error={remove.error?.message}
              loading={remove.isPending}
              onConfirm={() => remove.mutate(form.id, { onSuccess: () => navigate('/formularios') })}
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

function IconButton(props: { label: string; disabled?: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-label={props.label}
      title={props.label}
      disabled={props.disabled}
      onClick={props.onClick}
      className="flex size-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-white/10"
    >
      {props.children}
    </button>
  )
}
