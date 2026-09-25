import { AnimatePresence, motion } from 'motion/react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { ApiError } from '../api/client'
import { useLlmProviders } from '../api/queries'
import type { LlmProvider } from '../api/types'
import { PasswordField } from '../auth/PasswordField'
import { useAuth } from '../auth/useAuth'
import { ThemeToggle } from '../theme/ThemeToggle'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { TextField } from '../ui/Field'
import { CopyIcon } from '../ui/icons'

export function SettingsPage() {
  const { isAdmin } = useAuth()

  return (
    <div>
      <h1 className="font-display text-4xl md:text-5xl">Configuración</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">Tu cuenta, la apariencia del panel y la conexión con la IA.</p>

      <div className="mt-10 divide-y divide-slate-200 border-t border-slate-200 dark:divide-white/10 dark:border-white/10">
        <Section title="Perfil" description="Cómo te ven los demás en el panel.">
          <ProfileForm />
        </Section>
        <Section title="Contraseña" description="Usa al menos 8 caracteres.">
          <PasswordForm />
        </Section>
        <Section title="Apariencia" description="Se guarda en este navegador.">
          <div className="space-y-4">
            <ThemeToggle />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Colapsa o expande el menú lateral con{' '}
              <kbd className="rounded border border-slate-300 px-1.5 py-0.5 font-sans text-xs dark:border-white/20">Ctrl</kbd>{' '}
              <kbd className="rounded border border-slate-300 px-1.5 py-0.5 font-sans text-xs dark:border-white/20">B</kbd>.
            </p>
          </div>
        </Section>
        {isAdmin && (
          <Section title="Inteligencia artificial" description="Proveedores del bot. Las API keys se configuran en el servidor.">
            <AiSettings />
          </Section>
        )}
      </div>
    </div>
  )
}

/** Fila de configuración: título y descripción a la izquierda desde md:, contenido a la derecha. */
function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 py-8 md:grid-cols-[220px_1fr] md:gap-10">
      <div>
        <h2 className="font-medium">{title}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <div className="max-w-md">{children}</div>
    </section>
  )
}

/** Confirmación breve que desaparece sola tras guardar. */
function Saved({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          role="status"
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          className="text-sm text-emerald-600 dark:text-emerald-400"
        >
          Guardado
        </motion.span>
      )}
    </AnimatePresence>
  )
}

function useFlash() {
  const [visible, setVisible] = useState(false)
  const flash = () => {
    setVisible(true)
    window.setTimeout(() => setVisible(false), 2000)
  }
  return [visible, flash] as const
}

function ProfileForm() {
  const { user, updateProfile } = useAuth()
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [error, setError] = useState<ApiError | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, flash] = useFlash()

  const changed = displayName.trim() !== (user?.displayName ?? '') && displayName.trim().length > 0

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await updateProfile(displayName.trim())
      flash()
    } catch (e) {
      setError(e instanceof ApiError ? e : new ApiError(0, 'No se pudo guardar'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="flex items-center gap-4">
        <Avatar name={displayName || user?.displayName || ''} size="lg" />
        <div className="min-w-0">
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
          <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
            {user?.role === 'Admin' ? 'Administrador' : 'Operador'}
          </span>
        </div>
      </div>
      <TextField
        label="Nombre"
        autoComplete="name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        error={error?.fieldErrors.displayName?.[0] ?? (error && !Object.keys(error.fieldErrors).length ? error.message : undefined)}
      />
      <div className="flex items-center gap-3">
        <Button type="submit" loading={saving} disabled={!changed}>
          Guardar
        </Button>
        <Saved show={saved} />
      </div>
    </form>
  )
}

function PasswordForm() {
  const { changePassword } = useAuth()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [error, setError] = useState<ApiError | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, flash] = useFlash()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await changePassword(current, next)
      setCurrent('')
      setNext('')
      flash()
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
      <PasswordField
        label="Contraseña actual"
        autoComplete="current-password"
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
        error={fieldErrors.currentPassword?.[0]}
      />
      <PasswordField
        label="Contraseña nueva"
        autoComplete="new-password"
        value={next}
        onChange={(e) => setNext(e.target.value)}
        error={fieldErrors.newPassword?.[0]}
      />
      {generalError && <p className="text-sm text-red-600 dark:text-red-400">{generalError}</p>}
      <div className="flex items-center gap-3">
        <Button type="submit" loading={saving} disabled={!current || next.length < 8}>
          Cambiar contraseña
        </Button>
        <Saved show={saved} />
      </div>
    </form>
  )
}

const providerLabels: Record<LlmProvider, string> = {
  OpenAi: 'OpenAI',
  Gemini: 'Gemini',
  Anthropic: 'Claude',
}

function AiSettings() {
  const { data: providers, isPending } = useLlmProviders()
  const customLlmUrl = `${window.location.origin}/api/llm/v1`

  return (
    <div className="space-y-6">
      <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 dark:divide-white/10 dark:border-white/10">
        {isPending && <li className="px-4 py-3 text-sm text-slate-500">Cargando…</li>}
        {providers?.map((p) => (
          <li key={p.provider} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-medium">
                {providerLabels[p.provider]}
                {p.isDefault && (
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-white dark:bg-white dark:text-slate-900">
                    Por defecto
                  </span>
                )}
              </p>
              <p className="truncate font-mono text-xs text-slate-500 dark:text-slate-400">{p.defaultModel || '—'}</p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 text-xs ${
                p.configured ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <span className={`size-1.5 rounded-full ${p.configured ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
              {p.configured ? 'Configurado' : 'Sin API key'}
            </span>
          </li>
        ))}
      </ul>

      <div>
        <p className="text-sm font-medium">URL del Custom LLM</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Pégala en el agente de ElevenLabs (LLM → Custom LLM), con el token de tools como API key.
        </p>
        <CopyField value={customLlmUrl} />
      </div>
    </div>
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
    <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 py-1 pl-3 pr-1 dark:border-white/10 dark:bg-white/5">
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
