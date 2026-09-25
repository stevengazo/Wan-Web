import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api/client'
import { keys } from '@/services/api/keys'

export type SipTransport = 'Udp' | 'Tcp' | 'Tls'

/** Cifrado del audio (SRTP). */
export type MediaEncryption = 'Disabled' | 'Optional' | 'Mandatory'

export type DtmfMode = 'Rfc2833' | 'SipInfo' | 'Inband'

/** Quién contesta las llamadas entrantes de la cuenta. */
export type AnswerMode = 'Bot' | 'Human' | 'BotWithHandoff'

/** Códecs que acepta el backend, en su orden de preferencia sugerido. */
export const supportedCodecs = ['PCMU', 'PCMA', 'G722', 'G729', 'opus'] as const

/** Cuenta SIP genérica, con los datos de una cuenta de softphone como MicroSIP. */
export interface ExtensionSettings {
  name: string
  sipServer: string
  secondarySipServer: string | null
  sipProxy: string | null
  sipUsername: string
  sipDomain: string | null
  authUsername: string | null
  displayName: string | null
  transport: SipTransport
  publicAddress: string | null
  stunServer: string | null
  registerExpirySeconds: number
  registerRetrySeconds: number
  keepAliveSeconds: number
  /** 0 = lo elige el sistema. */
  localPort: number
  allowIpRewrite: boolean
  useIce: boolean
  mediaEncryption: MediaEncryption
  /** Habilitados, en orden de preferencia. */
  codecs: string[]
  dtmfMode: DtmfMode
  /** 0 = deshabilitado. */
  sessionTimerSeconds: number
  /** 0 = sin límite. */
  maxConcurrentCalls: number
  voicemailNumber: string | null
  dialPrefix: string | null
  hideCallerId: boolean
  answerMode: AnswerMode
  enabled: boolean
}

export interface Extension extends ExtensionSettings {
  id: string
  createdAt: string
  updatedAt: string
}

export interface ExtensionInput extends ExtensionSettings {
  /** En edición, vacío conserva la contraseña actual. */
  sipPassword: string
}

export const useExtensions = () =>
  useQuery({ queryKey: keys.extensions, queryFn: () => api<Extension[]>('/extensions') })

export type SipRegistrationState = 'Registering' | 'Registered' | 'Failed'

/** Estado del registro SIP de una extensión activa, según el motor. */
export interface ExtensionStatus {
  extensionId: string
  state: SipRegistrationState
  server: string
  error: string | null
  activeCalls: number
  since: string
}

/** Se refresca solo: el motor avisa cada cambio por SignalR (ExtensionStatusChanged). */
export const useExtensionStatuses = () =>
  useQuery({ queryKey: keys.extensionStatuses, queryFn: () => api<ExtensionStatus[]>('/extensions/status') })

export const useExtension = (id: string | undefined) =>
  useQuery({
    queryKey: keys.extension(id ?? ''),
    queryFn: () => api<Extension>(`/extensions/${id}`),
    enabled: !!id,
  })

export function useSaveExtension(id: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { success: 'Extensión guardada' },
    mutationFn: (input: ExtensionInput) =>
      id
        ? api<Extension>(`/extensions/${id}`, {
            method: 'PUT',
            body: { ...input, sipPassword: input.sipPassword || null },
          })
        : api<Extension>('/extensions', { method: 'POST', body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.extensions }),
  })
}

export function useDeleteExtension() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { success: 'Extensión eliminada' },
    mutationFn: (id: string) => api<void>(`/extensions/${id}`, { method: 'DELETE' }),
    onSuccess: (_, id) => {
      // Solo la lista: invalidar por prefijo volvería a pedir el detalle ya borrado (404).
      queryClient.removeQueries({ queryKey: keys.extension(id), exact: true })
      return queryClient.invalidateQueries({ queryKey: keys.extensions, exact: true })
    },
  })
}
