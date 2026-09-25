import { useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import toast from 'react-hot-toast'
import { ApiError } from '@/services/api/client'
import { PasswordField } from '@/components/molecules/PasswordField'
import { useAuth } from '@/hooks/useAuth'
import { ThemeToggle } from '@/components/molecules/ThemeToggle'
import { Avatar } from '@/components/atoms/Avatar'
import { Button } from '@/components/atoms/Button'
import { TextField } from '@/components/molecules/Field'
import { FormSection, FormSections } from '@/components/organisms/FormSection'
import { LinkedAccountsSection } from '@/components/organisms/profile/LinkedAccountsSection'
import { MfaSection } from '@/components/organisms/profile/MfaSection'

export function ProfilePage() {
  const { user, refreshUser, startExternal } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  // Vuelta de vincular Google o Microsoft.
  useEffect(() => {
    const error = searchParams.get('ssoError')
    const linked = searchParams.get('sso') === 'linked'
    if (!error && !linked) return
    if (error) toast.error(error)
    else toast.success('Cuenta vinculada')
    setSearchParams({}, { replace: true })
  }, [searchParams, setSearchParams])

  return (
    <div>
      <div className="flex items-center gap-5">
        <Avatar name={user?.displayName ?? ''} size="lg" />
        <div className="min-w-0">
          <h1 className="truncate font-display text-4xl md:text-5xl">{user?.displayName}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <span className="truncate">{user?.email}</span>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
              {user?.role === 'Admin' ? 'Administrador' : 'Operador'}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-10">
        <FormSections>
          <FormSection title="Datos" description="Cómo te ven los demás en el panel.">
            <ProfileForm />
          </FormSection>
          <FormSection
            title="Contraseña"
            description={user?.hasPassword ? 'Usa al menos 8 caracteres.' : 'Entraste con Google o Microsoft: define una para entrar también con tu correo.'}
          >
            <PasswordForm hasPassword={user?.hasPassword ?? true} onSaved={() => void refreshUser()} />
          </FormSection>
          <FormSection title="Doble factor" description="Un código de tu teléfono además de la contraseña. No aplica al entrar con Google o Microsoft: ahí lo pide tu proveedor.">
            <MfaSection onChanged={() => void refreshUser()} />
          </FormSection>
          <FormSection title="Cuentas vinculadas" description="Entra con tu cuenta de Google o Microsoft de la empresa.">
            <LinkedAccountsSection onLink={(provider) => startExternal(provider, 'Link')} />
          </FormSection>
          <FormSection title="Apariencia" description="Se guarda en este navegador.">
            <ThemeToggle />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Colapsa o expande el menú lateral con{' '}
              <kbd className="rounded border border-zinc-300 px-1.5 py-0.5 font-sans text-xs dark:border-white/20">Ctrl</kbd>{' '}
              <kbd className="rounded border border-zinc-300 px-1.5 py-0.5 font-sans text-xs dark:border-white/20">B</kbd>.
            </p>
          </FormSection>
        </FormSections>
      </div>
    </div>
  )
}

function ProfileForm() {
  const { user, updateProfile } = useAuth()
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [error, setError] = useState<ApiError | null>(null)
  const [saving, setSaving] = useState(false)

  const changed = displayName.trim() !== (user?.displayName ?? '') && displayName.trim().length > 0

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await updateProfile(displayName.trim())
    } catch (e) {
      setError(e instanceof ApiError ? e : new ApiError(0, 'No se pudo guardar'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <TextField
        label="Nombre"
        autoComplete="name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        error={error?.fieldErrors.displayName?.[0] ?? (error && !Object.keys(error.fieldErrors).length ? error.message : undefined)}
      />
      <TextField label="Correo" value={user?.email ?? ''} disabled hint="El correo no se puede cambiar." />
      <div className="flex items-center gap-3">
        <Button type="submit" loading={saving} disabled={!changed}>
          Guardar
        </Button>
      </div>
    </form>
  )
}

function PasswordForm({ hasPassword, onSaved }: { hasPassword: boolean; onSaved: () => void }) {
  const { changePassword } = useAuth()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [error, setError] = useState<ApiError | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await changePassword(hasPassword ? current : null, next)
      setCurrent('')
      setNext('')
      toast.success(hasPassword ? 'Contraseña cambiada' : 'Contraseña definida')
      if (!hasPassword) onSaved()
    } catch (e) {
      setError(e instanceof ApiError ? e : new ApiError(0, 'No se pudo cambiar la contraseña'))
    } finally {
      setSaving(false)
    }
  }

  const fieldErrors = error?.fieldErrors ?? {}
  const generalError = error && Object.keys(fieldErrors).length === 0 ? error.message : null

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {hasPassword && (
        <PasswordField
          label="Contraseña actual"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          error={fieldErrors.currentPassword?.[0]}
        />
      )}
      <PasswordField
        label="Contraseña nueva"
        autoComplete="new-password"
        value={next}
        onChange={(e) => setNext(e.target.value)}
        error={fieldErrors.newPassword?.[0]}
      />
      {generalError && <p className="text-sm text-red-600 dark:text-red-400">{generalError}</p>}
      <div className="flex items-center gap-3">
        <Button type="submit" loading={saving} disabled={(hasPassword && !current) || next.length < 8}>
          {hasPassword ? 'Cambiar contraseña' : 'Definir contraseña'}
        </Button>
      </div>
    </form>
  )
}
