import type { User } from '@/services/api'

/**
 * Quién está logueado, para pintar el panel sin esperar a la API. No es secreto: el JWT vive en una cookie
 * HttpOnly que JavaScript no puede leer (un XSS no puede robar la sesión). Si la cookie venció, la primera
 * llamada devuelve 401 y esto se limpia.
 */
export interface Session {
  expiresAt: string
  user: User
}

const STORAGE_KEY = 'wan.user'
// Versión anterior: guardaba el JWT en localStorage. Se borra para que no quede un token a la vista.
const LEGACY_KEY = 'wan.session'
const listeners = new Set<() => void>()

let session: Session | null = read()

function read(): Session | null {
  try {
    localStorage.removeItem(LEGACY_KEY)
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Session
    return new Date(parsed.expiresAt) > new Date() ? parsed : null
  } catch {
    return null
  }
}

export const authStore = {
  get: () => session,

  set(next: Session | null) {
    session = next
    try {
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Sin storage el panel pide la sesión de nuevo al recargar.
    }
    listeners.forEach((listener) => listener())
  },

  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}
