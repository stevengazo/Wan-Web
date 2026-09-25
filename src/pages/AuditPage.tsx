import { useState } from 'react'
import toast from 'react-hot-toast'
import { SearchIcon } from '@/components/atoms/icons'
import { Button } from '@/components/atoms/Button'
import { auditActionLabels, auditGroups, sensitiveActions } from '@/components/organisms/audit/auditLabels'
import { PageHeader } from '@/components/organisms/PageHeader'
import { formatDateTime } from '@/lib/format'
import { downloadAuditCsv, useAuditEvents, type AuditFilter } from '@/services/api'

const ranges = [7, 30, 90, 365]

/** Registro de auditoría: quién hizo qué y cuándo, con filtros y exportación a CSV. */
export function AuditPage() {
  const [filter, setFilter] = useState<AuditFilter>({ days: 30, action: '', search: '' })
  const { data: events, isPending, error } = useAuditEvents(filter)
  const [exporting, setExporting] = useState(false)

  const exportCsv = async () => {
    setExporting(true)
    try {
      await downloadAuditCsv(filter)
    } catch {
      toast.error('No se pudo exportar el registro')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Auditoría"
        subtitle="Quién entró, qué cambió y quién escuchó o compartió información. Los eventos no se pueden editar ni borrar."
        action={
          <Button variant="secondary" onClick={() => void exportCsv()} loading={exporting}>
            Exportar CSV
          </Button>
        }
      />

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <select
          aria-label="Período"
          value={filter.days}
          onChange={(e) => setFilter({ ...filter, days: Number(e.target.value) })}
          className="min-h-10 border border-zinc-300 bg-white px-3 text-sm dark:border-white/15 dark:bg-zinc-900"
        >
          {ranges.map((d) => (
            <option key={d} value={d}>
              Últimos {d} días
            </option>
          ))}
        </select>
        <select
          aria-label="Tipo de acción"
          value={filter.action}
          onChange={(e) => setFilter({ ...filter, action: e.target.value })}
          className="min-h-10 border border-zinc-300 bg-white px-3 text-sm dark:border-white/15 dark:bg-zinc-900"
        >
          {auditGroups.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
        <label className="relative min-w-56 flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
            <SearchIcon className="size-4" />
          </span>
          <input
            type="search"
            aria-label="Buscar"
            placeholder="Usuario, objeto, detalle o IP"
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className="min-h-10 w-full border border-zinc-300 bg-white pl-9 pr-3 text-sm dark:border-white/15 dark:bg-zinc-900"
          />
        </label>
      </div>

      {isPending && <p className="mt-6 text-zinc-500">Cargando…</p>}
      {error && <p className="mt-6 text-red-600 dark:text-red-400">{error.message}</p>}
      {events?.length === 0 && <p className="mt-6 text-zinc-500 dark:text-zinc-400">No hay eventos con ese filtro.</p>}

      {events && events.length > 0 && (
        <ul className="mt-6 divide-y divide-zinc-100 border border-zinc-200 dark:divide-white/5 dark:border-white/10">
          {events.map((e) => (
            <li key={e.id} className="grid gap-1 px-4 py-3 text-sm md:grid-cols-[150px_200px_1fr_120px] md:items-baseline md:gap-4">
              <time dateTime={e.at} className="font-mono text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                {formatDateTime(e.at)}
              </time>
              <span className="truncate" title={e.userEmail ?? undefined}>
                {e.userEmail ?? <span className="text-zinc-400">Sistema / enlace público</span>}
              </span>
              <span className="min-w-0">
                <span className={sensitiveActions.has(e.action) ? 'font-medium text-red-600 dark:text-red-400' : 'font-medium'}>
                  {auditActionLabels[e.action] ?? e.action}
                </span>
                {e.target && <span className="text-zinc-600 dark:text-zinc-300"> · {e.target}</span>}
                {e.details && <span className="block text-xs text-zinc-500 dark:text-zinc-400">{e.details}</span>}
              </span>
              <span className="font-mono text-xs text-zinc-400 md:text-right">{e.ipAddress}</span>
            </li>
          ))}
        </ul>
      )}
      {events?.length === 2000 && <p className="mt-3 text-xs text-zinc-500">Se muestran los 2000 más recientes: acota el filtro o exporta.</p>}
    </div>
  )
}
