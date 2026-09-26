import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { keys } from '@/services/api/keys'
import { clientHeader } from '@/services/api/client'

export type RealtimeStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected'

export type TranscriptSpeaker = 'Caller' | 'Agent'

/** Llamada en vivo (evento LiveCall). */
export interface LiveCall {
  callId: string
  extensionId: string
  extensionName: string
  callerNumber: string
  direction: 'Inbound' | 'Outbound'
  status: 'Ringing' | 'InProgress' | 'Completed' | 'Transferred' | 'Failed' | 'Missed'
  endReason: string | null
  startedAt: string
  answeredAt: string | null
}

/** Aviso para el dispositivo (evento Notify). */
export interface PanelNotification {
  kind: string
  title: string
  body: string
  url: string
}

export interface RealtimeHandlers {
  onNotify?: (notification: PanelNotification) => void
  onLiveCall?: (call: LiveCall) => void
  onTranscript?: (callId: string, speaker: TranscriptSpeaker, text: string) => void
}

/**
 * Conexión al hub de eventos (backend/src/Wan.Api/Realtime/EventsHub.cs). Cada evento invalida
 * las queries afectadas para que TanStack Query las vuelva a pedir.
 */
export function useRealtime(handlers: RealtimeHandlers = {}) {
  const queryClient = useQueryClient()
  // En un ref: la conexión se crea una vez y siempre llama a los manejadores más recientes.
  const handlersRef = useRef(handlers)
  useEffect(() => {
    handlersRef.current = handlers
  })
  const [status, setStatus] = useState<RealtimeStatus>('connecting')

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      // La cookie de sesión va sola; el header es para el negotiate (POST).
      .withUrl('/hubs/events', { headers: clientHeader })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build()

    connection.on('ExtensionsChanged', () => {
      queryClient.invalidateQueries({ queryKey: ['extensions'], exact: true })
      // Los detalles solo se marcan como viejos: refetchearlos pediría uno recién borrado (404) y
      // el formulario abierto no debe cambiar mientras se edita.
      queryClient.invalidateQueries({ queryKey: ['extensions'], refetchType: 'none' })
    })

    connection.on('ExtensionStatusChanged', () => queryClient.invalidateQueries({ queryKey: keys.extensionStatuses }))
    connection.on('CallsChanged', () => {
      queryClient.invalidateQueries({ queryKey: keys.extensionStatuses })
      queryClient.invalidateQueries({ queryKey: keys.calls })
      queryClient.invalidateQueries({ queryKey: keys.analytics })
    })

    connection.on('Notify', (n: PanelNotification) => handlersRef.current.onNotify?.(n))
    connection.on('LiveCall', (call: LiveCall) => handlersRef.current.onLiveCall?.(call))
    connection.on('CallTranscript', (callId: string, speaker: TranscriptSpeaker, text: string) =>
      handlersRef.current.onTranscript?.(callId, speaker, text),
    )

    connection.on('CampaignsChanged', () => queryClient.invalidateQueries({ queryKey: keys.campaigns }))

    // Recados, respuestas y grabaciones llegan desde las llamadas: se refrescan solos.
    connection.on('MessagesChanged', () => queryClient.invalidateQueries({ queryKey: ['messages'] }))
    connection.on('FormSubmissionsChanged', () => queryClient.invalidateQueries({ queryKey: ['forms'] }))
    connection.on('RecordingsChanged', () => queryClient.invalidateQueries({ queryKey: ['recordings'] }))

    connection.onreconnecting(() => setStatus('reconnecting'))
    connection.onreconnected(() => {
      setStatus('connected')
      // Pudo haber cambios mientras no había conexión.
      queryClient.invalidateQueries()
    })
    connection.onclose(() => setStatus('disconnected'))

    let cancelled = false
    connection
      .start()
      .then(() => !cancelled && setStatus('connected'))
      .catch(() => !cancelled && setStatus('disconnected'))

    return () => {
      cancelled = true
      if (connection.state !== HubConnectionState.Disconnected) void connection.stop()
    }
  }, [queryClient])

  return status
}
