import { useState, type FormEvent } from 'react'
import { Button } from '@/components/atoms/Button'
import { Switch } from '@/components/atoms/Switch'
import { CopyField } from '@/components/molecules/CopyField'
import { TextField } from '@/components/molecules/Field'
import { PasswordField } from '@/components/molecules/PasswordField'
import { FormSection, FormSections } from '@/components/organisms/FormSection'
import { ApiError } from '@/services/api/client'
import { useSaveSsoSettings, type SsoSettings } from '@/services/api'

/** Entrar con Google y Microsoft. Los secretos no vuelven de la API: vacío conserva el guardado. */
export function SsoSettingsForm({ settings }: { settings: SsoSettings }) {
  const save = useSaveSsoSettings()
  const [form, setForm] = useState({
    googleEnabled: settings.googleEnabled,
    googleClientId: settings.googleClientId ?? '',
    googleClientSecret: '',
    microsoftEnabled: settings.microsoftEnabled,
    microsoftClientId: settings.microsoftClientId ?? '',
    microsoftClientSecret: '',
    microsoftTenant: settings.microsoftTenant,
    allowRegistration: settings.allowRegistration,
    allowedDomains: settings.allowedDomains ?? '',
  })
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((current) => ({ ...current, [key]: value }))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const optional = (value: string) => value.trim() || null
    save.mutate(
      {
        ...form,
        googleClientId: optional(form.googleClientId),
        googleClientSecret: optional(form.googleClientSecret),
        microsoftClientId: optional(form.microsoftClientId),
        microsoftClientSecret: optional(form.microsoftClientSecret),
        microsoftTenant: optional(form.microsoftTenant),
        allowedDomains: optional(form.allowedDomains),
      },
      { onSuccess: () => setForm((current) => ({ ...current, googleClientSecret: '', microsoftClientSecret: '' })) },
    )
  }

  const errors = save.error instanceof ApiError ? save.error.fieldErrors : {}

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSections>
        <FormSection
          title="Google"
          description="Crea un cliente OAuth de tipo «Aplicación web» en Google Cloud → APIs y servicios → Credenciales y registra esta URI de redirección."
        >
          <Switch label="Permitir entrar con Google" checked={form.googleEnabled} onChange={(value) => set('googleEnabled', value)} />
          <CopyField label="URI de redirección autorizada" value={settings.googleRedirectUri} />
          <TextField
            label="Client ID"
            placeholder="123456-abc.apps.googleusercontent.com"
            value={form.googleClientId}
            onChange={(e) => set('googleClientId', e.target.value)}
            error={errors.googleClientId?.[0]}
          />
          <PasswordField
            label="Client secret"
            autoComplete="off"
            placeholder={settings.hasGoogleClientSecret ? 'Guardado (vacío = conservar)' : ''}
            value={form.googleClientSecret}
            onChange={(e) => set('googleClientSecret', e.target.value)}
            error={errors.googleClientSecret?.[0]}
          />
        </FormSection>

        <FormSection
          title="Microsoft"
          description="Registra una aplicación en Microsoft Entra ID → Registros de aplicaciones, con plataforma «Web» y esta URI de redirección. Crea un secreto en «Certificados y secretos»."
        >
          <Switch label="Permitir entrar con Microsoft" checked={form.microsoftEnabled} onChange={(value) => set('microsoftEnabled', value)} />
          <CopyField label="URI de redirección" value={settings.microsoftRedirectUri} />
          <TextField
            label="ID de aplicación (cliente)"
            placeholder="00000000-0000-0000-0000-000000000000"
            value={form.microsoftClientId}
            onChange={(e) => set('microsoftClientId', e.target.value)}
            error={errors.microsoftClientId?.[0]}
          />
          <PasswordField
            label="Secreto de cliente (valor)"
            autoComplete="off"
            placeholder={settings.hasMicrosoftClientSecret ? 'Guardado (vacío = conservar)' : ''}
            value={form.microsoftClientSecret}
            onChange={(e) => set('microsoftClientSecret', e.target.value)}
            error={errors.microsoftClientSecret?.[0]}
          />
          <TextField
            label="Cuentas aceptadas"
            placeholder="organizations"
            value={form.microsoftTenant}
            onChange={(e) => set('microsoftTenant', e.target.value)}
            hint="El ID de inquilino (directorio) de tu empresa para aceptar solo sus cuentas. «organizations» = cualquier cuenta de trabajo; «common» = también personales."
            error={errors.microsoftTenant?.[0]}
          />
        </FormSection>

        <FormSection
          title="Registro"
          description="Sin registro, solo entran quienes ya vincularon su cuenta desde el perfil. Nunca se vincula una cuenta por coincidencia de correo."
        >
          <Switch
            label="Crear la cuenta la primera vez que alguien entra"
            description="Con rol Operador; un administrador puede cambiarlo en Usuarios."
            checked={form.allowRegistration}
            onChange={(value) => set('allowRegistration', value)}
          />
          <TextField
            label="Dominios permitidos"
            placeholder="miempresa.com, filial.com"
            value={form.allowedDomains}
            onChange={(e) => set('allowedDomains', e.target.value)}
            hint="Vacío = cualquier correo. Con Microsoft conviene además fijar el ID de inquilino."
            error={errors.allowedDomains?.[0]}
          />
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
