import { motion } from 'motion/react'
import type { RealtimeStatus } from './useRealtime'

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

export function RealtimeIndicator({ status }: { status: RealtimeStatus }) {
  const pending = status === 'connecting' || status === 'reconnecting'
  return (
    <span role="status" className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
      <motion.span
        className={`size-2 rounded-full ${colors[status]}`}
        animate={pending ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
        transition={pending ? { duration: 1.2, repeat: Infinity } : undefined}
      />
      {labels[status]}
    </span>
  )
}
