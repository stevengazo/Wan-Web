import type { FormActionType } from '@/services/api'

export const actionTypeLabels: Record<FormActionType, string> = {
  Webhook: 'Webhook',
  Teams: 'Microsoft Teams',
  GoogleChat: 'Google Chat',
  Slack: 'Slack',
  Email: 'Correo',
}
