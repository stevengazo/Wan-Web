import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api/client'
import { keys } from '@/services/api/keys'

/** Conjunto de documentos que el bot consulta durante la llamada. */
export interface KnowledgeBaseInput {
  name: string
  description: string | null
  enabled: boolean
}

export interface KnowledgeBase extends KnowledgeBaseInput {
  id: string
  documentCount: number
  chunkCount: number
  createdAt: string
}

export type KnowledgeDocumentStatus = 'Ready' | 'Failed'

export interface KnowledgeDocument {
  id: string
  fileName: string
  sizeBytes: number
  status: KnowledgeDocumentStatus
  /** Por qué no se pudo leer. */
  error: string | null
  chunkCount: number
  createdAt: string
}

export interface KnowledgeHit {
  text: string
  documentName: string
  baseName: string
  rank: number
}

export const useKnowledgeBases = () => useQuery({ queryKey: keys.knowledge, queryFn: () => api<KnowledgeBase[]>('/knowledge') })

export const useKnowledgeBase = (id: string | undefined) =>
  useQuery({ queryKey: keys.knowledgeBase(id ?? ''), queryFn: () => api<KnowledgeBase>(`/knowledge/${id}`), enabled: !!id })

export function useSaveKnowledgeBase(id: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { success: 'Base guardada' },
    mutationFn: (input: KnowledgeBaseInput) =>
      id ? api<KnowledgeBase>(`/knowledge/${id}`, { method: 'PUT', body: input }) : api<KnowledgeBase>('/knowledge', { method: 'POST', body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.knowledge }),
  })
}

export function useDeleteKnowledgeBase() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { success: 'Base eliminada' },
    mutationFn: (id: string) => api<void>(`/knowledge/${id}`, { method: 'DELETE' }),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: keys.knowledgeBase(id) })
      return queryClient.invalidateQueries({ queryKey: keys.knowledge, exact: true })
    },
  })
}

export const useKnowledgeDocuments = (id: string) =>
  useQuery({ queryKey: keys.knowledgeDocuments(id), queryFn: () => api<KnowledgeDocument[]>(`/knowledge/${id}/documents`) })

export function useUploadDocuments(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (files: File[]) => {
      const form = new FormData()
      files.forEach((file) => form.append('files', file))
      return api<KnowledgeDocument[]>(`/knowledge/${id}/documents`, { method: 'POST', body: form })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.knowledge }),
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { success: 'Documento eliminado' },
    mutationFn: (documentId: string) => api<void>(`/knowledge/documents/${documentId}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.knowledge }),
  })
}

export const useSearchKnowledge = () =>
  useMutation({
    meta: { silentError: true },
    mutationFn: (input: { query: string; knowledgeBaseId?: string }) =>
      api<KnowledgeHit[]>('/knowledge/search', { method: 'POST', body: input }),
  })
