import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { BackspaceIcon, MicIcon, MicOffIcon, PhoneIcon, PhoneOffIcon } from '@/components/atoms/icons'
import { CallTimer } from '@/components/molecules/CallTimer'
import type { WebPhone } from '@/hooks/useWebPhone'
import type { PhoneLine } from '@/hooks/usePhoneLines'
import type { SipRegistrationState } from '@/services/api'

interface DialerProps {
  phone: WebPhone
  lines: PhoneLine[]
  lineId: string | undefined
  onLineChange: (id: string) => void
  number: string
  onNumberChange: (number: string) => void
}

const KEYS: { key: string; letters: string }[] = [
  { key: '1', letters: '' },
  { key: '2', letters: 'ABC' },
  { key: '3', letters: 'DEF' },
  { key: '4', letters: 'GHI' },
  { key: '5', letters: 'JKL' },
  { key: '6', letters: 'MNO' },
  { key: '7', letters: 'PQRS' },
  { key: '8', letters: 'TUV' },
  { key: '9', letters: 'WXYZ' },
  { key: '*', letters: '' },
  { key: '0', letters: '+' },
  { key: '#', letters: '' },
]

const stateLabels: Record<SipRegistrationState, { label: string; dot: string }> = {
  Registered: { label: 'Registrada', dot: 'bg-emerald-500' },
  Registering: { label: 'Registrando…', dot: 'bg-amber-400' },
  Failed: { label: 'Sin registro', dot: 'bg-red-500' },
}

