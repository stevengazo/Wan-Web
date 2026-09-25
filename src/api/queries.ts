import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import type { DirectoryEntry, DirectoryEntryInput, Extension, ExtensionInput, LlmSettings, SaveLlmSettings } from './types'

const keys = {
  extensions: ['extensions'] as const,
  extension: (id: string) => ['extensions', id] as const,
  llmSettings: ['llm-settings'] as const,
  directory: ['directory'] as const,
  directoryEntry: (id: string) => ['directory', id] as const,
}

export const useExtensions = () =>
  useQuery({ queryKey: keys.extensions, queryFn: () => api<Extension[]>('/extensions') })

export const useExtension = (id: string | undefined) =>
  useQuery({
    queryKey: keys.extension(id ?? ''),
    queryFn: () => api<Extension>(`/extensions/${id}`),
    enabled: !!id,
  })

export const useLlmSettings = () =>
  useQuery({ queryKey: keys.llmSettings, queryFn: () => api<LlmSettings>('/llm/settings') })

export function useSaveLlmSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SaveLlmSettings) => api<LlmSettings>('/llm/settings', { method: 'PUT', body: input }),
    onSuccess: (settings) => queryClient.setQueryData(keys.llmSettings, settings),
  })
}

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
