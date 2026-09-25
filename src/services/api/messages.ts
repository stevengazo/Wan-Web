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
