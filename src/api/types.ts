// Reflejan los DTOs de backend/src/Mapache.Api/Controllers. Mantener sincronizados.

export type UserRole = 'Admin' | 'Operator'

export interface User {
  id: string
  email: string
  displayName: string
  role: UserRole
}

export interface LoginResponse {
  accessToken: string
  expiresAt: string
  user: User
}

export type SipTransport = 'Udp' | 'Tcp' | 'Tls'

/** Quién contesta las llamadas entrantes de la cuenta. */
export type AnswerMode = 'Bot' | 'Human' | 'BotWithHandoff'

/** Proveedor del LLM del bot; ElevenLabs sigue haciendo la voz. */
export type LlmProvider = 'OpenAi' | 'Gemini' | 'Anthropic'

export interface LlmProviderInfo {
  provider: LlmProvider
  /** Tiene API key y modelo por defecto en la configuración del servidor. */
  configured: boolean
  defaultModel: string
  isDefault: boolean
}

/** Cuenta SIP genérica, con los mismos datos que una cuenta de MicroSIP. */
export interface ExtensionSettings {
  name: string
  sipServer: string
  sipProxy: string | null
  sipUsername: string
  sipDomain: string | null
  authUsername: string | null
  displayName: string | null
  transport: SipTransport
  publicAddress: string | null
  stunServer: string | null
  registerExpirySeconds: number
  keepAliveSeconds: number
  answerMode: AnswerMode
  /** Nulo = el proveedor por defecto del servidor. */
  llmProvider: LlmProvider | null
  llmModel: string | null
  systemPrompt: string | null
  enabled: boolean
}

export interface Extension extends ExtensionSettings {
  id: string
  createdAt: string
  updatedAt: string
}

export interface ExtensionInput extends ExtensionSettings {
  /** En edición, vacío conserva la contraseña actual. */
  sipPassword: string
}
