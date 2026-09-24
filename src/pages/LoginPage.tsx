import { motion } from 'motion/react'
import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/useAuth'
import { ThemeToggle } from '../theme/ThemeToggle'
import { Button } from '../ui/Button'
import { TextField } from '../ui/Field'

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
    <div className="flex min-h-dvh flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="flex justify-end">
        <ThemeToggle />
      </div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="mx-auto mt-10 w-full max-w-sm space-y-5 sm:mt-24"
        noValidate
      >
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Mapache</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Inicia sesión para administrar el bot.</p>
        </div>

        <TextField
          label="Correo"
          type="email"
          autoComplete="username"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: [6, -4, 2, 0] }}
            transition={{ duration: 0.3 }}
            className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300"
          >
            {error}
          </motion.p>
        )}

        <Button type="submit" loading={submitting} disabled={!email || !password} className="w-full">
          Entrar
        </Button>
      </motion.form>
    </div>
  )
}
