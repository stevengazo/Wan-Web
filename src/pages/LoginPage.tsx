import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { ApiError } from '../api/client'
import { AuthLayout, FormAlert } from '../auth/AuthLayout'
import { PasswordField } from '../auth/PasswordField'
import { useAuth } from '../auth/useAuth'
import { Button } from '../ui/Button'
import { TextField } from '../ui/Field'
import { MailIcon } from '../ui/icons'

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  if (user) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo iniciar sesión')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Bienvenido de nuevo"
      subtitle="Inicia sesión para administrar el bot."
      footer={
        <>
          ¿No tienes cuenta?{' '}
          <Link to="/registro" state={location.state} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
            Regístrate
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <TextField
          label="Correo"
          type="email"
          autoComplete="username"
          inputMode="email"
          placeholder="tu@empresa.com"
          icon={<MailIcon />}
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

        <Button type="submit" loading={submitting} disabled={!email || !password} className="w-full shadow-sm shadow-indigo-600/20">
          Entrar
        </Button>
      </form>
    </AuthLayout>
  )
}
