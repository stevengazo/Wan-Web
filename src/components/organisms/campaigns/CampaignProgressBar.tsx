import type { CampaignProgress } from '@/services/api'

const segments: { key: keyof Omit<CampaignProgress, 'total' | 'outcomes'>; label: string; className: string }[] = [
  { key: 'completed', label: 'Contestaron', className: 'bg-emerald-500' },
  { key: 'noAnswer', label: 'No contestaron', className: 'bg-amber-500' },
  { key: 'busy', label: 'Ocupado', className: 'bg-amber-700' },
  { key: 'failed', label: 'Fallaron', className: 'bg-red-500' },
  { key: 'calling', label: 'Llamando', className: 'bg-brand-500' },
  { key: 'pending', label: 'Pendientes', className: 'bg-zinc-200 dark:bg-white/10' },
]

/** Avance de la campaña: una barra por estados de los contactos y, opcionalmente, la leyenda. */
export function CampaignProgressBar({ progress, legend = false }: { progress: CampaignProgress; legend?: boolean }) {
  if (progress.total === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Sin contactos todavía.</p>
  }

  return (
    <div className="space-y-2">
      <div className="flex h-2 overflow-hidden bg-zinc-100 dark:bg-white/5" role="img" aria-label={`${progress.total - progress.pending - progress.calling} de ${progress.total} contactos llamados`}>
        {segments.map((s) =>
          progress[s.key] > 0 ? <span key={s.key} className={s.className} style={{ width: `${(progress[s.key] / progress.total) * 100}%` }} /> : null,
        )}
      </div>
      {legend && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
          {segments
            .filter((s) => progress[s.key] > 0)
            .map((s) => (
              <li key={s.key} className="flex items-center gap-1.5">
                <span className={`size-2 ${s.className}`} />
                {s.label} <span className="font-mono tabular-nums text-zinc-900 dark:text-zinc-100">{progress[s.key]}</span>
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}
