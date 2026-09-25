import { AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useParams } from 'react-router'
import { PauseIcon, PlayIcon } from '@/components/atoms/icons'
import { Button } from '@/components/atoms/Button'
import { ConfirmSheet } from '@/components/molecules/ConfirmSheet'
import { CampaignProgressBar } from '@/components/organisms/campaigns/CampaignProgressBar'
import { ContactsImport } from '@/components/organisms/campaigns/ContactsImport'
import { ContactsTable } from '@/components/organisms/campaigns/ContactsTable'
import { campaignStatusLabels } from '@/components/organisms/campaigns/campaignLabels'
import { PageHeader } from '@/components/organisms/PageHeader'
import { useAuth } from '@/hooks/useAuth'
import { useCampaign, useCampaignContacts, useCampaignControl, useContactAction, useDeleteCampaign, useImportContacts } from '@/services/api'

/** Contenedor: avance, resultados, contactos e importación de una campaña. */
export function CampaignDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { data: campaign, isPending, error } = useCampaign(id)
  const { data: contacts } = useCampaignContacts(id)
  const control = useCampaignControl(id)
  const importer = useImportContacts(id)
  const contactAction = useContactAction(id)
  const remove = useDeleteCampaign()
  const [importing, setImporting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (isPending) return <p className="text-zinc-500">Cargando…</p>
  if (error || !campaign) return <p className="text-red-600 dark:text-red-400">{error?.message ?? 'No encontrada'}</p>

  const status = campaignStatusLabels[campaign.status]
  const running = campaign.status === 'Running'

  return (
    <div>
      <PageHeader
        title={campaign.name}
        back={{ to: '/campanas', label: 'Campañas' }}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${status.className}`}>{status.label}</span>
            Desde {campaign.extensionName} · {campaign.maxConcurrentCalls} a la vez · hasta {campaign.maxAttempts} intentos
          </span>
        }
        action={
          isAdmin && (
            <div className="flex gap-2">
              <Link
                to={`/campanas/${id}/editar`}
                className="inline-flex min-h-11 items-center border border-zinc-300 px-4 text-xs font-semibold uppercase tracking-[0.2em] hover:border-zinc-900 dark:border-white/15 dark:hover:border-white/40"
              >
                Editar
              </Link>
              {running ? (
                <Button variant="secondary" onClick={() => control.mutate('pause')} loading={control.isPending}>
                  <PauseIcon className="size-4" />
                  Pausar
                </Button>
              ) : (
                campaign.progress.pending > 0 && (
                  <Button onClick={() => control.mutate('start')} loading={control.isPending}>
                    <PlayIcon className="size-4" />
                    {campaign.status === 'Draft' ? 'Iniciar' : 'Reanudar'}
                  </Button>
                )
              )}
            </div>
          )
        }
      />

      <section className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="border border-zinc-200 p-5 dark:border-white/10">
          <p className="eyebrow text-zinc-500 dark:text-zinc-400">Avance</p>
          <p className="mt-2 text-3xl font-light tabular-nums">
            {campaign.progress.total - campaign.progress.pending - campaign.progress.calling}
            <span className="text-lg text-zinc-400"> / {campaign.progress.total}</span>
          </p>
          <div className="mt-4">
            <CampaignProgressBar progress={campaign.progress} legend />
          </div>
        </div>
        <div className="border border-zinc-200 p-5 dark:border-white/10">
          <p className="eyebrow text-zinc-500 dark:text-zinc-400">Resultados</p>
          {Object.keys(campaign.progress.outcomes).length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">Aparecen cuando el bot registra cómo terminó cada llamada.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {Object.entries(campaign.progress.outcomes)
                .sort((a, b) => b[1] - a[1])
                .map(([outcome, count]) => (
                  <li key={outcome} className="flex items-center justify-between gap-3 text-sm">
                    {outcome}
                    <span className="font-mono tabular-nums">{count}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="eyebrow flex items-center gap-4 text-zinc-500 dark:text-zinc-400">
            <span className="h-px w-6 bg-brand-500" />
            Contactos
          </h2>
          {isAdmin && (
            <Button variant="secondary" onClick={() => setImporting(!importing)}>
              {importing ? 'Cerrar' : 'Importar CSV'}
            </Button>
          )}
        </div>
        {importing && (
          <div className="mt-4">
            <ContactsImport importing={importer.isPending} result={importer.data} onImport={(csv) => importer.mutate(csv)} />
          </div>
        )}
        <div className="mt-4">
          <ContactsTable
            contacts={contacts ?? []}
            canEdit={isAdmin}
            onRetry={(c) => contactAction.mutate({ contactId: c.id, action: 'retry' })}
            onDelete={(c) => contactAction.mutate({ contactId: c.id, action: 'delete' })}
          />
        </div>
      </section>

      <details className="mt-10 border border-zinc-200 p-5 dark:border-white/10">
        <summary className="cursor-pointer text-sm font-medium">Guion del bot</summary>
        {campaign.openingLine && <p className="mt-3 text-sm italic text-zinc-600 dark:text-zinc-300">«{campaign.openingLine}»</p>}
        <p className="mt-3 whitespace-pre-line text-sm text-zinc-600 dark:text-zinc-300">{campaign.instructions}</p>
      </details>

      {isAdmin && !running && (
        <div className="mt-10 flex justify-end">
          <button type="button" onClick={() => setDeleting(true)} className="min-h-10 px-3 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">
            Eliminar campaña
          </button>
        </div>
      )}

      {createPortal(
        <AnimatePresence>
          {deleting && (
            <ConfirmSheet
              title={`¿Eliminar «${campaign.name}»?`}
              description="Se borran también sus contactos y resultados. Las llamadas quedan en el historial."
              error={remove.error?.message}
              loading={remove.isPending}
              onConfirm={() => remove.mutate(id, { onSuccess: () => navigate('/campanas') })}
              onCancel={() => setDeleting(false)}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  )
}
