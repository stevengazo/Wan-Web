import { useMemo } from 'react'
import { useExtensionStatuses, useExtensions, type SipRegistrationState } from '@/services/api'

export interface PhoneLine {
  id: string
  name: string
  /** usuario@servidor */
  address: string
  /** Sin valor: el motor todavía no la reportó (arrancando). */
  state?: SipRegistrationState
  error?: string | null
}

/** Extensiones habilitadas con su estado de registro, para elegir desde cuál llamar. */
export function usePhoneLines(): PhoneLine[] {
  const { data: extensions } = useExtensions()
  const { data: statuses } = useExtensionStatuses()
  return useMemo(
    () =>
      (extensions ?? [])
        .filter((e) => e.enabled)
        .map((e) => {
          const status = statuses?.find((s) => s.extensionId === e.id)
          return { id: e.id, name: e.name, address: `${e.sipUsername}@${e.sipServer}`, state: status?.state, error: status?.error }
        }),
    [extensions, statuses],
  )
}
