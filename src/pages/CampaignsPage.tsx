import { Link } from 'react-router'
import { CampaignProgressBar } from '@/components/organisms/campaigns/CampaignProgressBar'
import { campaignStatusLabels } from '@/components/organisms/campaigns/campaignLabels'
import { CreateButton, EmptyState, PageHeader } from '@/components/organisms/PageHeader'
import { useAuth } from '@/hooks/useAuth'
import { formatWhen } from '@/lib/format'
import { useCampaigns } from '@/services/api'

/** Campañas de llamadas salientes que hace el bot. */
export function CampaignsPage() {
  const { isAdmin } = useAuth()
  const { data: campaigns, isPending, error } = useCampaigns()

  return (
    <div>
      <PageHeader
        title="Campañas"
        subtitle="El bot llama a una lista de contactos con un guion: recordatorios, cobros, encuestas, seguimiento."
        action={isAdmin && <CreateButton to="/campanas/nueva" label="Nueva campaña" />}
      />

      <div className="mt-8 space-y-3">
        {isPending && <p className="text-zinc-500">Cargando…</p>}
        {error && <p className="text-red-600 dark:text-red-400">{error.message}</p>}
        {campaigns?.length === 0 && (
          <EmptyState title="Todavía no hay campañas">Crea una, importa los contactos desde un CSV y el bot se encarga de llamar.</EmptyState>
        )}
        {campaigns?.map((c) => {
          const status = campaignStatusLabels[c.status]
          const called = c.progress.total - c.progress.pending - c.progress.calling
          return (
            <Link
              key={c.id}
              to={`/campanas/${c.id}`}
              className="block border border-zinc-200 p-5 transition-colors hover:border-zinc-400 dark:border-white/10 dark:hover:border-white/30"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium">
                    {c.name}
                    <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${status.className}`}>{status.label}</span>
                  </p>
                  <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                    Desde {c.extensionName} · creada {formatWhen(c.createdAt)}
                  </p>
                </div>
                <p className="text-right font-mono text-sm tabular-nums">
                  {called}/{c.progress.total}
                  <span className="block font-sans text-xs text-zinc-500">llamados</span>
                </p>
              </div>
              <div className="mt-4">
                <CampaignProgressBar progress={c.progress} />
              </div>
              {Object.keys(c.progress.outcomes).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(c.progress.outcomes).map(([outcome, count]) => (
                    <span key={outcome} className="bg-brand-50 px-2 py-0.5 text-xs text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                      {outcome} · {count}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
