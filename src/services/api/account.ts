import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api/client'
import { keys } from '@/services/api/keys'

export type ExternalProvider = 'Google' | 'Microsoft'

export interface ExternalProviderInfo {
  provider: ExternalProvider
  displayName: string
}

export interface LinkedAccount {
  provider: ExternalProvider
  email: string | null
  createdAt: string
}

export interface MfaStatus {
  enabled: boolean
  recoveryCodesLeft: number
}

export interface MfaSetup {
  /** En base32, para cargarlo a mano si no se puede escanear. */
  secret: string
  otpAuthUri: string
}

/** Proveedores habilitados en Configuración; la pantalla de login los pide sin sesión. */
export const useExternalProviders = () =>
  useQuery({ queryKey: keys.externalProviders, queryFn: () => api<ExternalProviderInfo[]>('/auth/external/providers'), staleTime: 60_000 })

/** Devuelve la URL del proveedor; hay que navegar a ella (no es un fetch). */
export const startExternalLogin = (provider: ExternalProvider, mode: 'Login' | 'Link') =>
  api<{ url: string }>(`/auth/external/${provider.toLowerCase()}/start`, { method: 'POST', body: { mode } })

export const useLinkedAccounts = () => useQuery({ queryKey: keys.linkedAccounts, queryFn: () => api<LinkedAccount[]>('/auth/external') })

export function useUnlinkAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { success: 'Cuenta desvinculada' },
    mutationFn: (provider: ExternalProvider) => api<void>(`/auth/external/${provider.toLowerCase()}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.linkedAccounts }),
  })
}

export const useMfaStatus = () => useQuery({ queryKey: keys.mfa, queryFn: () => api<MfaStatus>('/auth/mfa') })

export const useBeginMfaSetup = () => useMutation({ mutationFn: () => api<MfaSetup>('/auth/mfa/setup', { method: 'POST' }) })

export function useEnableMfa() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (code: string) => api<{ recoveryCodes: string[] }>('/auth/mfa/enable', { method: 'POST', body: { code } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.mfa }),
  })
}

export function useDisableMfa() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { success: 'Doble factor desactivado' },
    mutationFn: (code: string) => api<void>('/auth/mfa/disable', { method: 'POST', body: { code } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.mfa }),
  })
}

export function useRegenerateRecoveryCodes() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (code: string) => api<{ recoveryCodes: string[] }>('/auth/mfa/recovery-codes', { method: 'POST', body: { code } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.mfa }),
  })
}

export interface SsoSettings {
  googleEnabled: boolean
  googleClientId: string | null
  hasGoogleClientSecret: boolean
  microsoftEnabled: boolean
  microsoftClientId: string | null
  hasMicrosoftClientSecret: boolean
  microsoftTenant: string
  allowRegistration: boolean
  allowedDomains: string | null
  googleRedirectUri: string
  microsoftRedirectUri: string
}

/** Secretos vacíos conservan los guardados. */
export interface SaveSsoSettingsInput {
  googleEnabled: boolean
  googleClientId: string | null
  googleClientSecret: string | null
  microsoftEnabled: boolean
  microsoftClientId: string | null
  microsoftClientSecret: string | null
  microsoftTenant: string | null
  allowRegistration: boolean
  allowedDomains: string | null
}

export const useSsoSettings = () => useQuery({ queryKey: keys.ssoSettings, queryFn: () => api<SsoSettings>('/settings/sso') })

export function useSaveSsoSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { success: 'Inicio de sesión guardado' },
    mutationFn: (input: SaveSsoSettingsInput) => api<SsoSettings>('/settings/sso', { method: 'PUT', body: input }),
    onSuccess: (data) => {
      queryClient.setQueryData(keys.ssoSettings, data)
      void queryClient.invalidateQueries({ queryKey: keys.externalProviders })
    },
  })
}