/** Marcador: número, teclado, llamar/colgar y la extensión desde la que sale la llamada. */
export function Dialer({ phone, lines, lineId, onLineChange, number, onNumberChange }: DialerProps) {
  const [dtmf, setDtmf] = useState('')
  const inCall = phone.state !== 'idle' && phone.state !== 'ended'
  const answered = phone.state === 'answered'
  const line = lines.find((l) => l.id === lineId) ?? lines[0]

  const press = (key: string) => {
    if (inCall) {
      // En llamada el teclado manda tonos (menús de la central, extensiones internas).
      if (!answered) return
      phone.sendDtmf(key)
      setDtmf((value) => (value + key).slice(-20))
    } else {
      onNumberChange(number + key)
    }
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (inCall) return
    if (line && number.trim()) {
      setDtmf('')
      void phone.call(line.id, number.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col border border-zinc-200 dark:border-white/10">
      <div className="border-b border-zinc-200 px-5 pb-4 pt-5 dark:border-white/10">
        {inCall ? (
          <div className="min-h-[4.25rem]">
            <p className="truncate text-4xl font-light leading-tight tracking-tight tabular-nums">{phone.number}</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <span className={`size-1.5 animate-pulse rounded-full ${answered ? 'bg-emerald-500' : 'bg-brand-500'}`} />
              {answered ? <CallTimer since={phone.answeredAt} /> : phone.state === 'ringing' ? 'Sonando…' : 'Llamando…'}
              {dtmf && <span className="ml-auto font-mono tracking-widest">{dtmf}</span>}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <input
                aria-label="Número o extensión a marcar"
                inputMode="tel"
                autoComplete="off"
                autoFocus
                value={number}
                onChange={(e) => onNumberChange(e.target.value.replace(/[^\w*#+@.:-]/g, ''))}
                placeholder="Número o extensión"
                className="min-w-0 flex-1 bg-transparent text-4xl font-light leading-tight tracking-tight tabular-nums outline-none placeholder:text-2xl placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
              />
              <button
                type="button"
                onClick={() => onNumberChange(number.slice(0, -1))}
                disabled={!number}
                aria-label="Borrar"
                className="flex size-11 shrink-0 items-center justify-center text-zinc-400 transition-colors hover:text-zinc-900 disabled:opacity-30 dark:hover:text-white"
              >
                <BackspaceIcon />
              </button>
            </div>
            <p className="mt-1 min-h-5 text-sm text-zinc-500 dark:text-zinc-400">
              {phone.state === 'ended' && phone.endReason ? (
                <>
                  Última: <span className="font-mono">{phone.number}</span> · {phone.endReason}
                </>
              ) : (
                'Escribe o usa el teclado'
              )}
            </p>
          </>
        )}
      </div>

      <div className="grid grid-cols-3 gap-px bg-zinc-200 dark:bg-white/10" role="group" aria-label="Teclado">
        {KEYS.map(({ key, letters }) => (
          <KeypadButton key={key} digit={key} letters={letters} disabled={inCall && !answered} onPress={press} onLongPress={key === '0' && !inCall ? () => onNumberChange(number + '+') : undefined} />
        ))}
      </div>

      <div className="flex items-center justify-center gap-6 px-5 py-6">
        {inCall ? (
          <>
            <RoundButton label={phone.muted ? 'Activar micrófono' : 'Silenciar'} pressed={phone.muted} disabled={!answered} onClick={phone.toggleMute}>
              {phone.muted ? <MicOffIcon /> : <MicIcon />}
            </RoundButton>
            <button
              type="button"
              onClick={phone.hangup}
              aria-label={answered ? 'Colgar' : 'Cancelar llamada'}
              className="flex size-16 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-600/25 transition-colors hover:bg-red-500"
            >
              <PhoneOffIcon className="size-7" />
            </button>
            <span className="size-12" aria-hidden="true" />
          </>
        ) : (
          <button
            type="submit"
            disabled={!number.trim() || !line}
            aria-label="Llamar"
            className="flex size-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 transition-colors hover:bg-emerald-400 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:shadow-none dark:disabled:bg-white/10 dark:disabled:text-zinc-500"
          >
            <PhoneIcon className="size-7" />
          </button>
        )}
      </div>

      <div className="border-t border-zinc-200 px-5 py-4 dark:border-white/10">
        {lines.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Crea y habilita una extensión para llamar desde aquí.</p>
        ) : (
          <label className="block">
            <span className="eyebrow text-zinc-500 dark:text-zinc-400">Llamar desde</span>
            <span className="mt-2 flex items-center gap-3">
              <span
                className={`size-2 shrink-0 rounded-full ${line?.state ? stateLabels[line.state].dot : 'bg-zinc-300 dark:bg-zinc-600'}`}
                title={line?.state ? stateLabels[line.state].label : 'Inactiva'}
              />
              <select
                value={line?.id}
                disabled={inCall}
                onChange={(e) => onLineChange(e.target.value)}
                className="min-h-10 min-w-0 flex-1 border border-zinc-300 bg-white px-2 text-sm disabled:opacity-60 dark:border-white/15 dark:bg-zinc-900"
              >
                {lines.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} · {l.address}
                  </option>
                ))}
              </select>
            </span>
            {line?.state === 'Failed' && line.error && <span className="mt-2 block text-xs text-red-600 dark:text-red-400">{line.error}</span>}
          </label>
        )}
      </div>
    </form>
  )
}

function KeypadButton(props: { digit: string; letters: string; disabled: boolean; onPress: (key: string) => void; onLongPress?: () => void }) {
  const timer = useRef<number | null>(null)
  const longPressed = useRef(false)

  const start = () => {
    if (!props.onLongPress) return
    longPressed.current = false
    timer.current = window.setTimeout(() => {
      longPressed.current = true
      props.onLongPress?.()
    }, 600)
  }
  const cancel = () => {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = null
  }

  return (
    <button
      type="button"
      aria-label={props.digit}
      disabled={props.disabled}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onClick={() => {
        // Mantener apretado el 0 escribe "+" (como en un celular) y no suma el 0.
        if (!longPressed.current) props.onPress(props.digit)
        longPressed.current = false
      }}
      className="flex min-h-16 flex-col items-center justify-center bg-white transition-colors hover:bg-zinc-50 active:bg-brand-50 disabled:opacity-40 dark:bg-zinc-950 dark:hover:bg-white/5 dark:active:bg-brand-500/10"
    >
      <span className="text-2xl font-light leading-none">{props.digit}</span>
      <span className="mt-1 h-3 text-[10px] font-semibold tracking-[0.2em] text-zinc-400">{props.letters}</span>
    </button>
  )
}

function RoundButton(props: { label: string; pressed: boolean; disabled: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      aria-label={props.label}
      aria-pressed={props.pressed}
      title={props.label}
      className="flex size-12 items-center justify-center rounded-full border border-zinc-300 text-zinc-600 transition-colors hover:border-zinc-900 hover:text-zinc-900 disabled:opacity-40 aria-pressed:border-brand-500 aria-pressed:bg-brand-50 aria-pressed:text-brand-600 dark:border-white/15 dark:text-zinc-300 dark:hover:border-white/40 dark:hover:text-white dark:aria-pressed:bg-brand-500/10 dark:aria-pressed:text-brand-300"
    >
      {props.children}
    </button>
  )
}
