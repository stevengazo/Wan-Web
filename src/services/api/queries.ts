import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api/client'
import type {
  ActionResult,
  CallMessage,
  CallMessageStatus,
  CallSettings,
  DirectoryEntry,
  DirectoryEntryInput,
  Extension,
  ExtensionInput,
  FormAction,
  FormActionInput,
  FormDraft,
  FormSubmission,
  FormTemplate,
  FormTemplateInput,
  HttpTool,
  KnowledgeBase,
  KnowledgeBaseInput,
  KnowledgeDocument,
  KnowledgeHit,
  LlmSettings,
  McpAccessToken,
  McpServer,
  Recording,
  SaveHttpTool,
  SaveLlmSettings,
  SaveMcpServer,
  SaveSmtpSettings,
  SmtpSettings,
  SubmissionStatus,
} from '@/services/api/types'

const keys = {
  extensions: ['extensions'] as const,
  extension: (id: string) => ['extensions', id] as const,
  llmSettings: ['llm-settings'] as const,
  directory: ['directory'] as const,
  forms: ['forms'] as const,
  form: (id: string) => ['forms', id] as const,
  submissions: (formId: string) => ['forms', formId, 'submissions'] as const,
  messages: ['messages'] as const,
  recordings: ['recordings'] as const,
  callSettings: ['call-settings'] as const,
  formActions: (formId: string) => ['forms', formId, 'actions'] as const,
  smtp: ['smtp'] as const,
  knowledge: ['knowledge'] as const,
  httpTools: ['http-tools'] as const,
  mcpServers: ['mcp-servers'] as const,
  mcpTokens: ['mcp-tokens'] as const,
  knowledgeBase: (id: string) => ['knowledge', id] as const,
  knowledgeDocuments: (id: string) => ['knowledge', id, 'documents'] as const,
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

export const useForms = () => useQuery({ queryKey: keys.forms, queryFn: () => api<FormTemplate[]>('/forms') })

export const useForm = (id: string | undefined) =>
  useQuery({ queryKey: keys.form(id ?? ''), queryFn: () => api<FormTemplate>(`/forms/${id}`), enabled: !!id })

export function useSaveForm(id: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: FormTemplateInput) =>
      id ? api<FormTemplate>(`/forms/${id}`, { method: 'PUT', body: input }) : api<FormTemplate>('/forms', { method: 'POST', body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.forms }),
  })
}

export function useDeleteForm() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api<void>(`/forms/${id}`, { method: 'DELETE' }),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: keys.form(id) })
      return queryClient.invalidateQueries({ queryKey: keys.forms, exact: true })
    },
  })
}

export const useGenerateForm = () =>
  useMutation({ mutationFn: (description: string) => api<FormDraft>('/forms/generate', { method: 'POST', body: { description } }) })

export const useSubmissions = (formId: string) =>
  useQuery({ queryKey: keys.submissions(formId), queryFn: () => api<FormSubmission[]>(`/forms/${formId}/submissions`) })

export function useUpdateSubmission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SubmissionStatus }) =>
      api<FormSubmission>(`/form-submissions/${id}`, { method: 'PATCH', body: { status } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.forms }),
  })
}

export function useDeleteSubmission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api<void>(`/form-submissions/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.forms }),
  })
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
    mutationFn: (id: string) => api<void>(`/messages/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.messages }),
  })
}

export const useRecordings = () => useQuery({ queryKey: keys.recordings, queryFn: () => api<Recording[]>('/recordings') })

export function useDeleteRecording() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api<void>(`/recordings/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.recordings }),
  })
}

export const useCallSettings = () => useQuery({ queryKey: keys.callSettings, queryFn: () => api<CallSettings>('/settings/calls') })

export function useSaveCallSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CallSettings) => api<CallSettings>('/settings/calls', { method: 'PUT', body: input }),
    onSuccess: (settings) => queryClient.setQueryData(keys.callSettings, settings),
  })
}

export const useFormActions = (formId: string, enabled = true) =>
  useQuery({ queryKey: keys.formActions(formId), queryFn: () => api<FormAction[]>(`/forms/${formId}/actions`), enabled })

export function useSaveFormAction(formId: string, id: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: FormActionInput) =>
      id
        ? api<FormAction>(`/form-actions/${id}`, { method: 'PUT', body: input })
        : api<FormAction>(`/forms/${formId}/actions`, { method: 'POST', body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.formActions(formId) }),
  })
}

export function useDeleteFormAction(formId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api<void>(`/form-actions/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.formActions(formId) }),
  })
}

