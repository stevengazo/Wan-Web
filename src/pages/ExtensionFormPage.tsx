import { AnimatePresence } from 'motion/react'
import { useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useParams } from 'react-router'
import { ApiError } from '@/services/api/client'
import { useDeleteExtension, useExtension, useSaveExtension } from '@/services/api'
import {
  supportedCodecs,
  type AnswerMode,
  type DtmfMode,
  type Extension,
  type ExtensionInput,
  type MediaEncryption,
  type SipTransport,
} from '@/services/api'
import { Button } from '@/components/atoms/Button'
import { ConfirmSheet } from '@/components/molecules/ConfirmSheet'
import { SelectField, TextField } from '@/components/molecules/Field'
import { FormSection, FormSections } from '@/components/organisms/FormSection'
import { ChevronLeftIcon } from '@/components/atoms/icons'
import { Switch } from '@/components/atoms/Switch'

export function ExtensionFormPage() {
  const { id } = useParams()
  const { data: extension, isPending, error } = useExtension(id)

  return (
    <div>
      <div className="flex items-center gap-2">
        <Link
          to="/extensiones"
          aria-label="Volver a extensiones"
          className="-ml-3 flex size-11 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/10"
        >
          <ChevronLeftIcon />
        </Link>
        <h1 className="font-display text-4xl md:text-5xl">{id ? 'Editar extensión' : 'Nueva extensión'}</h1>
      </div>
      <p className="mt-2 text-zinc-500 dark:text-zinc-400">
        Los mismos datos que pide un softphone. Solo son obligatorios el servidor, el usuario y la contraseña.
      </p>

      <div className="mt-10">
        {id && isPending && <p className="text-zinc-500">Cargando…</p>}
        {id && error && <p className="text-red-600 dark:text-red-400">{error.message}</p>}
        {(!id || extension) && <ExtensionForm key={extension?.id ?? 'new'} extension={extension} />}
      </div>
    </div>
  )
}

const hostInput = { autoCapitalize: 'off', autoComplete: 'off', spellCheck: false } as const

