import { AnimatePresence, motion } from 'motion/react'
import { useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useParams } from 'react-router'
import { ApiError } from '../api/client'
import { useDeleteExtension, useExtension, useLlmProviders, useSaveExtension } from '../api/queries'
import type { AnswerMode, Extension, ExtensionInput, LlmProvider, SipTransport } from '../api/types'
import { Button } from '../ui/Button'
import { SelectField, TextAreaField, TextField } from '../ui/Field'
import { ChevronLeftIcon, ChevronRightIcon } from '../ui/icons'
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
  const save = useSaveExtension(extension?.id)
  const remove = useDeleteExtension()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [form, setForm] = useState<ExtensionInput>(() => toInput(extension))
  const [showAdvanced, setShowAdvanced] = useState(() => hasAdvancedValues(extension))

  const llmProviders = useLlmProviders()
  const providerInfo = (provider: LlmProvider) => llmProviders.data?.find((p) => p.provider === provider)
  const defaultProvider = llmProviders.data?.find((p) => p.isDefault)
  const selectedProvider = form.llmProvider ? providerInfo(form.llmProvider) : defaultProvider

  const fieldErrors = save.error instanceof ApiError ? save.error.fieldErrors : {}
  const advancedOpen = showAdvanced || advancedFields.some((field) => fieldErrors[field])
  const generalError = save.error && Object.keys(fieldErrors).length === 0 ? save.error.message : null

  const set = <K extends keyof ExtensionInput>(key: K, value: ExtensionInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    save.mutate(form, { onSuccess: () => navigate('/extensiones') })
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

      <TextField
        label="Servidor SIP"
        placeholder="sip.ejemplo.com"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        required
        value={form.sipServer}
        onChange={(e) => set('sipServer', e.target.value)}
        hint="Dominio o IP del registrar. Admite puerto: sip.ejemplo.com:5080"
        error={fieldErrors.sipServer?.[0]}
      />

      <TextField
        label="Usuario"
        placeholder="100"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        required
        value={form.sipUsername}
        onChange={(e) => set('sipUsername', e.target.value)}
        error={fieldErrors.sipUsername?.[0]}
      />

      <TextField
        label="Contraseña"
        type="password"
        autoComplete="new-password"
        required={!extension}
        value={form.sipPassword}
        onChange={(e) => set('sipPassword', e.target.value)}
        hint={extension ? 'Déjala vacía para conservar la actual. Se guarda cifrada.' : 'Se guarda cifrada y no se vuelve a mostrar.'}
        error={fieldErrors.sipPassword?.[0]}
      />

      <TextField
        label="Nombre para mostrar"
        placeholder="Mapache"
        value={form.displayName ?? ''}
        onChange={(e) => set('displayName', e.target.value)}
        hint="Lo que ve el otro extremo en las llamadas salientes."
        error={fieldErrors.displayName?.[0]}
      />

      <SelectField
        label="Quién contesta"
        value={form.answerMode}
        onChange={(e) => set('answerMode', e.target.value as AnswerMode)}
        error={fieldErrors.answerMode?.[0]}
      >
        {Object.entries(answerModeLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </SelectField>

      {form.answerMode !== 'Human' && (
        <fieldset className="space-y-5 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <legend className="px-1 text-sm font-medium text-slate-700 dark:text-slate-300">Inteligencia artificial</legend>
          <SelectField
            label="Proveedor"
            value={form.llmProvider ?? ''}
            onChange={(e) => set('llmProvider', (e.target.value || null) as LlmProvider | null)}
            error={fieldErrors.llmProvider?.[0]}
          >
            <option value="">Por defecto{defaultProvider ? ` (${llmProviderLabels[defaultProvider.provider]})` : ''}</option>
            {(Object.keys(llmProviderLabels) as LlmProvider[]).map((provider) => (
              <option key={provider} value={provider}>
                {llmProviderLabels[provider]}
                {providerInfo(provider)?.configured === false ? ' — sin API key' : ''}
              </option>
            ))}
          </SelectField>
          {selectedProvider?.configured === false && (
            <p className="-mt-3 text-sm text-amber-700 dark:text-amber-400">
              El servidor no tiene API key de {llmProviderLabels[selectedProvider.provider]}: las llamadas de esta cuenta fallarán.
            </p>
          )}
          <TextField
            label="Modelo"
            placeholder={selectedProvider?.defaultModel || 'Modelo por defecto'}
            autoCapitalize="off"
            spellCheck={false}
            value={form.llmModel ?? ''}
            onChange={(e) => set('llmModel', e.target.value)}
            hint="Vacío usa el modelo por defecto del proveedor."
            error={fieldErrors.llmModel?.[0]}
          />
          <TextAreaField
            label="Instrucciones"
            rows={5}
            placeholder="Eres la recepcionista de…"
            value={form.systemPrompt ?? ''}
            onChange={(e) => set('systemPrompt', e.target.value)}
            hint="Cómo debe comportarse el bot en esta cuenta. Vacío usa las del agente de ElevenLabs."
            error={fieldErrors.systemPrompt?.[0]}
          />
        </fieldset>
      )}

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800">
        <button
          type="button"
          aria-expanded={advancedOpen}
          onClick={() => setShowAdvanced(!advancedOpen)}
          className="flex min-h-12 w-full items-center justify-between gap-3 px-4 text-left text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Avanzado
          <motion.span animate={{ rotate: advancedOpen ? 90 : 0 }} transition={{ duration: 0.2 }} className="text-slate-400">
            <ChevronRightIcon />
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {advancedOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="space-y-5 border-t border-slate-200 p-4 dark:border-slate-800"
            >
              <TextField
                label="Dominio"
                placeholder="Igual que el servidor"
                autoCapitalize="off"
                spellCheck={false}
                value={form.sipDomain ?? ''}
                onChange={(e) => set('sipDomain', e.target.value)}
                error={fieldErrors.sipDomain?.[0]}
              />
              <TextField
                label="Login"
                placeholder="Igual que el usuario"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                value={form.authUsername ?? ''}
                onChange={(e) => set('authUsername', e.target.value)}
                hint="Usuario de autenticación, si el servidor pide uno distinto."
                error={fieldErrors.authUsername?.[0]}
              />
              <TextField
                label="Proxy SIP"
                placeholder="Sin proxy"
                autoCapitalize="off"
                spellCheck={false}
                value={form.sipProxy ?? ''}
                onChange={(e) => set('sipProxy', e.target.value)}
                error={fieldErrors.sipProxy?.[0]}
              />
              <SelectField
                label="Transporte"
                value={form.transport}
                onChange={(e) => set('transport', e.target.value as SipTransport)}
                error={fieldErrors.transport?.[0]}
              >
                <option value="Udp">UDP</option>
                <option value="Tcp">TCP</option>
                <option value="Tls">TLS</option>
              </SelectField>
              <TextField
                label="IP pública"
                placeholder="Automática"
                inputMode="decimal"
                spellCheck={false}
                value={form.publicAddress ?? ''}
                onChange={(e) => set('publicAddress', e.target.value)}
                hint="Solo si el servidor está detrás de NAT y no se usa STUN."
                error={fieldErrors.publicAddress?.[0]}
              />
              <TextField
                label="Servidor STUN"
                placeholder="stun.l.google.com:19302"
                autoCapitalize="off"
                spellCheck={false}
                value={form.stunServer ?? ''}
                onChange={(e) => set('stunServer', e.target.value)}
                error={fieldErrors.stunServer?.[0]}
              />
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  label="Registro (s)"
                  type="number"
                  inputMode="numeric"
                  min={60}
                  max={3600}
                  value={form.registerExpirySeconds}
                  onChange={(e) => set('registerExpirySeconds', e.target.valueAsNumber || 0)}
                  error={fieldErrors.registerExpirySeconds?.[0]}
                />
                <TextField
                  label="Keepalive (s)"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={300}
                  value={form.keepAliveSeconds}
                  onChange={(e) => set('keepAliveSeconds', e.target.valueAsNumber || 0)}
                  hint="0 lo desactiva."
                  error={fieldErrors.keepAliveSeconds?.[0]}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Switch
        label="Habilitada"
        description="Mapache registra la cuenta en el servidor SIP."
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
            description="Mapache dejará de registrar esta cuenta. Esta acción no se puede deshacer."
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

const answerModeLabels: Record<AnswerMode, string> = {
  Bot: 'El bot',
  Human: 'Una persona desde el panel',
  BotWithHandoff: 'El bot, con paso a una persona',
}

const llmProviderLabels: Record<LlmProvider, string> = {
  OpenAi: 'OpenAI',
  Gemini: 'Gemini',
  Anthropic: 'Claude',
}

const advancedFields = [
  'sipDomain',
  'authUsername',
  'sipProxy',
  'transport',
  'publicAddress',
  'stunServer',
  'registerExpirySeconds',
  'keepAliveSeconds',
] as const

function toInput(extension?: Extension): ExtensionInput {
  return {
    name: extension?.name ?? '',
    sipServer: extension?.sipServer ?? '',
    sipProxy: extension?.sipProxy ?? null,
    sipUsername: extension?.sipUsername ?? '',
    sipDomain: extension?.sipDomain ?? null,
    authUsername: extension?.authUsername ?? null,
    sipPassword: '',
    displayName: extension?.displayName ?? null,
    transport: extension?.transport ?? 'Udp',
    publicAddress: extension?.publicAddress ?? null,
    stunServer: extension?.stunServer ?? null,
    registerExpirySeconds: extension?.registerExpirySeconds ?? 300,
    keepAliveSeconds: extension?.keepAliveSeconds ?? 15,
    answerMode: extension?.answerMode ?? 'Bot',
    llmProvider: extension?.llmProvider ?? null,
    llmModel: extension?.llmModel ?? null,
    systemPrompt: extension?.systemPrompt ?? null,
    enabled: extension?.enabled ?? true,
  }
}

/** Abre "Avanzado" al editar una cuenta que ya se sale de los valores por defecto. */
function hasAdvancedValues(extension?: Extension) {
  if (!extension) return false
  const defaults = toInput()
  return advancedFields.some((field) => extension[field] !== defaults[field])
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
