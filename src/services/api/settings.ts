import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api/client'
import { keys } from '@/services/api/keys'
import type { StorageProvider } from '@/services/api/recordings'

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
  /** Días que se guardan las grabaciones; null = sin borrado automático. */
  recordingRetentionDays: number | null
  /** Días que se guardan las transcripciones; null = sin borrado automático. */
  transcriptRetentionDays: number | null
}

export const useCallSettings = () => useQuery({ queryKey: keys.callSettings, queryFn: () => api<CallSettings>('/settings/calls') })

export function useSaveCallSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { success: 'Configuración de llamadas guardada' },
    mutationFn: (input: CallSettings) => api<CallSettings>('/settings/calls', { method: 'PUT', body: input }),
    onSuccess: (settings) => queryClient.setQueryData(keys.callSettings, settings),
  })
}

export const useSmtpSettings = () => useQuery({ queryKey: keys.smtp, queryFn: () => api<SmtpSettings>('/settings/smtp') })

export function useSaveSmtpSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { success: 'Correo saliente guardado' },
    mutationFn: (input: SaveSmtpSettings) => api<SmtpSettings>('/settings/smtp', { method: 'PUT', body: input }),
    onSuccess: (settings) => queryClient.setQueryData(keys.smtp, settings),
  })
}

export interface SiteSettings {
  /** La guardada en el panel. */
  publicUrl: string | null
  /** La de App__PublicUrl en el entorno (.env), como valor por defecto. */
  environmentUrl: string | null
  /** La que se usa: la del panel o, si no hay, la del entorno. */
  effectiveUrl: string | null
}

export const useSiteSettings = () => useQuery({ queryKey: keys.siteSettings, queryFn: () => api<SiteSettings>('/settings/site') })

export function useSaveSiteSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { success: 'URL pública guardada' },
    mutationFn: (input: { publicUrl: string | null }) => api<SiteSettings>('/settings/site', { method: 'PUT', body: input }),
    onSuccess: (settings) => queryClient.setQueryData(keys.siteSettings, settings),
  })
}

/** URL pública del panel (la configurada o, si no hay, la de esta pestaña), sin barra final. */
export function usePublicUrl() {
  const { data } = useSiteSettings()
  return data?.effectiveUrl ?? window.location.origin
}

export type VoiceProvider = 'ElevenLabs' | 'OpenAiRealtime' | 'Deepgram'

/** Proveedor de voz y sus opciones; las API keys solo se informan como cargadas o no. */
export interface VoiceSettings {
  provider: VoiceProvider
  hasApiKey: boolean
  agentId: string | null
  hasOpenAiApiKey: boolean
  openAiModel: string | null
  openAiVoice: string | null
  openAiTranscriptionModel: string | null
  hasDeepgramApiKey: boolean
  deepgramLanguage: string | null
  deepgramListenModel: string | null
  deepgramSpeakModel: string | null
  greeting: string | null
}

/** Cada API key vacía conserva la guardada. */
export interface SaveVoiceSettings {
  provider: VoiceProvider
  apiKey: string | null
  agentId: string | null
  openAiApiKey: string | null
  openAiModel: string | null
  openAiVoice: string | null
  openAiTranscriptionModel: string | null
  deepgramApiKey: string | null
  deepgramLanguage: string | null
  deepgramListenModel: string | null
  deepgramSpeakModel: string | null
  greeting: string | null
}

export const useVoiceSettings = () => useQuery({ queryKey: keys.voiceSettings, queryFn: () => api<VoiceSettings>('/settings/voice') })

export function useSaveVoiceSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { success: 'Voz guardada' },
    mutationFn: (input: SaveVoiceSettings) => api<VoiceSettings>('/settings/voice', { method: 'PUT', body: input }),
    onSuccess: (settings) => queryClient.setQueryData(keys.voiceSettings, settings),
  })
}

export interface StorageSettings {
  provider: StorageProvider
  s3Bucket: string | null
  s3Region: string | null
  s3ServiceUrl: string | null
  s3AccessKeyId: string | null
  hasS3SecretKey: boolean
  hasAzureConnectionString: boolean
  azureContainer: string | null
  prefix: string | null
  encryptRecordings: boolean
}

/** Secretos vacíos conservan los guardados. */
export interface SaveStorageSettings {
  provider: StorageProvider
  s3Bucket: string | null
  s3Region: string | null
  s3ServiceUrl: string | null
  s3AccessKeyId: string | null
  s3SecretKey: string | null
  azureConnectionString: string | null
  azureContainer: string | null
  prefix: string | null
  encryptRecordings: boolean
}

export const useStorageSettings = () => useQuery({ queryKey: keys.storageSettings, queryFn: () => api<StorageSettings>('/settings/storage') })

export function useSaveStorageSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { success: 'Almacenamiento guardado' },
    mutationFn: (input: SaveStorageSettings) => api<StorageSettings>('/settings/storage', { method: 'PUT', body: input }),
    onSuccess: (settings) => queryClient.setQueryData(keys.storageSettings, settings),
  })
}

/** Sube, firma y borra un archivo de prueba con los datos del formulario, sin guardarlos. */
export function useTestStorage() {
  return useMutation({
    meta: { silentError: true },
    mutationFn: (input: SaveStorageSettings) =>
      api<{ ok: boolean; message: string }>('/settings/storage/test', { method: 'POST', body: input }),
  })
}

/** Aplica la retención en el momento (el trabajo diario corre a las 3:00 UTC). */
export function useRunRetention() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api<{ recordings: number; transcriptLines: number }>('/settings/calls/retention/run', { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.recordings }),
  })
}
