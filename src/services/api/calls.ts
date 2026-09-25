import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api/client'
import { keys } from '@/services/api/keys'

export type CallDirection = 'Inbound' | 'Outbound'

export type CallStatus = 'Ringing' | 'InProgress' | 'Completed' | 'Transferred' | 'Failed' | 'Missed'

export interface CallRecord {
  id: string
  extensionId: string
  extensionName: string
  /** El otro lado: quien llamó o el número marcado. */
  callerNumber: string
  direction: CallDirection
  status: CallStatus
  endReason: string | null
  startedAt: string
  answeredAt: string | null
  endedAt: string | null
  conversationId: string | null
  recordingId: string | null
}

/** Últimas llamadas; se refresca sola con el evento CallsChanged. */
export const useCalls = (limit = 100) =>
  useQuery({ queryKey: [...keys.calls, limit], queryFn: () => api<CallRecord[]>(`/calls?limit=${limit}`) })
