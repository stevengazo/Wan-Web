import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api/client'
import { keys } from '@/services/api/keys'

export interface Recording {
  id: string
  conversationId: string
  sizeBytes: number
  createdAt: string
}

export const useRecordings = () => useQuery({ queryKey: keys.recordings, queryFn: () => api<Recording[]>('/recordings') })

export function useDeleteRecording() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api<void>(`/recordings/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.recordings }),
  })
}
