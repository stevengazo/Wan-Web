import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api/client'
import { keys } from '@/services/api/keys'

/** Destino al que el bot puede transferir una llamada. */
export interface DirectoryEntryInput {
  name: string
  department: string | null
  /** Extensión, número telefónico o URI SIP. */
  target: string
  /** Cuándo transferir aquí; le da contexto al bot. */
  description: string | null
  enabled: boolean
}

export interface DirectoryEntry extends DirectoryEntryInput {
  id: string
  createdAt: string
  updatedAt: string
}

export const useDirectory = () =>
  useQuery({ queryKey: keys.directory, queryFn: () => api<DirectoryEntry[]>('/directory') })

export const useDirectoryEntry = (id: string | undefined) =>
  useQuery({
    queryKey: keys.directoryEntry(id ?? ''),
    queryFn: () => api<DirectoryEntry>(`/directory/${id}`),
    enabled: !!id,
  })

export function useSaveDirectoryEntry(id: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: DirectoryEntryInput) =>
      id
        ? api<DirectoryEntry>(`/directory/${id}`, { method: 'PUT', body: input })
        : api<DirectoryEntry>('/directory', { method: 'POST', body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.directory }),
  })
}

export function useDeleteDirectoryEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api<void>(`/directory/${id}`, { method: 'DELETE' }),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: keys.directoryEntry(id), exact: true })
      return queryClient.invalidateQueries({ queryKey: keys.directory, exact: true })
    },
  })
}
