import { motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { MicIcon, MicOffIcon, PhoneIncomingIcon, PhoneOffIcon } from '@/components/atoms/icons'
import { Button } from '@/components/atoms/Button'
import { CallTimer } from '@/components/molecules/CallTimer'
import type { IncomingCallState } from '@/hooks/useIncomingCall'
import type { WebPhone } from '@/hooks/useWebPhone'

interface IncomingCallModalProps {
  incoming: IncomingCallState
  phone: WebPhone
  /** true si esta llamada la tomó este navegador. */
  taken: boolean
  onTake: () => void
  onClose: () => void
}

/** Llamada entrante en vivo: lo que dicen el cliente y el bot, y la opción de tomarla. */
export function IncomingCallModal({ incoming, phone, taken, onTake, onClose }: IncomingCallModalProps) {
  const { call, transcript } = incoming
  const bottom = useRef<HTMLDivElement>(null)
  const ended = !['Ringing', 'InProgress'].includes(call.status)
  const phoneBusy = phone.state !== 'idle' && phone.state !== 'ended'
  const talking = taken && phone.state === 'answered'

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [transcript.length])

  const status = taken
    ? talking
      ? 'Estás en la llamada'
      : phone.state === 'ended'
        ? `Terminó · ${phone.endReason ?? ''}`
        : 'Tomando la llamada…'
    : ended
      ? `Terminó${call.endReason ? ` · ${call.endReason}` : ''}`
      : call.status === 'Ringing'
        ? 'Sonando…'
        : 'La atiende el bot'

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-end justify-center bg-zinc-950/60 sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="incoming-call-title"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex max-h-[92dvh] w-full flex-col border border-zinc-200 bg-white pb-[env(safe-area-inset-bottom)] sm:max-w-xl dark:border-white/10 dark:bg-zinc-950"
      >
        <header className="border-b border-zinc-200 px-6 pb-5 pt-6 dark:border-white/10">
          <p className="eyebrow flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
            <span className={`size-1.5 rounded-full ${ended ? 'bg-zinc-400' : 'animate-pulse bg-emerald-500'}`} />
            Llamada entrante · {call.extensionName}
          </p>
          <div className="mt-3 flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
              <PhoneIncomingIcon />
            </span>
            <div className="min-w-0">
              <h2 id="incoming-call-title" className="truncate text-3xl font-light tracking-tight tabular-nums">
                {call.callerNumber}
              </h2>
              <p className="mt-0.5 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                {status}
                {talking && (
                  <>
                    · <CallTimer since={phone.answeredAt} />
                  </>
                )}
              </p>
            </div>
          </div>
        </header>

        <div className="min-h-48 flex-1 space-y-3 overflow-y-auto px-6 py-5" aria-live="polite" aria-label="Transcripción en vivo">
          {transcript.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-400">
              {ended ? 'Sin transcripción.' : 'La conversación aparecerá aquí en tiempo real.'}
            </p>
          ) : (
            transcript.map((line, index) => (
              <div key={index} className={`flex ${line.speaker === 'Agent' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-4 py-2.5 text-sm ${
                    line.speaker === 'Agent'
                      ? 'bg-brand-600 text-white'
                      : 'bg-zinc-100 text-zinc-900 dark:bg-white/10 dark:text-zinc-100'
                  }`}
                >
                  <p className={`eyebrow mb-1 ${line.speaker === 'Agent' ? 'text-brand-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
                    {line.speaker === 'Agent' ? 'Bot' : 'Cliente'}
                  </p>
                  {line.text}
                </div>
              </div>
            ))
          )}
          <div ref={bottom} />
        </div>

        <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-zinc-200 px-6 py-4 dark:border-white/10">
          {taken && phoneBusy ? (
            <>
              <button
                type="button"
                onClick={phone.toggleMute}
                disabled={!talking}
                aria-pressed={phone.muted}
                aria-label={phone.muted ? 'Activar micrófono' : 'Silenciar'}
                className="flex size-11 items-center justify-center rounded-full border border-zinc-300 text-zinc-600 disabled:opacity-40 aria-pressed:border-brand-500 aria-pressed:text-brand-600 dark:border-white/15 dark:text-zinc-300"
              >
                {phone.muted ? <MicOffIcon /> : <MicIcon />}
              </button>
              <button
                type="button"
                onClick={phone.hangup}
                aria-label="Colgar"
                className="flex size-11 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-500"
              >
                <PhoneOffIcon />
              </button>
            </>
          ) : (
            <>
              {!ended && !taken && phoneBusy && <p className="mr-auto text-xs text-zinc-500">Termina tu llamada actual para tomarla.</p>}
              <Button variant="secondary" onClick={onClose}>
                {ended || taken ? 'Cerrar' : 'Ocultar'}
              </Button>
              {!ended && !taken && (
                <Button onClick={onTake} disabled={call.status !== 'InProgress' || phoneBusy}>
                  Tomar la llamada
                </Button>
              )}
            </>
          )}
        </footer>
      </motion.section>
    </motion.div>
  )
}
