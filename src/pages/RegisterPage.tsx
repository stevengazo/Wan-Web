import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { ApiError } from '@/services/api/client'
import { AuthTemplate, FormAlert, SubmitButton } from '@/components/templates/AuthTemplate'
import { PasswordField } from '@/components/molecules/PasswordField'
import { useAuth } from '@/hooks/useAuth'
import { TextField } from '@/components/molecules/Field'

const minPasswordLength = 8

export function RegisterPage() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<ApiError | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  if (user) {
    return <Navigate to={from} replace />
  }

  const fieldErrors = error?.fieldErrors ?? {}
  const generalError = error && Object.keys(fieldErrors).length === 0 ? error.message : null
  const passwordTooShort = password.length > 0 && password.length < minPasswordLength

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!displayName.trim() || !email.trim() || password.length < minPasswordLength) {
      setError(
        new ApiError(0, '', {
          ...(displayName.trim() ? {} : { displayName: ['Campo obligatorio'] }),
          ...(email.trim() ? {} : { email: ['Campo obligatorio'] }),
          ...(password.length >= minPasswordLength ? {} : { password: [`Mínimo ${minPasswordLength} caracteres`] }),
        }),
      )
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await register(displayName, email, password)
      navigate(from, { replace: true })
    } catch (e) {
      setError(e instanceof ApiError ? e : new ApiError(0, 'No se pudo crear la cuenta'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthTemplate
      title="Crea tu cuenta"
      subtitle="Empieza a atender llamadas con IA en minutos."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" state={location.state} className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-zinc-100">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <TextField
          label="Nombre"
          autoComplete="name"
          placeholder="Ana Rodríguez"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          error={fieldErrors.displayName?.[0]}
        />
        <TextField
          label="Correo"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="tu@empresa.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email?.[0]}
        />
        <PasswordField
          label="Contraseña"
          autoComplete="new-password"
          required
          minLength={minPasswordLength}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint={`Mínimo ${minPasswordLength} caracteres.`}
          error={fieldErrors.password?.[0] ?? (passwordTooShort ? `Faltan ${minPasswordLength - password.length} caracteres` : undefined)}
        />

        {generalError && <FormAlert message={generalError} />}

        <SubmitButton loading={submitting}>
          Crear cuenta
        </SubmitButton>

      </form>
    </AuthTemplate>
  )
}
