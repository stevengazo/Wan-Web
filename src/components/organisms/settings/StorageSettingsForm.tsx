import { useState, type FormEvent } from 'react'
import { Button } from '@/components/atoms/Button'
import { TextField } from '@/components/molecules/Field'
import { PasswordField } from '@/components/molecules/PasswordField'
import { FormSection, FormSections } from '@/components/organisms/FormSection'
import { ApiError } from '@/services/api/client'
import { useSaveStorageSettings, useTestStorage, type SaveStorageSettings, type StorageProvider, type StorageSettings } from '@/services/api'

const providers: { value: StorageProvider; label: string; description: string }[] = [
  { value: 'Local', label: 'En el servidor', description: 'En el disco de Mapache (volumen «recordings» en Docker). Sin costo extra.' },
  { value: 'S3', label: 'Amazon S3 o compatible', description: 'AWS S3, Cloudflare R2, MinIO o DigitalOcean Spaces.' },
  { value: 'AzureBlob', label: 'Azure Blob Storage', description: 'Un contenedor de una cuenta de almacenamiento de Azure.' },
]

/** Dónde se guardan las grabaciones nuevas; las existentes quedan donde estaban. */
export function StorageSettingsForm({ settings }: { settings: StorageSettings }) {
  const save = useSaveStorageSettings()
  const test = useTestStorage()
  const [form, setForm] = useState<SaveStorageSettings>({
    provider: settings.provider,
    s3Bucket: settings.s3Bucket,
    s3Region: settings.s3Region,
    s3ServiceUrl: settings.s3ServiceUrl,
    s3AccessKeyId: settings.s3AccessKeyId,
    s3SecretKey: null,
    azureConnectionString: null,
    azureContainer: settings.azureContainer,
    prefix: settings.prefix,
  })
  const set = <K extends keyof SaveStorageSettings>(key: K, value: SaveStorageSettings[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    test.reset()
  }
  const errors = (save.error ?? test.error) instanceof ApiError ? ((save.error ?? test.error) as ApiError).fieldErrors : {}
  const text = (key: keyof SaveStorageSettings) => ({
    value: (form[key] as string | null) ?? '',
    // Vacío (no nulo) para que la API lo borre; nulo significa «sin cambios».
    onChange: (e: { target: { value: string } }) => set(key, e.target.value as never),
    error: errors[key]?.[0],
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    save.mutate(form, { onSuccess: () => setForm((f) => ({ ...f, s3SecretKey: null, azureConnectionString: null })) })
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSections>
        <FormSection title="Almacenamiento" description="Dónde se guardan las grabaciones nuevas. Las anteriores siguen donde quedaron.">
          <div role="radiogroup" aria-label="Almacenamiento de grabaciones" className="space-y-2">
            {providers.map((p) => (
              <button
                key={p.value}
                type="button"
                role="radio"
                aria-checked={form.provider === p.value}
                onClick={() => set('provider', p.value)}
                className="block w-full border border-zinc-300 p-4 text-left transition-colors hover:border-zinc-500 aria-checked:border-brand-600 aria-checked:bg-brand-50 dark:border-white/15 dark:aria-checked:border-brand-500 dark:aria-checked:bg-brand-500/10"
              >
                <span className="font-medium">{p.label}</span>
                <span className="mt-1 block text-sm text-zinc-500 dark:text-zinc-400">{p.description}</span>
              </button>
            ))}
          </div>
        </FormSection>

        {form.provider === 'S3' && (
          <FormSection title="S3" description="Con AWS basta la región. Para R2, MinIO o Spaces, la URL del servicio.">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Bucket" placeholder="mapache-grabaciones" {...text('s3Bucket')} />
              <TextField label="Región" placeholder="us-east-1" {...text('s3Region')} />
            </div>
            <TextField label="URL del servicio (opcional)" placeholder="https://<cuenta>.r2.cloudflarestorage.com" {...text('s3ServiceUrl')} />
            <TextField label="Access key ID" autoComplete="off" {...text('s3AccessKeyId')} />
            <PasswordField
              label="Secret access key"
              autoComplete="off"
              placeholder={settings.hasS3SecretKey ? '•••••••• guardada' : undefined}
              value={form.s3SecretKey ?? ''}
              onChange={(e) => set('s3SecretKey', e.target.value || null)}
              error={errors.s3SecretKey?.[0]}
            />
          </FormSection>
        )}

        {form.provider === 'AzureBlob' && (
          <FormSection title="Azure" description="La cadena de conexión debe incluir la clave de la cuenta: con ella se firman los enlaces para escuchar.">
            <PasswordField
              label="Cadena de conexión"
              autoComplete="off"
              placeholder={settings.hasAzureConnectionString ? '•••••••• guardada' : 'DefaultEndpointsProtocol=https;AccountName=…;AccountKey=…'}
              value={form.azureConnectionString ?? ''}
              onChange={(e) => set('azureConnectionString', e.target.value || null)}
              error={errors.azureConnectionString?.[0]}
            />
            <TextField label="Contenedor" placeholder="grabaciones" hint="Se crea si no existe." {...text('azureContainer')} />
          </FormSection>
        )}

        {form.provider !== 'Local' && (
          <FormSection title="Carpeta" description="Opcional: prefijo dentro del bucket o contenedor.">
            <TextField label="Prefijo" placeholder="mapache/grabaciones" {...text('prefix')} />
          </FormSection>
        )}
      </FormSections>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-zinc-200 pt-6 dark:border-white/10">
        {test.data && (
          <p className={`mr-auto text-sm ${test.data.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{test.data.message}</p>
        )}
        {form.provider !== 'Local' && (
          <Button variant="secondary" onClick={() => test.mutate(form)} loading={test.isPending}>
            Probar
          </Button>
        )}
        <Button type="submit" loading={save.isPending} className="sm:min-w-32">
          Guardar
        </Button>
      </div>
    </form>
  )
}
