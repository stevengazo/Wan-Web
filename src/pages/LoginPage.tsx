import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router'
import { ApiError } from '@/services/api/client'
import { AuthTemplate, FormAlert, SubmitButton } from '@/components/templates/AuthTemplate'
import { PasswordField } from '@/components/molecules/PasswordField'
import { ExternalLoginButtons } from '@/components/molecules/ExternalLoginButtons'
import { useAuth } from '@/hooks/useAuth'
import { TextField } from '@/components/molecules/Field'

const linkClass =
  'font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-zinc-100'

export function LoginPage() {
  const { user, login, completeMfa, startExternal } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mfaToken, setMfaToken] = useState<string | null>(null)
  const [code, setCode] = useState('')
  // Error que dejó la vuelta de Google o Microsoft.
  const [error, setError] = useState<string | null>(searchParams.get('ssoError'))
  const [submitting, setSubmitting] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  if (user) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!email.trim() || !password) {
      setError('Escribe tu correo y tu contraseña.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const result = await login(email, password)
      if (result) setMfaToken(result.mfaToken)
      else navigate(from, { replace: true })
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo iniciar sesión')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCode = async (event: FormEvent) => {
    event.preventDefault()
    if (!mfaToken || !code.trim()) {
      setError('Escribe el código de tu app autenticadora.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await completeMfa(mfaToken, code)
      navigate(from, { replace: true })
    } catch (e) {
      // Si venció el paso de la contraseña, se vuelve a pedir.
      if (e instanceof ApiError && e.message.includes('venció')) setMfaToken(null)
      setError(e instanceof ApiError ? e.message : 'No se pudo verificar el código')
      setCode('')
    } finally {
      setSubmitting(false)
    }
  }

  if (mfaToken) {
    return (
      <AuthTemplate
        title="Doble factor"
        subtitle="Escribe el código de 6 dígitos de tu app autenticadora."
        footer={
          <button type="button" className={linkClass} onClick={() => { setMfaToken(null); setCode(''); setError(null) }}>
            Volver
          </button>
        }
      >
        <form onSubmit={handleCode} className="space-y-5" noValidate>
          <TextField
            label="Código"
            autoComplete="one-time-code"
            inputMode="numeric"
            autoFocus
            placeholder="123 456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            hint="¿Sin el teléfono? Usa uno de tus códigos de recuperación."
          />
          {error && <FormAlert message={error} />}
          <SubmitButton loading={submitting}>Verificar</SubmitButton>
        </form>
      </AuthTemplate>
    )
  }

  return (
    <AuthTemplate
      title="Hola de nuevo"
      subtitle="Inicia sesión para administrar tu central."
      footer={
        <>
          ¿No tienes cuenta?{' '}
          <Link to="/registro" state={location.state} className={linkClass}>
            Regístrate
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        <ExternalLoginButtons onSelect={(provider) => startExternal(provider)} onError={setError} />
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <TextField
            label="Correo"
            type="email"
            autoComplete="username"
            inputMode="email"
            placeholder="tu@empresa.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PasswordField
            label="Contraseña"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <FormAlert message={error} />}

          <SubmitButton loading={submitting}>
            Entrar
          </SubmitButton>
        </form>
      </div>
    </AuthTemplate>
  )
}
