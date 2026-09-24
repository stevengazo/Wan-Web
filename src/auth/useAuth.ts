import { useSyncExternalStore } from 'react'
import { api } from '../api/client'
import type { LoginResponse } from '../api/types'
import { authStore } from './authStore'

export function useAuth() {
  const session = useSyncExternalStore(authStore.subscribe, authStore.get)

  return {
    user: session?.user ?? null,
    isAdmin: session?.user.role === 'Admin',
    async login(email: string, password: string) {
      const response = await api<LoginResponse>('/auth/login', { method: 'POST', body: { email, password } })
      authStore.set(response)
    },
    logout: () => authStore.set(null),
  }
}
