import { useState, type FormEvent } from 'react'
import { Button } from '@/components/atoms/Button'
import { TextField } from '@/components/molecules/Field'
import { FormSection, FormSections } from '@/components/organisms/FormSection'
import { ApiError } from '@/services/api/client'
import { useSaveSiteSettings, type SiteSettings } from '@/services/api'

/** URL pública del panel: la que se configura en ElevenLabs y en los clientes MCP. */
export function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const save = useSaveSiteSettings()
  const [publicUrl, setPublicUrl] = useState(settings.publicUrl ?? '')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    save.mutate({ publicUrl: publicUrl.trim() || null })
  }

  const error = save.error instanceof ApiError ? save.error.fieldErrors.publicUrl?.[0] : undefined
  const hint = settings.environmentUrl
    ? `Vacío = la del entorno (App__PublicUrl): ${settings.environmentUrl}`
    : 'También se puede fijar con App__PublicUrl en el .env de la API. La del panel tiene prioridad.'

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSections>
        <FormSection
          title="URL pública"
          description="Con la que se llega a Mapache desde internet. Se usa en las URLs que se copian para ElevenLabs (Custom LLM, tools, webhook) y para los clientes MCP."
        >
          <TextField
            label="URL"
            type="url"
            inputMode="url"
            placeholder={settings.environmentUrl ?? 'https://mapache.miempresa.com'}
            value={publicUrl}
            onChange={(e) => setPublicUrl(e.target.value)}
            hint={hint}
            error={error}
          />
          {!settings.effectiveUrl && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Sin URL pública, el panel muestra la de esta pestaña ({window.location.origin}), que ElevenLabs no alcanza si es local.
            </p>
          )}
        </FormSection>
      </FormSections>
      <div className="flex justify-end border-t border-zinc-200 pt-6 dark:border-white/10">
        <Button type="submit" loading={save.isPending} className="sm:min-w-32">
          Guardar
        </Button>
      </div>
    </form>
  )
}
