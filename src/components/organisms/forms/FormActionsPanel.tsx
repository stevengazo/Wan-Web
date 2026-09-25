import { AnimatePresence, motion } from 'motion/react'
import { useState, type FormEvent } from 'react'
import { ApiError } from '@/services/api/client'
import { useDeleteFormAction, useFormActions, useSaveFormAction, useTestFormAction } from '@/services/api'
import type { FormAction, FormActionType, HttpActionMethod } from '@/services/api'
import { PasswordField } from '@/components/molecules/PasswordField'
import { Button } from '@/components/atoms/Button'
import { SelectField, TextAreaField, TextField } from '@/components/molecules/Field'
import { HeadersEditor } from '@/components/molecules/HeadersEditor'
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
  HttpRequest: {
    label: 'URL de la API',
    placeholder: 'https://crm.miempresa.com/api/leads',
    hint: 'Puede llevar marcadores: https://erp.com/api/clientes/{{cedula}}/casos',
  },
}

const methods: HttpActionMethod[] = ['POST', 'PUT', 'PATCH', 'GET', 'DELETE']

/** Datos del sistema disponibles como marcador además de los campos del formulario. */
const systemPlaceholders = ['caller_number', 'summary', 'values', 'form_name', 'submission_id', 'conversation_id', 'created_at']

const bodyExample = `{
  "subject": "Llamada de {{caller_number}}",
  "description": {{summary}},
  "source": "mapache"
}`

/** Acciones que se disparan con cada respuesta del formulario. */
export function FormActionsPanel({ formId, fieldKeys }: { formId: string; fieldKeys: string[] }) {
  const { data: actions, isPending, error } = useFormActions(formId)
  const [editing, setEditing] = useState<string | 'new' | null>(null)

  return (
    <div>
      <p className="max-w-xl text-sm text-zinc-500 dark:text-zinc-400">
        Cada respuesta nueva dispara las acciones activas. Si el destino falla se reintenta varias veces, con esperas crecientes.
      </p>

      <div className="mt-6 space-y-3">
        {isPending && <p className="text-zinc-500">Cargando…</p>}
        {error && <p className="text-red-600 dark:text-red-400">{error.message}</p>}
        <AnimatePresence initial={false}>
          {actions?.map((action) => (
            <motion.div key={action.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {editing === action.id ? (
                <ActionEditor formId={formId} fieldKeys={fieldKeys} action={action} onDone={() => setEditing(null)} />
              ) : (
                <ActionRow action={action} onEdit={() => setEditing(action.id)} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {editing === 'new' ? (
          <ActionEditor formId={formId} fieldKeys={fieldKeys} onDone={() => setEditing(null)} />
        ) : (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 text-sm font-medium text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 dark:border-white/15 dark:text-zinc-300 dark:hover:border-white/30 dark:hover:text-white"
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
    <div className={`rounded-xl border border-zinc-200 p-4 dark:border-white/10 ${action.enabled ? '' : 'opacity-60'}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-medium">
            {action.name}
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
              {actionTypeLabels[action.type]}
            </span>
            {!action.enabled && <span className="text-xs text-zinc-500">Inactiva</span>}
          </p>
          <p className="mt-0.5 truncate font-mono text-xs text-zinc-500 dark:text-zinc-400">
            {action.type === 'HttpRequest' && `${action.method ?? 'POST'} `}
            {action.target}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => test.mutate(action.id)}
            disabled={test.isPending}
            className="min-h-10 rounded-lg px-3 text-sm font-medium hover:bg-zinc-100 disabled:opacity-60 dark:hover:bg-white/10"
          >
            {test.isPending ? 'Probando…' : 'Probar'}
          </button>
          <button type="button" onClick={onEdit} className="min-h-10 rounded-lg px-3 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-white/10">
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

function ActionEditor({ formId, fieldKeys, action, onDone }: { formId: string; fieldKeys: string[]; action?: FormAction; onDone: () => void }) {
  const save = useSaveFormAction(formId, action?.id)
  const remove = useDeleteFormAction(formId)
  const [type, setType] = useState<FormActionType>(action?.type ?? 'Teams')
  const [name, setName] = useState(action?.name ?? '')
  const [target, setTarget] = useState(action?.target ?? '')
  const [secret, setSecret] = useState('')
  const [clearSecret, setClearSecret] = useState(false)
  const [enabled, setEnabled] = useState(action?.enabled ?? true)
  const [method, setMethod] = useState<HttpActionMethod>(action?.method ?? 'POST')
  const [bodyTemplate, setBodyTemplate] = useState(action?.bodyTemplate ?? '')
  const [headers, setHeaders] = useState<Record<string, string> | null>(null)
  const isHttp = type === 'HttpRequest'
  const signed = type === 'Webhook' || isHttp

  const fieldErrors = save.error instanceof ApiError ? save.error.fieldErrors : {}
  const help = targetHelp[type]

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    save.mutate(
      {
        type,
        name: name.trim() || actionTypeLabels[type],
        target,
        secret: secret || null,
        clearSecret,
        enabled,
        ...(isHttp && { method, bodyTemplate: bodyTemplate.trim() || null, headers }),
      },
      { onSuccess: onDone },
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-xl border border-zinc-300 p-4 dark:border-white/20">
      <div role="radiogroup" aria-label="Tipo de acción" className="flex flex-wrap gap-2">
        {(Object.keys(actionTypeLabels) as FormActionType[]).map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={type === value}
            onClick={() => setType(value)}
            className="min-h-10 rounded-lg border border-zinc-300 px-3 text-sm font-medium text-zinc-600 aria-checked:border-zinc-900 aria-checked:bg-zinc-900 aria-checked:text-white dark:border-white/15 dark:text-zinc-300 dark:aria-checked:border-white dark:aria-checked:bg-white dark:aria-checked:text-zinc-900"
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

      {isHttp && (
        <div className="space-y-5">
          <SelectField label="Método" value={method} onChange={(e) => setMethod(e.target.value as HttpActionMethod)}>
            {methods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </SelectField>
          <div className="space-y-1">
            <HeadersEditor savedNames={action?.headerNames ?? []} onChange={setHeaders} />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Por ejemplo Authorization: Bearer … o X-Api-Key. Se guardan cifrados.</p>
          </div>
          {method !== 'GET' && method !== 'DELETE' && (
            <div className="space-y-2">
              <TextAreaField
                label="Cuerpo (JSON)"
                rows={7}
                spellCheck={false}
                placeholder={bodyExample}
                value={bodyTemplate}
                onChange={(e) => setBodyTemplate(e.target.value)}
                hint="Vacío = el JSON estándar del webhook. Cada marcador se reemplaza por su valor ya en JSON (el texto con comillas): no le agregues comillas."
                error={fieldErrors.bodyTemplate?.[0]}
              />
              <div className="flex flex-wrap items-center gap-1.5" aria-label="Insertar marcador">
                <span className="eyebrow mr-1 text-zinc-500 dark:text-zinc-400">Insertar</span>
                {[...fieldKeys, ...systemPlaceholders].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setBodyTemplate((value) => `${value}{{${key}}}`)}
                    className={`min-h-8 border px-2 font-mono text-xs transition-colors hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-300 ${
                      fieldKeys.includes(key)
                        ? 'border-brand-200 text-brand-700 dark:border-brand-500/40 dark:text-brand-300'
                        : 'border-zinc-300 text-zinc-600 dark:border-white/15 dark:text-zinc-300'
                    }`}
                  >
                    {`{{${key}}}`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {signed && (
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
