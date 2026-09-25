import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api/client'
import { keys } from '@/services/api/keys'

export type CampaignStatus = 'Draft' | 'Running' | 'Paused' | 'Completed'

export type CampaignContactStatus = 'Pending' | 'Calling' | 'Completed' | 'NoAnswer' | 'Busy' | 'Failed'

export interface CampaignProgress {
  total: number
  pending: number
  calling: number
  completed: number
  noAnswer: number
  busy: number
  failed: number
  /** Resultado registrado por el bot → cantidad de contactos. */
  outcomes: Record<string, number>
}

export interface CampaignInput {
  name: string
  extensionId: string
  /** Objetivo y guion; admite {{variables}} del contacto. */
  instructions: string
  openingLine: string | null
  outcomes: string[]
  maxConcurrentCalls: number
  maxAttempts: number
  retryMinutes: number
  respectBusinessHours: boolean
}

export interface Campaign extends CampaignInput {
  id: string
  extensionName: string
  status: CampaignStatus
  createdAt: string
  startedAt: string | null
  completedAt: string | null
  progress: CampaignProgress
}

export interface CampaignContact {
  id: string
  phoneNumber: string
  name: string | null
  variables: Record<string, string>
  status: CampaignContactStatus
  attempts: number
  nextAttemptAt: string | null
  lastCallId: string | null
  lastResult: string | null
  outcome: string | null
  notes: string | null
  updatedAt: string | null
}

export interface ImportContactsResult {
  imported: number
  skipped: number
  problems: string[]
}

export const useCampaigns = () => useQuery({ queryKey: keys.campaigns, queryFn: () => api<Campaign[]>('/campaigns') })

export const useCampaign = (id: string | undefined) =>
  useQuery({ queryKey: keys.campaign(id ?? ''), queryFn: () => api<Campaign>(`/campaigns/${id}`), enabled: !!id })

export const useCampaignContacts = (id: string) =>
  useQuery({ queryKey: keys.campaignContacts(id), queryFn: () => api<CampaignContact[]>(`/campaigns/${id}/contacts`) })

export function useSaveCampaign(id: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { success: 'Campaña guardada' },
    mutationFn: (input: CampaignInput) =>
      id ? api<Campaign>(`/campaigns/${id}`, { method: 'PUT', body: input }) : api<Campaign>('/campaigns', { method: 'POST', body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.campaigns }),
  })
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { success: 'Campaña eliminada' },
    mutationFn: (id: string) => api<void>(`/campaigns/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.campaigns }),
  })
}

/** Iniciar o pausar: el marcador toma o deja los pendientes en unos segundos. */
export function useCampaignControl(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (action: 'start' | 'pause') => api<Campaign>(`/campaigns/${id}/${action}`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.campaigns }),
  })
}

export function useImportContacts(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (csv: string) => api<ImportContactsResult>(`/campaigns/${id}/contacts/import`, { method: 'POST', body: { csv } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.campaigns }),
  })
}

export function useContactAction(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ contactId, action }: { contactId: string; action: 'retry' | 'delete' }) =>
      action === 'retry'
        ? api<void>(`/campaigns/${id}/contacts/${contactId}/retry`, { method: 'POST' })
        : api<void>(`/campaigns/${id}/contacts/${contactId}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.campaigns }),
  })
}