function ExtensionForm({ extension }: { extension?: Extension }) {
  const navigate = useNavigate()
  const save = useSaveExtension(extension?.id)
  const remove = useDeleteExtension()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [form, setForm] = useState<ExtensionInput>(() => toInput(extension))

  const fieldErrors = save.error instanceof ApiError ? save.error.fieldErrors : {}
  const generalError = save.error && Object.keys(fieldErrors).length === 0 ? save.error.message : null
  const error = (field: keyof ExtensionInput) => fieldErrors[field]?.[0]

  const set = <K extends keyof ExtensionInput>(key: K, value: ExtensionInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }))
  const text = (key: { [K in keyof ExtensionInput]: ExtensionInput[K] extends string | null ? K : never }[keyof ExtensionInput]) => ({
    value: form[key] ?? '',
    onChange: (e: { target: { value: string } }) => set(key, e.target.value),
    error: error(key),
  })
  const number = (key: { [K in keyof ExtensionInput]: ExtensionInput[K] extends number ? K : never }[keyof ExtensionInput]) => ({
    type: 'number',
    inputMode: 'numeric' as const,
    value: form[key],
    onChange: (e: { target: { valueAsNumber: number } }) => set(key, Number.isNaN(e.target.valueAsNumber) ? 0 : e.target.valueAsNumber),
    error: error(key),
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    save.mutate(form, { onSuccess: () => navigate('/extensiones') })
  }

  const handleDelete = () => {
    if (!extension) return
    remove.mutate(extension.id, { onSuccess: () => navigate('/extensiones') })
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSections>
        <FormSection title="General" description="Cómo se llama la cuenta en el panel y quién atiende sus llamadas.">
          <TextField label="Nombre" placeholder="Recepción" required {...text('name')} />
          <SelectField
            label="Quién contesta"
            value={form.answerMode}
            onChange={(e) => set('answerMode', e.target.value as AnswerMode)}
            error={error('answerMode')}
          >
            {Object.entries(answerModeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectField>
          <Switch
            label="Habilitada"
            description="Mapache registra la cuenta en el servidor SIP."
            checked={form.enabled}
            onChange={(value) => set('enabled', value)}
          />
        </FormSection>

        <FormSection title="Servidor" description="Dónde se registra la cuenta. El secundario se usa si el principal no responde.">
          <TextField
            label="Servidor SIP"
            placeholder="sip.ejemplo.com"
            required
            hint="Dominio o IP del registrar. Admite puerto: sip.ejemplo.com:5080"
            {...hostInput}
            {...text('sipServer')}
          />
          <TextField label="Servidor SIP secundario" placeholder="Sin respaldo" {...hostInput} {...text('secondarySipServer')} />
          <TextField label="Proxy SIP" placeholder="Sin proxy" {...hostInput} {...text('sipProxy')} />
          <TextField label="Dominio" placeholder="Igual que el servidor" {...hostInput} {...text('sipDomain')} />
        </FormSection>

        <FormSection title="Credenciales" description="La contraseña se guarda cifrada y no se vuelve a mostrar.">
          <TextField label="Usuario" placeholder="100" required {...hostInput} {...text('sipUsername')} />
          <TextField
            label="Login"
            placeholder="Igual que el usuario"
            hint="Usuario de autenticación, si el servidor pide uno distinto."
            {...hostInput}
            {...text('authUsername')}
          />
          <TextField
            label="Contraseña"
            type="password"
            autoComplete="new-password"
            required={!extension}
            hint={extension ? 'Déjala vacía para conservar la actual.' : undefined}
            {...text('sipPassword')}
          />
          <TextField
            label="Nombre para mostrar"
            placeholder="Mapache"
            hint="Lo que ve el otro extremo en las llamadas salientes."
            {...text('displayName')}
          />
        </FormSection>

        <FormSection title="Red y NAT" description="Solo hace falta tocarlo si el servidor o Mapache están detrás de NAT.">
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Transporte"
              value={form.transport}
              onChange={(e) => set('transport', e.target.value as SipTransport)}
              error={error('transport')}
            >
              <option value="Udp">UDP</option>
              <option value="Tcp">TCP</option>
              <option value="Tls">TLS</option>
            </SelectField>
            <TextField label="Puerto local" min={0} max={65535} hint="0 = automático" {...number('localPort')} />
          </div>
          <TextField label="IP pública" placeholder="Automática" inputMode="decimal" {...hostInput} {...text('publicAddress')} />
          <TextField label="Servidor STUN" placeholder="stun.l.google.com:19302" {...hostInput} {...text('stunServer')} />
          <TextField label="Keepalive (s)" min={0} max={300} hint="Mantiene abierto el NAT. 0 lo desactiva." {...number('keepAliveSeconds')} />
          <Switch
            label="Reescribir IP (rport)"
            description="Usa la IP y el puerto con que el servidor ve a Mapache."
            checked={form.allowIpRewrite}
            onChange={(value) => set('allowIpRewrite', value)}
          />
          <Switch
            label="ICE"
            description="Negocia la mejor ruta para el audio a través de NAT."
            checked={form.useIce}
            onChange={(value) => set('useIce', value)}
          />
        </FormSection>

        <FormSection title="Registro" description="Cada cuánto se renueva el registro y cuánto esperar si falla.">
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Expiración (s)" min={60} max={3600} {...number('registerExpirySeconds')} />
            <TextField label="Reintento (s)" min={5} max={3600} {...number('registerRetrySeconds')} />
          </div>
        </FormSection>

        <FormSection title="Audio" description="PCMU primero evita transcodificar el audio hacia ElevenLabs.">
          <CodecPicker value={form.codecs} onChange={(codecs) => set('codecs', codecs)} error={error('codecs')} />
          <SelectField
            label="Cifrado (SRTP)"
            value={form.mediaEncryption}
            onChange={(e) => set('mediaEncryption', e.target.value as MediaEncryption)}
            error={error('mediaEncryption')}
          >
            <option value="Disabled">Desactivado</option>
            <option value="Optional">Opcional</option>
            <option value="Mandatory">Obligatorio</option>
          </SelectField>
          <SelectField
            label="DTMF"
            value={form.dtmfMode}
            onChange={(e) => set('dtmfMode', e.target.value as DtmfMode)}
            error={error('dtmfMode')}
          >
            <option value="Rfc2833">RFC 2833 (recomendado)</option>
            <option value="SipInfo">SIP INFO</option>
            <option value="Inband">En banda</option>
          </SelectField>
        </FormSection>

        <FormSection title="Llamadas" description="Límites y opciones para las llamadas de la cuenta.">
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Simultáneas" min={0} max={100} hint="0 = sin límite" {...number('maxConcurrentCalls')} />
            <TextField label="Refresco de sesión (s)" min={0} max={7200} hint="0 lo desactiva" {...number('sessionTimerSeconds')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Buzón de voz" placeholder="*97" inputMode="tel" {...text('voicemailNumber')} />
            <TextField label="Prefijo de marcado" placeholder="Ninguno" inputMode="tel" {...text('dialPrefix')} />
          </div>
          <Switch
            label="Ocultar mi número"
            description="Las llamadas salientes salen como anónimas."
            checked={form.hideCallerId}
            onChange={(value) => set('hideCallerId', value)}
          />
        </FormSection>
      </FormSections>

      {generalError && (
        <p role="alert" className="mt-6 border-l-2 border-red-500 py-1 pl-3 text-sm text-red-600 dark:text-red-400">
          {generalError}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-6 sm:flex-row sm:justify-between dark:border-white/10">
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

/** Códecs como chips: el orden en que se activan es la preferencia. */
function CodecPicker({ value, onChange, error }: { value: string[]; onChange: (codecs: string[]) => void; error?: string }) {
  const toggle = (codec: string) =>
    onChange(value.includes(codec) ? value.filter((c) => c !== codec) : [...value, codec])

  return (
    <fieldset>
      <legend className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Códecs</legend>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {supportedCodecs.map((codec) => {
          const position = value.indexOf(codec)
          const active = position >= 0
          return (
            <button
              key={codec}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(codec)}
              className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                active
                  ? 'border-brand-600 bg-brand-600 text-white dark:border-brand-500 dark:bg-brand-600 dark:text-white'
                  : 'border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-white/15 dark:text-zinc-300 dark:hover:border-white/30'
              }`}
            >
              {active && (
                <span className="flex size-5 items-center justify-center rounded-full bg-white/20 text-xs tabular-nums dark:bg-zinc-900/15">
                  {position + 1}
                </span>
              )}
              {codec}
            </button>
          )
        })}
      </div>
      <p className={`mt-1.5 text-sm ${error ? 'text-red-600 dark:text-red-400' : 'text-zinc-500 dark:text-zinc-400'}`}>
        {error ?? 'El orden en que los activas es el orden de preferencia.'}
      </p>
    </fieldset>
  )
}

const answerModeLabels: Record<AnswerMode, string> = {
  Bot: 'El bot',
  Human: 'Una persona desde el panel',
  BotWithHandoff: 'El bot, con paso a una persona',
}

function toInput(extension?: Extension): ExtensionInput {
  return {
    name: extension?.name ?? '',
    sipServer: extension?.sipServer ?? '',
    secondarySipServer: extension?.secondarySipServer ?? null,
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
    registerRetrySeconds: extension?.registerRetrySeconds ?? 30,
    keepAliveSeconds: extension?.keepAliveSeconds ?? 15,
    localPort: extension?.localPort ?? 0,
    allowIpRewrite: extension?.allowIpRewrite ?? true,
    useIce: extension?.useIce ?? false,
    mediaEncryption: extension?.mediaEncryption ?? 'Disabled',
    codecs: extension?.codecs ?? ['PCMU', 'PCMA'],
    dtmfMode: extension?.dtmfMode ?? 'Rfc2833',
    sessionTimerSeconds: extension?.sessionTimerSeconds ?? 1800,
    maxConcurrentCalls: extension?.maxConcurrentCalls ?? 0,
    voicemailNumber: extension?.voicemailNumber ?? null,
    dialPrefix: extension?.dialPrefix ?? null,
    hideCallerId: extension?.hideCallerId ?? false,
    answerMode: extension?.answerMode ?? 'Bot',
    enabled: extension?.enabled ?? true,
  }
}
