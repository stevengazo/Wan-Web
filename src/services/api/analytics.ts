import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api/client'
import { keys } from '@/services/api/keys'

export interface AnalyticsTotals {
  calls: number
  inbound: number
  outbound: number
  answered: number
  missed: number
  failed: number
  transferred: number
  takenByOperator: number
  /** 0 a 1. */
  answerRate: number
  averageDurationSeconds: number
  talkMinutes: number
  messages: number
  formSubmissions: number
}

export interface AnalyticsDay {
  /** YYYY-MM-DD, día local. */
  date: string
  inbound: number
  outbound: number
  answered: number
  missed: number
}

/** day: 0 = lunes … 6 = domingo; hour local 0–23. */
export interface AnalyticsHeatCell {
  day: number
  hour: number
  calls: number
}

export interface AnalyticsExtension {
  extensionId: string
  name: string
  calls: number
  answered: number
  averageDurationSeconds: number
}

export interface Analytics {
  from: string
  to: string
  totals: AnalyticsTotals
  days: AnalyticsDay[]
  heatmap: AnalyticsHeatCell[]
  extensions: AnalyticsExtension[]
  endReasons: { reason: string; calls: number }[]
  campaignOutcomes: Record<string, number>
}

/** Métricas del período en la zona horaria del navegador; se refresca con cada llamada nueva. */
export function useAnalytics(days: number, extensionId: string | null) {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const params = new URLSearchParams({ days: String(days), timeZone })
  if (extensionId) params.set('extensionId', extensionId)
  return useQuery({
    queryKey: [...keys.analytics, days, extensionId],
    queryFn: () => api<Analytics>(`/analytics?${params}`),
    placeholderData: (previous) => previous,
  })
}
