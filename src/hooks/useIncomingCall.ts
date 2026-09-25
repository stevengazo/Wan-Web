import { useCallback, useRef, useState } from 'react'
import type { LiveCall, TranscriptSpeaker } from '@/hooks/useRealtime'

export interface TranscriptLine {
  speaker: TranscriptSpeaker
  text: string
}

export interface IncomingCallState {
  call: LiveCall
  transcript: TranscriptLine[]
}

/**
 * Llamada entrante que se muestra en el modal: la primera que entra mientras el panel está abierto. Las
 * demás siguen su curso (el historial las registra) hasta que se cierre el modal.
 */
export function useIncomingCall() {
  const [current, setCurrent] = useState<IncomingCallState | null>(null)
  // Id de la llamada del modal, al día sin esperar al render: los eventos llegan fuera de React.
  const shownId = useRef<string | null>(null)

  /** Devuelve true si la llamada es nueva y abrió el modal (para avisar en el dispositivo). */
  const onLiveCall = useCallback((call: LiveCall) => {
    if (call.direction !== 'Inbound') return false
    if (shownId.current === call.callId) {
      setCurrent((prev) => (prev ? { ...prev, call } : prev))
      return false
    }

    const active = call.status === 'Ringing' || call.status === 'InProgress'
    if (shownId.current || !active) return false
    shownId.current = call.callId
    setCurrent({ call, transcript: [] })
    return true
  }, [])

  const onTranscript = useCallback((callId: string, speaker: TranscriptSpeaker, text: string) => {
    setCurrent((prev) => (prev && prev.call.callId === callId ? { ...prev, transcript: [...prev.transcript, { speaker, text }] } : prev))
  }, [])

  const dismiss = useCallback(() => {
    shownId.current = null
    setCurrent(null)
  }, [])

  return { current, onLiveCall, onTranscript, dismiss }
}
