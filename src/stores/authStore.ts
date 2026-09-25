import type { User } from '@/services/api/types'

export interface Session {
  accessToken: string
  expiresAt: string
  user: User
}

// El JWT vive en localStorage para sobrevivir recargas. Si en algún momento se exige más resistencia
// a XSS, migrar a cookie httpOnly emitida por la API.
const STORAGE_KEY = 'mapache.session'
const listeners = new Set<() => void>()

let session: Session | null = read()

function read(): Session | null {
  try {
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
      // Sin storage la sesión dura hasta recargar.
    }
    listeners.forEach((listener) => listener())
  },

  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}
