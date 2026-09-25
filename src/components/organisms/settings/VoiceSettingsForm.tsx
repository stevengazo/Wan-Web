import { useState, type FormEvent } from 'react'
import { Button } from '@/components/atoms/Button'
import { CopyField } from '@/components/molecules/CopyField'
import { SelectField, TextAreaField, TextField } from '@/components/molecules/Field'
import { PasswordField } from '@/components/molecules/PasswordField'
import { FormSection, FormSections } from '@/components/organisms/FormSection'
import { ApiError } from '@/services/api/client'
import { useSaveVoiceSettings, type SaveVoiceSettings, type VoiceProvider, type VoiceSettings } from '@/services/api'

const providers: { value: VoiceProvider; label: string; description: string }[] = [
  {
    value: 'ElevenLabs',
    label: 'ElevenLabs',
    description: 'Voces muy naturales. El agente se crea en ElevenLabs y usa el Custom LLM de Mapache.',
  },
  {
    value: 'OpenAiRealtime',
    label: 'OpenAI Realtime',
    description: 'Voz a voz de OpenAI, con muy poca latencia. Mapache le pasa las instrucciones y las herramientas.',
  },
  {
    value: 'Deepgram',
    label: 'Deepgram',
    description: 'Reconocimiento y voz de Deepgram, a menor costo por minuto. Responde el Custom LLM de Mapache.',
  },
]

const openAiVoices = ['marin', 'cedar', 'alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse']

interface VoiceSettingsFormProps {
  settings: VoiceSettings
  /** URL pública del panel, para las URLs que se copian en ElevenLabs. */
  publicUrl: string
}

/** Proveedor de voz de las llamadas y sus credenciales. */
export function VoiceSettingsForm({ settings, publicUrl }: VoiceSettingsFormProps) {
  const save = useSaveVoiceSettings()
  const [form, setForm] = useState<SaveVoiceSettings>({
    provider: settings.provider,
    apiKey: null,
    agentId: settings.agentId,
    openAiApiKey: null,
    openAiModel: settings.openAiModel,
    openAiVoice: settings.openAiVoice,
    openAiTranscriptionModel: settings.openAiTranscriptionModel,
    deepgramApiKey: null,
    deepgramLanguage: settings.deepgramLanguage,
    deepgramListenModel: settings.deepgramListenModel,
    deepgramSpeakModel: settings.deepgramSpeakModel,
    greeting: settings.greeting,
  })
  const set = <K extends keyof SaveVoiceSettings>(key: K, value: SaveVoiceSettings[K]) => setForm((f) => ({ ...f, [key]: value }))
  const text = (key: keyof SaveVoiceSettings) => ({
    value: (form[key] as string | null) ?? '',
    onChange: (e: { target: { value: string } }) => set(key, (e.target.value || null) as never),
    error: save.error instanceof ApiError ? save.error.fieldErrors[key]?.[0] : undefined,
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    save.mutate(form, { onSuccess: () => setForm((f) => ({ ...f, apiKey: null, openAiApiKey: null, deepgramApiKey: null })) })
  }

  const saved = (has: boolean) => (has ? '•••••••• guardada' : undefined)

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSections>
        <FormSection title="Proveedor" description="Quién reconoce lo que dice quien llama, habla y maneja los turnos. Se puede cambiar cuando quieras.">
          <div role="radiogroup" aria-label="Proveedor de voz" className="space-y-2">
            {providers.map((p) => (
              <button
                key={p.value}
                type="button"
                role="radio"
                aria-checked={form.provider === p.value}
                onClick={() => set('provider', p.value)}
                className="block w-full border border-zinc-300 p-4 text-left transition-colors hover:border-zinc-500 aria-checked:border-brand-600 aria-checked:bg-brand-50 dark:border-white/15 dark:aria-checked:border-brand-500 dark:aria-checked:bg-brand-500/10"
              >
                <span className="flex items-center gap-2 font-medium">
                  <span
                    className={`size-3 rounded-full border-2 ${form.provider === p.value ? 'border-brand-600 bg-brand-600' : 'border-zinc-400'}`}
                  />
                  {p.label}
                </span>
                <span className="mt-1 block text-sm text-zinc-500 dark:text-zinc-400">{p.description}</span>
              </button>
            ))}
          </div>
        </FormSection>

        {form.provider === 'ElevenLabs' && (
          <FormSection title="ElevenLabs" description="El agente se crea en ElevenLabs con LLM «Custom LLM» apuntando a Mapache.">
            <PasswordField
              label="API key"
              autoComplete="off"
              placeholder={saved(settings.hasApiKey)}
              value={form.apiKey ?? ''}
              onChange={(e) => set('apiKey', e.target.value || null)}
            />
            <TextField label="ID del agente" placeholder="agent_…" {...text('agentId')} />
            <CopyField label="URL del Custom LLM (en el agente)" value={`${publicUrl}/api/llm/v1`} />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Como API key del Custom LLM, el token de tools del servidor (AgentWebhooks__ToolToken).
            </p>
          </FormSection>
        )}

        {form.provider === 'OpenAiRealtime' && (
          <FormSection title="OpenAI Realtime" description="Sin API key propia se usa la de OpenAI de la sección Inteligencia artificial.">
            <PasswordField
              label="API key (opcional)"
              autoComplete="off"
              placeholder={saved(settings.hasOpenAiApiKey) ?? 'La de Inteligencia artificial'}
              value={form.openAiApiKey ?? ''}
              onChange={(e) => set('openAiApiKey', e.target.value || null)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Modelo" placeholder="gpt-realtime-2.1" {...text('openAiModel')} />
              <SelectField label="Voz" value={form.openAiVoice ?? 'marin'} onChange={(e) => set('openAiVoice', e.target.value)}>
                {openAiVoices.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </SelectField>
            </div>
            <TextField
              label="Modelo de transcripción"
              placeholder="gpt-4o-transcribe"
              hint="Transcribe a quien llama para verlo en vivo en el panel."
              {...text('openAiTranscriptionModel')}
            />
          </FormSection>
        )}

        {form.provider === 'Deepgram' && (
          <FormSection
            title="Deepgram"
            description="Deepgram llama al Custom LLM de Mapache desde su nube: necesita la URL pública de la sección General."
          >
            <PasswordField
              label="API key"
              autoComplete="off"
              placeholder={saved(settings.hasDeepgramApiKey)}
              value={form.deepgramApiKey ?? ''}
              onChange={(e) => set('deepgramApiKey', e.target.value || null)}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <TextField label="Idioma" placeholder="es" {...text('deepgramLanguage')} />
              <TextField label="Reconocimiento" placeholder="nova-3" {...text('deepgramListenModel')} />
              <TextField label="Voz" placeholder="aura-2-celeste-es" {...text('deepgramSpeakModel')} />
            </div>
          </FormSection>
        )}

        {form.provider !== 'ElevenLabs' && (
          <FormSection title="Saludo" description="Lo primero que dice el bot al contestar. En ElevenLabs es el primer mensaje del agente.">
            <TextAreaField label="Saludo" rows={2} placeholder="Hola, gracias por llamar a…, ¿en qué te puedo ayudar?" {...text('greeting')} />
          </FormSection>
        )}
      </FormSections>

      <div className="flex justify-end border-t border-zinc-200 pt-6 dark:border-white/10">
        <Button type="submit" loading={save.isPending} className="sm:min-w-32">
          Guardar
        </Button>
      </div>
    </form>
  )
}
