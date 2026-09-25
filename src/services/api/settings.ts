import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api/client'
import { keys } from '@/services/api/keys'

export interface SmtpSettings {
  host: string | null
  port: number
  useTls: boolean
  username: string | null
  hasPassword: boolean
  from: string | null
}

export interface SaveSmtpSettings extends Omit<SmtpSettings, 'hasPassword'> {
  /** Vacía conserva la guardada. */
  password: string | null
}

export interface CallSettings {
  recordCalls: boolean
  recordingNotice: string | null
}

export const useCallSettings = () => useQuery({ queryKey: keys.callSettings, queryFn: () => api<CallSettings>('/settings/calls') })

export function useSaveCallSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CallSettings) => api<CallSettings>('/settings/calls', { method: 'PUT', body: input }),
    onSuccess: (settings) => queryClient.setQueryData(keys.callSettings, settings),
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
