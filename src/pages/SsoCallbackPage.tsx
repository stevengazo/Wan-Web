import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'

/** Vuelta de Google o Microsoft: la API ya dejó la cookie de sesión; se carga el usuario y se entra. */
export function SsoCallbackPage() {
  const { acceptExternalLogin } = useAuth()
  const navigate = useNavigate()
  const started = useRef(false)

  useEffect(() => {
    // StrictMode monta dos veces en desarrollo: se pide una sola vez.
    if (started.current) return
    started.current = true
    acceptExternalLogin()
      .then(() => navigate('/', { replace: true }))
      .catch(() => navigate('/login?ssoError=' + encodeURIComponent('No se pudo completar el inicio de sesión'), { replace: true }))
  }, [acceptExternalLogin, navigate])

  return (
    <div className="flex min-h-dvh items-center justify-center bg-white dark:bg-zinc-950">
      <span className="size-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" aria-label="Entrando…" />
    </div>
  )
}
