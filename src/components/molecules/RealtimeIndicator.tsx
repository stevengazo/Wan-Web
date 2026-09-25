import { motion } from 'motion/react'
import type { RealtimeStatus } from '@/hooks/useRealtime'

const labels: Record<RealtimeStatus, string> = {
  connecting: 'Conectando',
  connected: 'En vivo',
  reconnecting: 'Reconectando',
  disconnected: 'Sin conexión',
}

const colors: Record<RealtimeStatus, string> = {
  connecting: 'bg-amber-400',
  connected: 'bg-emerald-500',
  reconnecting: 'bg-amber-400',
  disconnected: 'bg-red-500',
}

/** `compact` muestra solo el punto (sidebar colapsado); el texto queda para lectores de pantalla. */
export function RealtimeIndicator({ status, compact = false }: { status: RealtimeStatus; compact?: boolean }) {
  const pending = status === 'connecting' || status === 'reconnecting'
  return (
    <span role="status" title={labels[status]} className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
      <motion.span
        className={`size-2 rounded-full ${colors[status]}`}
        animate={pending ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
        transition={pending ? { duration: 1.2, repeat: Infinity } : undefined}
      />
      <span className={compact ? 'sr-only' : undefined}>{labels[status]}</span>
    </span>
  )
}
