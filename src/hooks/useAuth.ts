import { useSyncExternalStore } from 'react'
import { api } from '@/services/api/client'
import type { LoginResponse, User } from '@/services/api/types'
import { authStore } from '@/stores/authStore'

export function useAuth() {
  const session = useSyncExternalStore(authStore.subscribe, authStore.get)

  return {
    user: session?.user ?? null,
    isAdmin: session?.user.role === 'Admin',
    async login(email: string, password: string) {
      const response = await api<LoginResponse>('/auth/login', { method: 'POST', body: { email, password } })
      authStore.set(response)
    },
    async register(displayName: string, email: string, password: string) {
      const response = await api<LoginResponse>('/auth/register', {
        method: 'POST',
        body: { displayName, email, password },
      })
      authStore.set(response)
    },
    async updateProfile(displayName: string) {
      const user = await api<User>('/auth/me', { method: 'PUT', body: { displayName } })
      const current = authStore.get()
      if (current) authStore.set({ ...current, user })
    },
    changePassword: (currentPassword: string, newPassword: string) =>
      api<void>('/auth/password', { method: 'POST', body: { currentPassword, newPassword } }),
    logout: () => authStore.set(null),
  }
}
