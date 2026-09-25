import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'

/** Vuelta de Google o Microsoft: la API deja el token en el fragmento (#), que no viaja a ningún servidor. */
export function SsoCallbackPage() {
  const { acceptExternalToken } = useAuth()
  const navigate = useNavigate()
  const started = useRef(false)

  useEffect(() => {
    // StrictMode monta dos veces en desarrollo: el token se canjea una sola.
    if (started.current) return
    started.current = true
    const params = new URLSearchParams(window.location.hash.slice(1))
    const token = params.get('token')
    const expiresAt = params.get('expiresAt')
    // Se borra el token de la barra de direcciones y del historial.
    window.history.replaceState(null, '', window.location.pathname)
    if (!token || !expiresAt) {
      navigate('/login?ssoError=' + encodeURIComponent('Falta el token de inicio de sesión'), { replace: true })
      return
    }
    acceptExternalToken(token, expiresAt)
      .then(() => navigate('/', { replace: true }))
      .catch(() => navigate('/login?ssoError=' + encodeURIComponent('No se pudo completar el inicio de sesión'), { replace: true }))
  }, [acceptExternalToken, navigate])

  return (
    <div className="flex min-h-dvh items-center justify-center bg-white dark:bg-zinc-950">
      <span className="size-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" aria-label="Entrando…" />
    </div>
  )
}
