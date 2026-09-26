import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api/client'
import { keys } from '@/services/api/keys'

export type StorageProvider = 'Local' | 'S3' | 'AzureBlob'

export interface Recording {
  id: string
  conversationId: string
  sizeBytes: number
  createdAt: string
  /** Dónde quedó guardada. */
  storage: StorageProvider
  /** audio/mpeg (ElevenLabs) o audio/wav (grabación de Wan). */
  contentType: string
  callId: string | null
  durationSeconds: number | null
}

export const useRecordings = () => useQuery({ queryKey: keys.recordings, queryFn: () => api<Recording[]>('/recordings') })

export function useDeleteRecording() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { success: 'Grabación eliminada' },
    mutationFn: (id: string) => api<void>(`/recordings/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.recordings }),
  })
}
