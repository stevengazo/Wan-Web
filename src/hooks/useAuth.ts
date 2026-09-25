import { useSyncExternalStore } from 'react'
import { ApiError, api } from '@/services/api/client'
import { startExternalLogin, type ExternalProvider, type LoginResponse, type User } from '@/services/api'
import { authStore } from '@/stores/authStore'

/** Resultado del primer paso: listo, o falta el código de la app autenticadora. */
export type LoginResult = { mfaToken: string } | null

function storeSession(response: LoginResponse): LoginResult {
  if (response.mfaRequired && response.mfaToken) return { mfaToken: response.mfaToken }
  if (!response.accessToken || !response.expiresAt || !response.user) throw new ApiError(0, 'Respuesta inesperada del servidor')
  authStore.set({ accessToken: response.accessToken, expiresAt: response.expiresAt, user: response.user })
  return null
}

export function useAuth() {
  const session = useSyncExternalStore(authStore.subscribe, authStore.get)

  return {
    user: session?.user ?? null,
    isAdmin: session?.user.role === 'Admin',
    async login(email: string, password: string): Promise<LoginResult> {
      return storeSession(await api<LoginResponse>('/auth/login', { method: 'POST', body: { email, password } }))
    },
    async completeMfa(mfaToken: string, code: string) {
      storeSession(await api<LoginResponse>('/auth/login/mfa', { method: 'POST', body: { mfaToken, code } }))
    },
    async register(displayName: string, email: string, password: string) {
      storeSession(await api<LoginResponse>('/auth/register', { method: 'POST', body: { displayName, email, password } }))
    },
    /** Sale del panel hacia Google o Microsoft; la vuelta llega a /login/sso (o al perfil al vincular). */
    async startExternal(provider: ExternalProvider, mode: 'Login' | 'Link' = 'Login') {
      const { url } = await startExternalLogin(provider, mode)
      window.location.assign(url)
    },
    /** Token que dejó la API en el fragmento de /login/sso. */
    async acceptExternalToken(accessToken: string, expiresAt: string) {
      const response = await fetch('/api/auth/me', { headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` } })
      if (!response.ok) throw new ApiError(response.status, 'No se pudo completar el inicio de sesión')
      authStore.set({ accessToken, expiresAt, user: (await response.json()) as User })
    },
    /** Relee el usuario (p. ej. al activar el doble factor o definir la contraseña). */
    async refreshUser() {
      const user = await api<User>('/auth/me')
      const current = authStore.get()
      if (current) authStore.set({ ...current, user })
    },
    async updateProfile(displayName: string) {
      const user = await api<User>('/auth/me', { method: 'PUT', body: { displayName } })
      const current = authStore.get()
      if (current) authStore.set({ ...current, user })
    },
    changePassword: (currentPassword: string | null, newPassword: string) =>
      api<void>('/auth/password', { method: 'POST', body: { currentPassword, newPassword } }),
    logout: () => authStore.set(null),
  }
}
