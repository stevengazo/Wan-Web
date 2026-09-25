import { useState, type FormEvent } from 'react'
import { ApiError } from '@/services/api/client'
import { useSaveSmtpSettings } from '@/services/api/queries'
import type { SmtpSettings } from '@/services/api/types'
import { PasswordField } from '@/components/molecules/PasswordField'
import { Button } from '@/components/atoms/Button'
import { TextField } from '@/components/molecules/Field'
import { FormSection, FormSections } from '@/components/organisms/FormSection'
import { Saved } from '@/components/atoms/Saved'
import { Switch } from '@/components/atoms/Switch'
import { useFlash } from '@/hooks/useFlash'

/** Servidor de correo para las acciones de formularios de tipo correo. */
export function SmtpSettingsForm({ settings }: { settings: SmtpSettings }) {
  const save = useSaveSmtpSettings()
  const [saved, flash] = useFlash()
  const [host, setHost] = useState(settings.host ?? '')
  const [port, setPort] = useState(settings.port)
  const [useTls, setUseTls] = useState(settings.useTls)
  const [username, setUsername] = useState(settings.username ?? '')
  const [password, setPassword] = useState('')
  const [from, setFrom] = useState(settings.from ?? '')

  const fieldErrors = save.error instanceof ApiError ? save.error.fieldErrors : {}

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    save.mutate(
      { host: host || null, port, useTls, username: username || null, password: password || null, from: from || null },
      {
        onSuccess: () => {
          setPassword('')
          flash()
        },
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSections>
        <FormSection title="Servidor SMTP" description="Lo usan las acciones de formularios que envían correo.">
          <div className="grid grid-cols-[1fr_110px] gap-4">
            <TextField
              label="Servidor"
              placeholder="smtp.office365.com"
              autoCapitalize="off"
              spellCheck={false}
              value={host}
              onChange={(e) => setHost(e.target.value)}
              error={fieldErrors.host?.[0]}
            />
            <TextField
              label="Puerto"
              type="number"
              inputMode="numeric"
              value={port}
              onChange={(e) => setPort(e.target.valueAsNumber || 0)}
              error={fieldErrors.port?.[0]}
            />
          </div>
          <Switch label="Cifrado" description="STARTTLS en 587, TLS directo en 465." checked={useTls} onChange={setUseTls} />
          <TextField
            label="Usuario"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={fieldErrors.username?.[0]}
          />
          <PasswordField
            label="Contraseña"
            autoComplete="new-password"
            placeholder={settings.hasPassword ? '•••••••• guardada' : ''}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            hint={settings.hasPassword ? 'Déjala vacía para conservar la guardada. Se guarda cifrada.' : 'Se guarda cifrada.'}
            error={fieldErrors.password?.[0]}
          />
          <TextField
            label="Remitente"
            placeholder="Mapache <bot@empresa.com>"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            error={fieldErrors.from?.[0]}
          />
        </FormSection>
      </FormSections>
      <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6 dark:border-white/10">
        <Saved show={saved} />
        {save.error && Object.keys(fieldErrors).length === 0 && <span className="text-sm text-red-600 dark:text-red-400">{save.error.message}</span>}
        <Button type="submit" loading={save.isPending} className="sm:min-w-32">
          Guardar
        </Button>
      </div>
    </form>
  )
}
