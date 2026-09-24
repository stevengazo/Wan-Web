// Reflejan los DTOs de backend/src/Mapache.Api/Controllers. Mantener sincronizados.

export type UserRole = 'Admin' | 'Operator'

export interface User {
  id: string
  email: string
  displayName: string
  role: UserRole
}

export interface LoginResponse {
  accessToken: string
  expiresAt: string
  user: User
}

export type ProviderType = 'Zadarma' | 'Twilio' | 'Calmyway'

export interface Provider {
  id: string
  name: string
  type: ProviderType
  sipServer: string
}

export interface Extension {
  id: string
  name: string
  providerId: string
  providerName: string
  sipUsername: string
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export interface ExtensionInput {
  name: string
  providerId: string
  sipUsername: string
  /** En edición, vacío conserva la contraseña actual. */
  sipPassword: string
  enabled: boolean
}
