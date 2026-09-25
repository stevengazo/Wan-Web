import type { FormActionType } from '@/services/api/types'

export const actionTypeLabels: Record<FormActionType, string> = {
  Webhook: 'Webhook',
  Teams: 'Microsoft Teams',
  GoogleChat: 'Google Chat',
  Slack: 'Slack',
  Email: 'Correo',
}
