import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api/client'
import { keys } from '@/services/api/keys'

export type FormFieldType = 'Text' | 'Number' | 'Phone' | 'Email' | 'Date' | 'YesNo' | 'Choice'

export interface FormField {
  /** Identificador estable que usa el bot (minúsculas, números y guion bajo). */
  key: string
  label: string
  type: FormFieldType
  required: boolean
  hint: string | null
  options: string[]
}

export interface FormTemplateInput {
  name: string
  /** Cuándo usarlo; le da contexto al bot. */
  description: string | null
  fields: FormField[]
  enabled: boolean
}

/** Borrador que arma la IA: se carga en el editor para revisarlo antes de guardar. */
export interface FormDraft {
  name: string
  description: string | null
  fields: FormField[]
}

export interface FormTemplate extends FormTemplateInput {
  id: string
  submissionCount: number
  newSubmissionCount: number
  createdAt: string
  updatedAt: string
}

export type SubmissionStatus = 'New' | 'Reviewed'

export interface FormSubmission {
  id: string
  formTemplateId: string
  values: Record<string, string>
  conversationId: string | null
  callerNumber: string | null
  status: SubmissionStatus
  createdAt: string
  /** Acciones que disparó esta respuesta y cómo les fue. */
  actions: ActionExecution[]
}

export type FormActionType = 'Webhook' | 'Teams' | 'GoogleChat' | 'Slack' | 'Email'

export interface FormActionInput {
  type: FormActionType
  name: string
  /** URL del webhook, o correos separados por coma. */
  target: string
  /** Solo webhook propio; vacío conserva el guardado. */
  secret: string | null
  clearSecret: boolean
  enabled: boolean
}

export interface FormAction {
  id: string
  formTemplateId: string
  type: FormActionType
  name: string
  target: string
  hasSecret: boolean
  enabled: boolean
}

export type ActionExecutionStatus = 'Pending' | 'Succeeded' | 'Failed'

export interface ActionExecution {
  id: string
  formActionId: string
  actionName: string
  actionType: FormActionType
  status: ActionExecutionStatus
  attempts: number
  lastError: string | null
  completedAt: string | null
}

/** Respuesta de una prueba o de una tool: ok y un mensaje para mostrar. */
export interface ActionResult {
  ok: boolean
  message: string
}

export const useForms = () => useQuery({ queryKey: keys.forms, queryFn: () => api<FormTemplate[]>('/forms') })

export const useForm = (id: string | undefined) =>
  useQuery({ queryKey: keys.form(id ?? ''), queryFn: () => api<FormTemplate>(`/forms/${id}`), enabled: !!id })

export function useSaveForm(id: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { success: 'Formulario guardado' },
    mutationFn: (input: FormTemplateInput) =>
      id ? api<FormTemplate>(`/forms/${id}`, { method: 'PUT', body: input }) : api<FormTemplate>('/forms', { method: 'POST', body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.forms }),
  })
}

export function useDeleteForm() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { success: 'Formulario eliminado' },
    mutationFn: (id: string) => api<void>(`/forms/${id}`, { method: 'DELETE' }),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: keys.form(id) })
      return queryClient.invalidateQueries({ queryKey: keys.forms, exact: true })
    },
  })
}

export const useGenerateForm = () =>
  useMutation({
    meta: { silentError: true }, mutationFn: (description: string) => api<FormDraft>('/forms/generate', { method: 'POST', body: { description } }) })

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
    meta: { success: 'Respuesta eliminada' },
    mutationFn: (id: string) => api<void>(`/form-submissions/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.forms }),
  })
}

export const useFormActions = (formId: string, enabled = true) =>
  useQuery({ queryKey: keys.formActions(formId), queryFn: () => api<FormAction[]>(`/forms/${formId}/actions`), enabled })

export function useSaveFormAction(formId: string, id: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { success: 'Acción guardada' },
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
    meta: { success: 'Acción eliminada' },
    mutationFn: (id: string) => api<void>(`/form-actions/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.formActions(formId) }),
  })
}

export const useTestFormAction = () =>
  useMutation({
    meta: { silentError: true }, mutationFn: (id: string) => api<ActionResult>(`/form-actions/${id}/test`, { method: 'POST' }) })

export function useRetryExecution() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { success: 'Reintento en cola' },
    mutationFn: (id: string) => api<void>(`/action-executions/${id}/retry`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.forms }),
  })
}
