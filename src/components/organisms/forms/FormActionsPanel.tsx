import { AnimatePresence, motion } from 'motion/react'
import { useState, type FormEvent } from 'react'
import { ApiError } from '@/services/api/client'
import { useDeleteFormAction, useFormActions, useSaveFormAction, useTestFormAction } from '@/services/api'
import type { FormAction, FormActionType } from '@/services/api'
import { PasswordField } from '@/components/molecules/PasswordField'
import { Button } from '@/components/atoms/Button'
import { TextField } from '@/components/molecules/Field'
import { PlusIcon } from '@/components/atoms/icons'
import { Switch } from '@/components/atoms/Switch'
import { actionTypeLabels } from '@/components/organisms/forms/formActionLabels'

const targetHelp: Record<FormActionType, { label: string; placeholder: string; hint: string }> = {
  Webhook: {
    label: 'URL',
    placeholder: 'https://mi-sistema.com/webhooks/mapache',
    hint: 'Recibe un POST con el JSON de la respuesta (evento form.submitted).',
  },
  Teams: {
    label: 'URL del flujo de Teams',
    placeholder: 'https://…logic.azure.com/workflows/…',
    hint: 'En Teams: Flujos de trabajo → "Publicar en un canal cuando se reciba una solicitud de webhook".',
  },
  GoogleChat: {
    label: 'URL del webhook',
    placeholder: 'https://chat.googleapis.com/v1/spaces/…',
    hint: 'En el espacio de Google Chat: Aplicaciones e integraciones → Webhooks.',
  },
  Slack: {
    label: 'URL del webhook',
    placeholder: 'https://hooks.slack.com/services/…',
    hint: 'Una app de Slack con Incoming Webhooks activados.',
  },
  Email: {
    label: 'Para',
    placeholder: 'ventas@empresa.com, ana@empresa.com',
    hint: 'Separados por coma. Usa el correo saliente de Configuración.',
  },
}

