import { useState, type ReactNode } from 'react'
import { CallsHeatmap, DailyCallsChart, ExtensionsBreakdown, KpiTile, RankedList } from '@/components/organisms/analytics/AnalyticsCharts'
import { PageHeader } from '@/components/organisms/PageHeader'
import { formatDuration } from '@/lib/format'
import { useAnalytics, useExtensions } from '@/services/api'

const ranges = [
  { days: 7, label: '7 días' },
  { days: 30, label: '30 días' },
  { days: 90, label: '90 días' },
]

/** Contenedor: filtros y métricas de llamadas, recados, formularios y campañas. */
export function AnalyticsPage() {
  const [days, setDays] = useState(30)
  const [extensionId, setExtensionId] = useState<string | null>(null)
  const { data, isPending, error } = useAnalytics(days, extensionId)
  const { data: extensions } = useExtensions()
  const t = data?.totals
  const percent = (value: number) => `${Math.round(value * 100)}%`

  return (
    <div>
      <PageHeader title="Analítica" subtitle="Cuánto llaman, cuándo, cuánto atiende el bot y cómo terminan las llamadas." />

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div role="radiogroup" aria-label="Período" className="flex border border-zinc-300 dark:border-white/15">
          {ranges.map((r) => (
            <button
              key={r.days}
              type="button"
              role="radio"
              aria-checked={days === r.days}
              onClick={() => setDays(r.days)}
              className="min-h-10 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 aria-checked:bg-brand-600 aria-checked:text-white dark:text-zinc-400"
            >
              {r.label}
            </button>
          ))}
        </div>
        <select
          aria-label="Extensión"
          value={extensionId ?? ''}
          onChange={(e) => setExtensionId(e.target.value || null)}
          className="min-h-10 border border-zinc-300 bg-white px-3 text-sm dark:border-white/15 dark:bg-zinc-900"
        >
          <option value="">Todas las extensiones</option>
          {extensions?.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </div>

      {isPending && <p className="mt-8 text-zinc-500">Cargando…</p>}
      {error && <p className="mt-8 text-red-600 dark:text-red-400">{error.message}</p>}

      {t && data && (
        <>
          <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiTile label="Llamadas" value={String(t.calls)} hint={`${t.inbound} entrantes · ${t.outbound} salientes`} />
            <KpiTile label="Atendidas" value={percent(t.answerRate)} hint={`${t.answered} atendidas · ${t.missed} perdidas`} />
            <KpiTile label="Duración promedio" value={formatDuration(t.averageDurationSeconds)} hint={`${t.talkMinutes} min hablados`} />
            <KpiTile
              label="Derivadas"
              value={String(t.transferred + t.takenByOperator)}
              hint={`${t.transferred} transferidas · ${t.takenByOperator} tomadas`}
            />
            <KpiTile label="Recados" value={String(t.messages)} />
            <KpiTile label="Formularios" value={String(t.formSubmissions)} />
            <KpiTile label="Fallidas" value={String(t.failed)} hint="Errores de la central o del proveedor de voz" />
            <KpiTile
              label="Resueltas por el bot"
              value={t.answered === 0 ? '—' : percent((t.answered - t.transferred - t.takenByOperator) / t.answered)}
              hint="Atendidas sin pasar a una persona"
            />
          </section>

          <Panel title="Llamadas por día" className="mt-6">
            <DailyCallsChart days={data.days} />
          </Panel>

          <Panel title="Cuándo llaman" className="mt-6">
            <CallsHeatmap cells={data.heatmap} />
          </Panel>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Panel title="Por extensión">
              <ExtensionsBreakdown extensions={data.extensions} />
            </Panel>
            <Panel title="Cómo terminan">
              <RankedList items={data.endReasons.map((r) => ({ label: r.reason, value: r.calls }))} empty="Sin llamadas terminadas en el período." />
            </Panel>
            <Panel title="Resultados de campañas">
              <RankedList
                items={Object.entries(data.campaignOutcomes)
                  .sort((a, b) => b[1] - a[1])
                  .map(([label, value]) => ({ label, value }))}
                empty="Sin resultados de campañas en el período."
              />
            </Panel>
          </div>
        </>
      )}
    </div>
  )
}

function Panel({ title, className = '', children }: { title: string; className?: string; children: ReactNode }) {
  return (
    <section className={`border border-zinc-200 p-5 dark:border-white/10 ${className}`}>
      <h2 className="eyebrow mb-4 flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
        <span className="h-px w-5 bg-brand-500" />
        {title}
      </h2>
      {children}
    </section>
  )
}
