import { useCallback, useEffect, useRef, useState } from 'react'
import { authStore } from '@/stores/authStore'

export type PhoneState = 'idle' | 'connecting' | 'calling' | 'ringing' | 'answered' | 'ended'

export interface WebPhone {
  state: PhoneState
  /** Número marcado en la llamada actual o la última. */
  number: string | null
  /** Motivo del fin de la última llamada. */
  endReason: string | null
  /** Momento en que contestaron, para el cronómetro. */
  answeredAt: number | null
  muted: boolean
  call: (extensionId: string, number: string) => Promise<void>
  hangup: () => void
  sendDtmf: (digit: string) => void
  toggleMute: () => void
}

interface Session {
  socket: WebSocket
  context: AudioContext
  node: AudioWorkletNode
  stream: MediaStream
  ringback: { stop: () => void } | null
}

/**
 * Teléfono web: el audio del micrófono va al servidor por WebSocket (/hubs/phone) en PCM a 8 kHz y el del
 * otro lado vuelve igual. Una llamada a la vez; vive en la plantilla para que siga al cambiar de página.
 */
export function useWebPhone(): WebPhone {
  const [state, setState] = useState<PhoneState>('idle')
  const [number, setNumber] = useState<string | null>(null)
  const [endReason, setEndReason] = useState<string | null>(null)
  const [answeredAt, setAnsweredAt] = useState<number | null>(null)
  const [muted, setMuted] = useState(false)
  const session = useRef<Session | null>(null)

  const cleanup = useCallback(() => {
    const current = session.current
    session.current = null
    if (!current) return
    current.ringback?.stop()
    current.stream.getTracks().forEach((track) => track.stop())
    current.node.disconnect()
    void current.context.close()
    if (current.socket.readyState <= WebSocket.OPEN) current.socket.close()
  }, [])

  const finish = useCallback(
    (reason: string) => {
      cleanup()
      setEndReason(reason)
      setState('ended')
      setMuted(false)
    },
    [cleanup],
  )

  const call = useCallback(
    async (extensionId: string, target: string) => {
      if (session.current) return
      setNumber(target)
      setEndReason(null)
      setAnsweredAt(null)
      setState('connecting')

      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        })
      } catch {
        setEndReason('Permite el uso del micrófono para llamar.')
        setState('ended')
        return
      }

      const context = new AudioContext()
      let node: AudioWorkletNode
      try {
        // Archivo de public/: el worklet se carga por URL propia (una data: URL no la aceptan todos los navegadores).
        await context.audioWorklet.addModule('/phone-processor.js')
        node = new AudioWorkletNode(context, 'phone-processor', { outputChannelCount: [1] })
        context.createMediaStreamSource(stream).connect(node)
        node.connect(context.destination)
      } catch {
        stream.getTracks().forEach((track) => track.stop())
        void context.close()
        setEndReason('Este navegador no permite el audio del teléfono web.')
        setState('ended')
        return
      }

      const params = new URLSearchParams({ extensionId, to: target, access_token: authStore.get()?.accessToken ?? '' })
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const socket = new WebSocket(`${protocol}//${window.location.host}/hubs/phone?${params}`)
      socket.binaryType = 'arraybuffer'
      const current: Session = { socket, context, node, stream, ringback: null }
      session.current = current

      node.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
        if (socket.readyState === WebSocket.OPEN) socket.send(event.data)
      }

      socket.onmessage = (event: MessageEvent<ArrayBuffer | string>) => {
        if (typeof event.data !== 'string') {
          node.port.postMessage(event.data, [event.data])
          return
        }

        const message = JSON.parse(event.data) as { type: string; state: string; reason: string | null }
        if (message.type !== 'state') return
        switch (message.state) {
          case 'calling':
            setState('calling')
            break
          case 'ringing':
            setState('ringing')
            current.ringback ??= playRingback(context)
            break
          case 'answered':
            current.ringback?.stop()
            current.ringback = null
            setAnsweredAt(Date.now())
            setState('answered')
            break
          case 'ended':
            finish(message.reason ?? 'terminó')
            break
        }
      }

      socket.onclose = () => {
        if (session.current === current) finish('se cortó la conexión con el servidor')
      }
    },
    [finish],
  )

  const hangup = useCallback(() => {
    const socket = session.current?.socket
    if (socket?.readyState === WebSocket.OPEN) {
      // El servidor cuelga y responde con el estado final.
      socket.send(JSON.stringify({ type: 'hangup' }))
    } else {
      finish('cancelada')
    }
  }, [finish])

  const sendDtmf = useCallback((digit: string) => {
    const socket = session.current?.socket
    if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'dtmf', digit }))
  }, [])

  const toggleMute = useCallback(() => {
    setMuted((value) => {
      session.current?.node.port.postMessage({ type: 'mute', value: !value })
      return !value
    })
  }, [])

  // Cerrar la pestaña o salir del panel cuelga.
  useEffect(() => cleanup, [cleanup])

  return { state, number, endReason, answeredAt, muted, call, hangup, sendDtmf, toggleMute }
}

/** Tono de llamada local (425 Hz, 1 s sonando y 4 s en silencio) mientras la central no manda audio propio. */
function playRingback(context: AudioContext) {
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.frequency.value = 425
  gain.gain.value = 0
  oscillator.connect(gain).connect(context.destination)
  oscillator.start()
  const cycle = () => {
    const now = context.currentTime
    gain.gain.setValueAtTime(0.08, now)
    gain.gain.setValueAtTime(0, now + 1)
  }
  cycle()
  const timer = window.setInterval(cycle, 5000)
  return {
    stop() {
      window.clearInterval(timer)
      oscillator.stop()
      oscillator.disconnect()
    },
  }
}
