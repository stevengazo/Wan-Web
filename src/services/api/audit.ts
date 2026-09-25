import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api/client'
import { keys } from '@/services/api/keys'

export interface AuditEvent {
  id: string
  at: string
  userId: string | null
  userEmail: string | null
  /** Código de la acción: auth.login, recording.played... */
  action: string
  target: string | null
  targetId: string | null
  ipAddress: string | null
  details: string | null
}

export interface AuditFilter {
  days: number
  /** Código exacto o prefijo con punto ("recording."); vacío = todo. */
  action: string
  search: string
}

const query = (filter: AuditFilter, format?: 'csv') => {
  const params = new URLSearchParams({ days: String(filter.days) })
  if (filter.action) params.set('action', filter.action)
  if (filter.search.trim()) params.set('search', filter.search.trim())
  if (format) params.set('format', format)
  return params.toString()
}

export const useAuditEvents = (filter: AuditFilter) =>
  useQuery({
    queryKey: [...keys.audit, filter],
    queryFn: () => api<AuditEvent[]>(`/audit?${query(filter)}`),
    placeholderData: (previous) => previous,
  })

/** Descarga el CSV con el mismo filtro (la cookie de sesión va sola). */
export async function downloadAuditCsv(filter: AuditFilter) {
  const response = await fetch(`/api/audit?${query(filter, 'csv')}`)
  if (!response.ok) throw new Error('No se pudo exportar')
  const url = URL.createObjectURL(await response.blob())
  const link = document.createElement('a')
  link.href = url
  link.download = `auditoria-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
