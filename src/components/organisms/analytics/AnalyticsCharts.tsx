import type { AnalyticsDay, AnalyticsExtension, AnalyticsHeatCell } from '@/services/api'
import { formatDuration } from '@/lib/format'

const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const dayLabel = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'numeric' })

/** Indicador con número grande y una línea de contexto. */
export function KpiTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border border-zinc-200 p-5 dark:border-white/10">
      <p className="eyebrow text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-2 text-3xl font-light tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>}
    </div>
  )
}

/** Barras apiladas por día: entrantes (violeta) y salientes (rosa). */
export function DailyCallsChart({ days }: { days: AnalyticsDay[] }) {
  const max = Math.max(1, ...days.map((d) => d.inbound + d.outbound))
  const labelEvery = Math.ceil(days.length / 10)

  return (
    <figure>
      <div className="flex h-48 items-end gap-px" role="img" aria-label="Llamadas por día">
        {days.map((d) => {
          const total = d.inbound + d.outbound
          const date = new Date(`${d.date}T12:00:00`)
          return (
            <div
              key={d.date}
              className="group relative flex h-full flex-1 flex-col justify-end"
              title={`${dayLabel.format(date)}: ${d.inbound} entrantes, ${d.outbound} salientes, ${d.answered} atendidas`}
            >
              <span className="bg-pink-400/80 dark:bg-pink-400/70" style={{ height: `${(d.outbound / max) * 100}%` }} />
              <span className="bg-brand-600 dark:bg-brand-500" style={{ height: `${(d.inbound / max) * 100}%` }} />
              {total === 0 && <span className="h-px bg-zinc-200 dark:bg-white/10" />}
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex gap-px text-[10px] text-zinc-400">
        {days.map((d, i) => (
          <span key={d.date} className="flex-1 truncate text-center">
            {i % labelEvery === 0 ? dayLabel.format(new Date(`${d.date}T12:00:00`)) : ''}
          </span>
        ))}
      </div>
      <figcaption className="mt-3 flex gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="size-2 bg-brand-600" /> Entrantes
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 bg-pink-400" /> Salientes
        </span>
      </figcaption>
    </figure>
  )
}

/** Cuándo llaman: días de la semana por horas, más oscuro cuantas más llamadas. */
export function CallsHeatmap({ cells }: { cells: AnalyticsHeatCell[] }) {
  const max = Math.max(1, ...cells.map((c) => c.calls))
  const at = (day: number, hour: number) => cells.find((c) => c.day === day && c.hour === hour)?.calls ?? 0
  const hours = Array.from({ length: 24 }, (_, h) => h)

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] table-fixed border-separate border-spacing-0.5 text-[10px]" aria-label="Llamadas por día y hora">
        <thead>
          <tr>
            <th className="w-9" />
            {hours.map((h) => (
              <th key={h} className="font-normal text-zinc-400">
                {h % 3 === 0 ? h : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weekDays.map((label, day) => (
            <tr key={label}>
              <th className="pr-2 text-right font-normal text-zinc-500 dark:text-zinc-400">{label}</th>
              {hours.map((hour) => {
                const calls = at(day, hour)
                return (
                  <td
                    key={hour}
                    title={`${label} ${hour}:00 — ${calls} llamada${calls === 1 ? '' : 's'}`}
                    className="h-5 bg-zinc-100 dark:bg-white/5"
                    style={calls > 0 ? { backgroundColor: `rgb(147 51 234 / ${0.15 + (calls / max) * 0.85})` } : undefined}
                  />
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Llamadas y atención por extensión, con barra relativa. */
export function ExtensionsBreakdown({ extensions }: { extensions: AnalyticsExtension[] }) {
  const max = Math.max(1, ...extensions.map((e) => e.calls))
  if (extensions.length === 0) return <p className="text-sm text-zinc-500 dark:text-zinc-400">Sin llamadas en el período.</p>

  return (
    <ul className="space-y-3">
      {extensions.map((e) => (
        <li key={e.extensionId}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate">{e.name}</span>
            <span className="shrink-0 font-mono text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
              {e.calls} · {Math.round((e.answered / Math.max(1, e.calls)) * 100)}% atendidas · {formatDuration(e.averageDurationSeconds)}
            </span>
          </div>
          <div className="mt-1 h-1.5 bg-zinc-100 dark:bg-white/5">
            <div className="h-full bg-brand-600" style={{ width: `${(e.calls / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Lista con barra de proporción: motivos de fin, resultados de campañas. */
export function RankedList({ items, empty }: { items: { label: string; value: number }[]; empty: string }) {
  const max = Math.max(1, ...items.map((i) => i.value))
  if (items.length === 0) return <p className="text-sm text-zinc-500 dark:text-zinc-400">{empty}</p>

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.label} className="relative flex items-center justify-between gap-3 px-2 py-1 text-sm">
          <span className="absolute inset-y-0 left-0 bg-brand-50 dark:bg-brand-500/10" style={{ width: `${(item.value / max) * 100}%` }} />
          <span className="relative truncate">{item.label}</span>
          <span className="relative font-mono tabular-nums">{item.value}</span>
        </li>
      ))}
    </ul>
  )
}
