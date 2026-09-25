import { useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import { useCallSettings, useLlmSettings, useSaveLlmSettings, useSmtpSettings } from '../api/queries'
import type { LlmProvider, LlmSettings } from '../api/types'
import { PasswordField } from '../auth/PasswordField'
import { Button } from '../ui/Button'
import { TextAreaField, TextField } from '../ui/Field'
import { FormSection, FormSections } from '../ui/FormSection'
import { CopyIcon } from '../ui/icons'
import { Saved } from '../ui/Saved'
import { useFlash } from '../ui/useFlash'
import { CallSettingsForm } from './CallSettingsForm'
import { SmtpSettingsForm } from './SmtpSettingsForm'

export function SettingsPage() {
  const { data: settings, isPending, error } = useLlmSettings()
  const callSettings = useCallSettings()
  const smtp = useSmtpSettings()

  return (
    <div>
      <h1 className="font-display text-4xl md:text-5xl">Configuración</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">Ajustes generales del sistema, iguales para todas las cuentas.</p>

      <h2 className="mt-12 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Llamadas</h2>
      <div className="mt-2">
        {callSettings.error && <p className="text-red-600 dark:text-red-400">{callSettings.error.message}</p>}
        {callSettings.data && <CallSettingsForm settings={callSettings.data} />}
      </div>

      <h2 className="mt-16 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Correo saliente</h2>
      <div className="mt-2">
        {smtp.error && <p className="text-red-600 dark:text-red-400">{smtp.error.message}</p>}
        {smtp.data && <SmtpSettingsForm settings={smtp.data} />}
      </div>

      <h2 className="mt-16 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Inteligencia artificial</h2>
      <div className="mt-2">
        {isPending && <p className="text-slate-500">Cargando…</p>}
        {error && <p className="text-red-600 dark:text-red-400">{error.message}</p>}
        {settings && <AiSettingsForm settings={settings} />}
      </div>
    </div>
  )
}

const providerLabels: Record<LlmProvider, string> = {
  OpenAi: 'OpenAI',
  Gemini: 'Gemini',
  Anthropic: 'Claude',
}

interface ProviderDraft {
  model: string
  apiKey: string
  clearApiKey: boolean
}

function AiSettingsForm({ settings }: { settings: LlmSettings }) {
  const save = useSaveLlmSettings()
  const [saved, flash] = useFlash()
  const [activeProvider, setActiveProvider] = useState(settings.activeProvider)
  const [systemPrompt, setSystemPrompt] = useState(settings.systemPrompt ?? '')
  const [drafts, setDrafts] = useState<Record<LlmProvider, ProviderDraft>>(
    () =>
      Object.fromEntries(
        settings.providers.map((p) => [p.provider, { model: p.model ?? '', apiKey: '', clearApiKey: false }]),
      ) as Record<LlmProvider, ProviderDraft>,
  )

  const setDraft = (provider: LlmProvider, patch: Partial<ProviderDraft>) =>
    setDrafts((current) => ({ ...current, [provider]: { ...current[provider], ...patch } }))

  const hasKey = (provider: LlmProvider) => {
    const stored = settings.providers.find((p) => p.provider === provider)?.hasApiKey ?? false
    const draft = drafts[provider]
    return draft.apiKey.trim().length > 0 || (stored && !draft.clearApiKey)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    save.mutate(
      {
        activeProvider,
        systemPrompt: systemPrompt.trim() || null,
        providers: settings.providers.map((p) => ({
          provider: p.provider,
          model: drafts[p.provider].model.trim() || null,
          apiKey: drafts[p.provider].apiKey.trim() || null,
          clearApiKey: drafts[p.provider].clearApiKey,
        })),
      },
      {
        onSuccess: (updated) => {
          // Las keys recién guardadas no se vuelven a mostrar: se limpian los campos.
          setDrafts(
            Object.fromEntries(
              updated.providers.map((p) => [p.provider, { model: p.model ?? '', apiKey: '', clearApiKey: false }]),
            ) as Record<LlmProvider, ProviderDraft>,
          )
          flash()
        },
      },
    )
  }

  const generalError = save.error instanceof ApiError && Object.keys(save.error.fieldErrors).length === 0 ? save.error.message : null

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSections>
        <FormSection title="Proveedor activo" description="El LLM que responde en todas las llamadas. ElevenLabs sigue haciendo la voz.">
          <div role="radiogroup" aria-label="Proveedor activo" className="grid gap-2">
            {settings.providers.map((p) => {
              const active = activeProvider === p.provider
              const ready = hasKey(p.provider)
              return (
                <button
                  key={p.provider}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setActiveProvider(p.provider)}
                  className={`flex min-h-14 items-center gap-3 rounded-lg border px-4 text-left transition-colors ${
                    active
                      ? 'border-slate-900 ring-1 ring-slate-900 dark:border-white dark:ring-white'
                      : 'border-slate-200 hover:border-slate-400 dark:border-white/10 dark:hover:border-white/30'
                  }`}
                >
                  <span
                    className={`flex size-4 items-center justify-center rounded-full border ${
                      active ? 'border-slate-900 dark:border-white' : 'border-slate-300 dark:border-white/30'
                    }`}
                  >
                    {active && <span className="size-2 rounded-full bg-slate-900 dark:bg-white" />}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium">{providerLabels[p.provider]}</span>
                    <span className="block font-mono text-xs text-slate-500 dark:text-slate-400">
                      {drafts[p.provider].model || p.defaultModel}
                    </span>
                  </span>
                  <span className={`inline-flex items-center gap-1.5 text-xs ${ready ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    <span className={`size-1.5 rounded-full ${ready ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                    {ready ? 'Con API key' : 'Sin API key'}
                  </span>
                </button>
              )
            })}
          </div>
          {!hasKey(activeProvider) && (
            <p className="text-sm text-amber-700 dark:text-amber-400">
              {providerLabels[activeProvider]} no tiene API key: las llamadas fallarán hasta que cargues una.
            </p>
          )}
        </FormSection>

        {settings.providers.map((p) => (
          <FormSection
            key={p.provider}
            title={providerLabels[p.provider]}
            description={p.provider === activeProvider ? 'Proveedor activo.' : 'Se guarda aunque no esté activo.'}
          >
            <TextField
              label="Modelo"
              placeholder={p.defaultModel}
              autoCapitalize="off"
              spellCheck={false}
              value={drafts[p.provider].model}
              onChange={(e) => setDraft(p.provider, { model: e.target.value })}
              hint="Vacío usa el modelo por defecto."
            />
            <PasswordField
              label="API key"
              autoComplete="off"
              placeholder={p.hasApiKey && !drafts[p.provider].clearApiKey ? '•••••••• guardada' : 'Pega la API key'}
              value={drafts[p.provider].apiKey}
              onChange={(e) => setDraft(p.provider, { apiKey: e.target.value, clearApiKey: false })}
              hint={p.hasApiKey ? 'Déjala vacía para conservar la guardada. Se guarda cifrada.' : 'Se guarda cifrada y no se vuelve a mostrar.'}
            />
            {p.hasApiKey && (
              <button
                type="button"
                onClick={() => setDraft(p.provider, { clearApiKey: !drafts[p.provider].clearApiKey, apiKey: '' })}
                className="text-sm text-red-600 underline-offset-4 hover:underline dark:text-red-400"
              >
                {drafts[p.provider].clearApiKey ? 'Conservar la API key guardada' : 'Quitar la API key guardada'}
              </button>
            )}
          </FormSection>
        ))}

        <FormSection title="Instrucciones" description="Cómo debe comportarse el bot. Vacío usa las del agente de ElevenLabs.">
          <TextAreaField
            label="Instrucciones del bot"
            rows={8}
            placeholder="Eres la recepcionista de…"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            error={save.error instanceof ApiError ? save.error.fieldErrors.systemPrompt?.[0] : undefined}
          />
        </FormSection>

        <FormSection title="Conexión con ElevenLabs" description="Datos para configurar el agente como Custom LLM.">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">URL del Custom LLM</p>
            <CopyField value={`${window.location.origin}/api/llm/v1`} />
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Como API key, el token de tools del servidor.</p>
          </div>
        </FormSection>
      </FormSections>

      {generalError && (
        <p role="alert" className="mt-6 border-l-2 border-red-500 py-1 pl-3 text-sm text-red-600 dark:text-red-400">
          {generalError}
        </p>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6 dark:border-white/10">
        <Saved show={saved} />
        <Button type="submit" loading={save.isPending} className="sm:min-w-32">
          Guardar
        </Button>
      </div>
    </form>
  )
}

function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Sin permiso de portapapeles: el valor sigue visible para copiarlo a mano.
    }
  }

  return (
    <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 py-1 pl-3 pr-1 dark:border-white/10 dark:bg-white/5">
      <code className="min-w-0 flex-1 truncate text-sm">{value}</code>
      <button
        type="button"
        onClick={copy}
        aria-label="Copiar URL"
        className="flex min-h-9 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-white/10"
      >
        <CopyIcon />
        {copied ? 'Copiada' : 'Copiar'}
      </button>
    </div>
  )
}
