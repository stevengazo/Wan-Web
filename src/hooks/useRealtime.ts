import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { authStore } from '@/stores/authStore'

export type RealtimeStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected'

/**
 * Conexión al hub de eventos (backend/src/Mapache.Api/Realtime/EventsHub.cs). Cada evento invalida
 * las queries afectadas para que TanStack Query las vuelva a pedir.
 */
export function useRealtime() {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<RealtimeStatus>('connecting')

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl('/hubs/events', { accessTokenFactory: () => authStore.get()?.accessToken ?? '' })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build()

    connection.on('ExtensionsChanged', () => {
      queryClient.invalidateQueries({ queryKey: ['extensions'], exact: true })
      // Los detalles solo se marcan como viejos: refetchearlos pediría uno recién borrado (404) y
      // el formulario abierto no debe cambiar mientras se edita.
      queryClient.invalidateQueries({ queryKey: ['extensions'], refetchType: 'none' })
    })

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
