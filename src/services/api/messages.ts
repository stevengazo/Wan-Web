import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api/client'
import { keys } from '@/services/api/keys'

export type CallMessageStatus = 'New' | 'Read' | 'Done'

/** Recado que el bot tomó durante una llamada. */
export interface CallMessage {
  id: string
  recipient: string
  directoryEntryId: string | null
  directoryEntryName: string | null
  callerName: string | null
  callbackNumber: string | null
  body: string
  urgent: boolean
  status: CallMessageStatus
  conversationId: string | null
  createdAt: string
}

export const useMessages = () => useQuery({ queryKey: keys.messages, queryFn: () => api<CallMessage[]>('/messages') })

export function useUpdateMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CallMessageStatus }) =>
      api<void>(`/messages/${id}`, { method: 'PATCH', body: { status } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.messages }),
  })
}

export function useDeleteMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { success: 'Recado eliminado' },
    mutationFn: (id: string) => api<void>(`/messages/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.messages }),
  })
}

export interface MessageShare {
  /** Va en la ruta pública /r/{token}. */
  token: string
  expiresAt: string
}

/** Genera un enlace público con vencimiento para leer y escuchar el recado sin iniciar sesión. */
export function useShareMessage() {
  return useMutation({
    mutationFn: ({ id, expiresInHours }: { id: string; expiresInHours: number }) =>
      api<MessageShare>(`/messages/${id}/share`, { method: 'POST', body: { expiresInHours } }),
  })
}

/** Recado tal como lo ve quien abre el enlace público. */
export interface PublicMessage {
  recipient: string
  callerName: string | null
  callbackNumber: string | null
  body: string
  urgent: boolean
  createdAt: string
  expiresAt: string
  hasAudio: boolean
}

export const usePublicMessage = (token: string) =>
  useQuery({ queryKey: ['public-message', token], queryFn: () => api<PublicMessage>(`/public/messages/${encodeURIComponent(token)}`) })
