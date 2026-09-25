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

/** Cifrado del audio (SRTP). */
export type MediaEncryption = 'Disabled' | 'Optional' | 'Mandatory'

export type DtmfMode = 'Rfc2833' | 'SipInfo' | 'Inband'

/** Quién contesta las llamadas entrantes de la cuenta. */
export type AnswerMode = 'Bot' | 'Human' | 'BotWithHandoff'

/** Códecs que acepta el backend, en su orden de preferencia sugerido. */
export const supportedCodecs = ['PCMU', 'PCMA', 'G722', 'G729', 'opus'] as const

/** Cuenta SIP genérica, con los datos de una cuenta de softphone como MicroSIP. */
export interface ExtensionSettings {
  name: string
  sipServer: string
  secondarySipServer: string | null
  sipProxy: string | null
  sipUsername: string
  sipDomain: string | null
  authUsername: string | null
  displayName: string | null
  transport: SipTransport
  publicAddress: string | null
  stunServer: string | null
  registerExpirySeconds: number
  registerRetrySeconds: number
  keepAliveSeconds: number
  /** 0 = lo elige el sistema. */
  localPort: number
  allowIpRewrite: boolean
  useIce: boolean
  mediaEncryption: MediaEncryption
  /** Habilitados, en orden de preferencia. */
  codecs: string[]
  dtmfMode: DtmfMode
  /** 0 = deshabilitado. */
  sessionTimerSeconds: number
  /** 0 = sin límite. */
  maxConcurrentCalls: number
  voicemailNumber: string | null
  dialPrefix: string | null
  hideCallerId: boolean
  answerMode: AnswerMode
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

/** Destino al que el bot puede transferir una llamada. */
export interface DirectoryEntryInput {
  name: string
  department: string | null
  /** Extensión, número telefónico o URI SIP. */
  target: string
  /** Cuándo transferir aquí; le da contexto al bot. */
  description: string | null
  enabled: boolean
}

export interface DirectoryEntry extends DirectoryEntryInput {
  id: string
  createdAt: string
  updatedAt: string
}

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

/** Respuesta de una prueba o de una tool: ok y un mensaje para mostrar. */
export interface ActionResult {
  ok: boolean
  message: string
}

export type CallMessageStatus = 'New' | 'Read' | 'Done'

/** Recado que el bot tomó durante una llamada. */
export interface CallMessage {
  id: string
  recipient: string
  directoryEntryId: string | null
  directoryEntryName: string | null
  callerName: string | null
  callbackNumber: string | null
  body: string
  urgent: boolean
  status: CallMessageStatus
  conversationId: string | null
  createdAt: string
}

export interface Recording {
  id: string
  conversationId: string
  sizeBytes: number
  createdAt: string
}

export interface CallSettings {
  recordCalls: boolean
  recordingNotice: string | null
}
