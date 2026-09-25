import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api/client'
import { keys } from '@/services/api/keys'

/** Proveedor del LLM del bot; ElevenLabs sigue haciendo la voz. */
export type LlmProvider = 'OpenAi' | 'Gemini' | 'Anthropic'

export interface LlmProviderSettings {
  provider: LlmProvider
  /** Nulo = el modelo por defecto del servidor. */
  model: string | null
  defaultModel: string
  hasApiKey: boolean
}

/** Configuración general de la IA, igual para todas las cuentas. */
export interface LlmSettings {
  activeProvider: LlmProvider
  systemPrompt: string | null
  providers: LlmProviderSettings[]
}

export interface SaveLlmSettings {
  activeProvider: LlmProvider
  systemPrompt: string | null
  /** apiKey vacía conserva la guardada; clearApiKey la borra. */
  providers: { provider: LlmProvider; model: string | null; apiKey: string | null; clearApiKey: boolean }[]
}

export const useLlmSettings = () =>
  useQuery({ queryKey: keys.llmSettings, queryFn: () => api<LlmSettings>('/llm/settings') })

export function useSaveLlmSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SaveLlmSettings) => api<LlmSettings>('/llm/settings', { method: 'PUT', body: input }),
    onSuccess: (settings) => queryClient.setQueryData(keys.llmSettings, settings),
  })
}