export const useTestFormAction = () =>
  useMutation({ mutationFn: (id: string) => api<ActionResult>(`/form-actions/${id}/test`, { method: 'POST' }) })

export function useRetryExecution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api<void>(`/action-executions/${id}/retry`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.forms }),
  })
}

export const useSmtpSettings = () => useQuery({ queryKey: keys.smtp, queryFn: () => api<SmtpSettings>('/settings/smtp') })

export function useSaveSmtpSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SaveSmtpSettings) => api<SmtpSettings>('/settings/smtp', { method: 'PUT', body: input }),
    onSuccess: (settings) => queryClient.setQueryData(keys.smtp, settings),
  })
}

export const useKnowledgeBases = () => useQuery({ queryKey: keys.knowledge, queryFn: () => api<KnowledgeBase[]>('/knowledge') })

export const useKnowledgeBase = (id: string | undefined) =>
  useQuery({ queryKey: keys.knowledgeBase(id ?? ''), queryFn: () => api<KnowledgeBase>(`/knowledge/${id}`), enabled: !!id })

export function useSaveKnowledgeBase(id: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: KnowledgeBaseInput) =>
      id ? api<KnowledgeBase>(`/knowledge/${id}`, { method: 'PUT', body: input }) : api<KnowledgeBase>('/knowledge', { method: 'POST', body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.knowledge }),
  })
}

export function useDeleteKnowledgeBase() {
  const queryClient = useQueryClient()
  return useMutation({
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
    mutationFn: (documentId: string) => api<void>(`/knowledge/documents/${documentId}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.knowledge }),
  })
}

export const useSearchKnowledge = () =>
  useMutation({
    mutationFn: (input: { query: string; knowledgeBaseId?: string }) =>
      api<KnowledgeHit[]>('/knowledge/search', { method: 'POST', body: input }),
  })

export const useHttpTools = () => useQuery({ queryKey: keys.httpTools, queryFn: () => api<HttpTool[]>('/http-tools') })

export function useSaveHttpTool(id: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SaveHttpTool) =>
      id ? api<HttpTool>(`/http-tools/${id}`, { method: 'PUT', body: input }) : api<HttpTool>('/http-tools', { method: 'POST', body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.httpTools }),
  })
}

export function useDeleteHttpTool() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api<void>(`/http-tools/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.httpTools }),
  })
}

export const useTestHttpTool = () =>
  useMutation({
    mutationFn: ({ id, args }: { id: string; args: Record<string, unknown> }) =>
      api<{ url: string; result: string }>(`/http-tools/${id}/test`, { method: 'POST', body: { arguments: args } }),
  })

export const useMcpServers = () => useQuery({ queryKey: keys.mcpServers, queryFn: () => api<McpServer[]>('/mcp-servers') })

export function useSaveMcpServer(id: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SaveMcpServer) =>
      id ? api<McpServer>(`/mcp-servers/${id}`, { method: 'PUT', body: input }) : api<McpServer>('/mcp-servers', { method: 'POST', body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.mcpServers }),
  })
}

export function useSyncMcpServer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api<McpServer>(`/mcp-servers/${id}/sync`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.mcpServers }),
  })
}

export function useDeleteMcpServer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api<void>(`/mcp-servers/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.mcpServers }),
  })
}

export const useTestMcpTool = () =>
  useMutation({
    mutationFn: ({ id, tool, args }: { id: string; tool: string; args: Record<string, unknown> }) =>
      api<{ result: string }>(`/mcp-servers/${id}/tools/${encodeURIComponent(tool)}/test`, { method: 'POST', body: { arguments: args } }),
  })

export const useMcpTokens = () => useQuery({ queryKey: keys.mcpTokens, queryFn: () => api<McpAccessToken[]>('/mcp-tokens') })

export function useCreateMcpToken() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => api<{ token: McpAccessToken; value: string }>('/mcp-tokens', { method: 'POST', body: { name } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.mcpTokens }),
  })
}

export function useRevokeMcpToken() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api<void>(`/mcp-tokens/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.mcpTokens }),
  })
}
