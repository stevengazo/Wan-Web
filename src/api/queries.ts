import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
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
  LlmSettings,
  Recording,
  SaveLlmSettings,
  SaveSmtpSettings,
  SmtpSettings,
  SubmissionStatus,
} from './types'

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
