import { Link } from 'react-router'
import { PhoneIcon, PhoneOffIcon } from '@/components/atoms/icons'
import { CallTimer } from '@/components/molecules/CallTimer'
import type { WebPhone } from '@/hooks/useWebPhone'

/** Llamada en curso anclada abajo del sidebar: se ve desde cualquier página y lleva al teléfono. */
export function ActiveCallBar({ phone, compact }: { phone: WebPhone; compact: boolean }) {
  const answered = phone.state === 'answered'
  const status = answered ? <CallTimer since={phone.answeredAt} /> : phone.state === 'ringing' ? 'Sonando…' : 'Llamando…'

  if (compact) {
    return (
      <Link
        to="/telefono"
        aria-label={`Llamada en curso con ${phone.number}`}
        title={`${phone.number}`}
        className="relative flex size-10 items-center justify-center bg-brand-600 text-white"
      >
        <PhoneIcon />
        <span className="absolute -right-0.5 -top-0.5 size-2 animate-pulse rounded-full bg-emerald-400" />
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-3 bg-brand-600 py-2 pl-3 pr-2 text-white">
      <Link to="/telefono" className="min-w-0 flex-1" title="Abrir el teléfono">
        <span className="eyebrow flex items-center gap-2 text-brand-100">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-300" />
          En llamada
        </span>
        <span className="mt-0.5 block truncate font-mono text-sm">{phone.number}</span>
        <span className="block text-xs text-brand-100">{status}</span>
      </Link>
      <button
        type="button"
        onClick={phone.hangup}
        aria-label={answered ? 'Colgar' : 'Cancelar llamada'}
        title={answered ? 'Colgar' : 'Cancelar'}
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-600 transition-colors hover:bg-red-500"
      >
        <PhoneOffIcon className="size-4.5" />
      </button>
    </div>
  )
}
