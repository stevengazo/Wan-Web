import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import type { Extension, ExtensionInput } from './types'

const keys = {
  extensions: ['extensions'] as const,
  extension: (id: string) => ['extensions', id] as const,
}

export const useExtensions = () =>
  useQuery({ queryKey: keys.extensions, queryFn: () => api<Extension[]>('/extensions') })

export const useExtension = (id: string | undefined) =>
  useQuery({
    queryKey: keys.extension(id ?? ''),
    queryFn: () => api<Extension>(`/extensions/${id}`),
    enabled: !!id,
  })

export function useSaveExtension(id: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
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
    mutationFn: (id: string) => api<void>(`/extensions/${id}`, { method: 'DELETE' }),
    onSuccess: (_, id) => {
      // Solo la lista: invalidar por prefijo volvería a pedir el detalle ya borrado (404).
      queryClient.removeQueries({ queryKey: keys.extension(id), exact: true })
      return queryClient.invalidateQueries({ queryKey: keys.extensions, exact: true })
    },
  })
}