/** Acciones que se disparan con cada respuesta del formulario. */
export function FormActionsPanel({ formId }: { formId: string }) {
  const { data: actions, isPending, error } = useFormActions(formId)
  const [editing, setEditing] = useState<string | 'new' | null>(null)

  return (
    <div>
      <p className="max-w-xl text-sm text-slate-500 dark:text-slate-400">
        Cada respuesta nueva dispara las acciones activas. Si el destino falla se reintenta varias veces, con esperas crecientes.
      </p>

      <div className="mt-6 space-y-3">
        {isPending && <p className="text-slate-500">Cargando…</p>}
        {error && <p className="text-red-600 dark:text-red-400">{error.message}</p>}
        <AnimatePresence initial={false}>
          {actions?.map((action) => (
            <motion.div key={action.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {editing === action.id ? (
                <ActionEditor formId={formId} action={action} onDone={() => setEditing(null)} />
              ) : (
                <ActionRow action={action} onEdit={() => setEditing(action.id)} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {editing === 'new' ? (
          <ActionEditor formId={formId} onDone={() => setEditing(null)} />
        ) : (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 text-sm font-medium text-slate-600 hover:border-slate-400 hover:text-slate-900 dark:border-white/15 dark:text-slate-300 dark:hover:border-white/30 dark:hover:text-white"
          >
            <PlusIcon />
            Agregar acción
          </button>
        )}
      </div>
    </div>
  )
}

function ActionRow({ action, onEdit }: { action: FormAction; onEdit: () => void }) {
  const test = useTestFormAction()

  return (
    <div className={`rounded-xl border border-slate-200 p-4 dark:border-white/10 ${action.enabled ? '' : 'opacity-60'}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-medium">
            {action.name}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
              {actionTypeLabels[action.type]}
            </span>
            {!action.enabled && <span className="text-xs text-slate-500">Inactiva</span>}
          </p>
          <p className="mt-0.5 truncate font-mono text-xs text-slate-500 dark:text-slate-400">{action.target}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => test.mutate(action.id)}
            disabled={test.isPending}
            className="min-h-10 rounded-lg px-3 text-sm font-medium hover:bg-slate-100 disabled:opacity-60 dark:hover:bg-white/10"
          >
            {test.isPending ? 'Probando…' : 'Probar'}
          </button>
          <button type="button" onClick={onEdit} className="min-h-10 rounded-lg px-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/10">
            Editar
          </button>
        </div>
      </div>
      {test.data && (
        <p className={`mt-3 text-sm ${test.data.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
          {test.data.message}
        </p>
      )}
      {test.error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{test.error.message}</p>}
    </div>
  )
}

function ActionEditor({ formId, action, onDone }: { formId: string; action?: FormAction; onDone: () => void }) {
  const save = useSaveFormAction(formId, action?.id)
  const remove = useDeleteFormAction(formId)
  const [type, setType] = useState<FormActionType>(action?.type ?? 'Teams')
  const [name, setName] = useState(action?.name ?? '')
  const [target, setTarget] = useState(action?.target ?? '')
  const [secret, setSecret] = useState('')
  const [clearSecret, setClearSecret] = useState(false)
  const [enabled, setEnabled] = useState(action?.enabled ?? true)

  const fieldErrors = save.error instanceof ApiError ? save.error.fieldErrors : {}
  const help = targetHelp[type]

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    save.mutate(
      { type, name: name.trim() || actionTypeLabels[type], target, secret: secret || null, clearSecret, enabled },
      { onSuccess: onDone },
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-xl border border-slate-300 p-4 dark:border-white/20">
      <div role="radiogroup" aria-label="Tipo de acción" className="flex flex-wrap gap-2">
        {(Object.keys(actionTypeLabels) as FormActionType[]).map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={type === value}
            onClick={() => setType(value)}
            className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-600 aria-checked:border-slate-900 aria-checked:bg-slate-900 aria-checked:text-white dark:border-white/15 dark:text-slate-300 dark:aria-checked:border-white dark:aria-checked:bg-white dark:aria-checked:text-slate-900"
          >
            {actionTypeLabels[value]}
          </button>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-[1fr_2fr]">
        <TextField
          label="Nombre"
          placeholder={actionTypeLabels[type]}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldErrors.name?.[0]}
        />
        <TextField
          label={help.label}
          placeholder={help.placeholder}
          autoCapitalize="off"
          spellCheck={false}
          inputMode={type === 'Email' ? 'email' : 'url'}
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          hint={help.hint}
          error={fieldErrors.target?.[0]}
        />
      </div>

      {type === 'Webhook' && (
        <div className="space-y-2">
          <PasswordField
            label="Secreto de firma (opcional)"
            autoComplete="off"
            placeholder={action?.hasSecret && !clearSecret ? '•••••••• guardado' : 'Sin firma'}
            value={secret}
            onChange={(e) => {
              setSecret(e.target.value)
              setClearSecret(false)
            }}
            hint="Con secreto, cada envío lleva X-Mapache-Signature: sha256=HMAC del cuerpo."
          />
          {action?.hasSecret && (
            <button
              type="button"
              onClick={() => {
                setClearSecret(!clearSecret)
                setSecret('')
              }}
              className="text-sm text-red-600 underline-offset-4 hover:underline dark:text-red-400"
            >
              {clearSecret ? 'Conservar el secreto guardado' : 'Quitar el secreto'}
            </button>
          )}
        </div>
      )}

      <Switch label="Activa" description="Se dispara con cada respuesta nueva." checked={enabled} onChange={setEnabled} />

      {save.error && Object.keys(fieldErrors).length === 0 && <p className="text-sm text-red-600 dark:text-red-400">{save.error.message}</p>}

      <div className="flex flex-wrap items-center justify-between gap-2">
        {action ? (
          <button
            type="button"
            onClick={() => remove.mutate(action.id, { onSuccess: onDone })}
            disabled={remove.isPending}
            className="min-h-10 rounded-lg px-3 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            Eliminar
          </button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onDone}>
            Cancelar
          </Button>
          <Button type="submit" loading={save.isPending}>
            Guardar
          </Button>
        </div>
      </div>
    </form>
  )
}
