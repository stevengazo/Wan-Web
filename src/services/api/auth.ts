export type UserRole = 'Admin' | 'Operator'

export interface User {
  id: string
  email: string
  displayName: string
  role: UserRole
  mfaEnabled: boolean
  /** Falso en cuentas creadas con Google o Microsoft que todavía no definieron una. */
  hasPassword: boolean
}

/** El JWT llega en una cookie HttpOnly. Con doble factor, el primer paso trae solo `mfaToken` para canjearlo con el código. */
export interface LoginResponse {
  expiresAt: string | null
  user: User | null
  mfaRequired: boolean
  mfaToken: string | null
}
