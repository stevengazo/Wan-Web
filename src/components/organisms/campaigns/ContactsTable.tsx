import { RetryIcon } from '@/components/atoms/icons'
import { formatWhen } from '@/lib/format'
import type { CampaignContact } from '@/services/api'
import { contactStatusLabels } from './campaignLabels'

interface ContactsTableProps {
  contacts: CampaignContact[]
  canEdit: boolean
  onRetry: (contact: CampaignContact) => void
  onDelete: (contact: CampaignContact) => void
}

/** Contactos de la campaña con su estado, intentos, resultado y notas del bot. En el teléfono, tarjetas. */
export function ContactsTable({ contacts, canEdit, onRetry, onDelete }: ContactsTableProps) {
  if (contacts.length === 0) {
    return <p className="p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">Importa contactos para empezar.</p>
  }

  return (
    <ul className="divide-y divide-zinc-100 border border-zinc-200 dark:divide-white/5 dark:border-white/10">
      {contacts.map((c) => {
        const status = contactStatusLabels[c.status]
        return (
          <li key={c.id} className="grid gap-2 px-4 py-3 sm:grid-cols-[1.2fr_1fr_1.6fr_auto] sm:items-center">
            <div className="min-w-0">
              <p className="truncate font-medium">{c.name ?? 'Sin nombre'}</p>
              <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{c.phoneNumber}</p>
            </div>
            <div className="text-sm">
              <p className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${status.dot}`} />
                {status.label}
                {c.attempts > 0 && <span className="text-xs text-zinc-400">· {c.attempts} intento{c.attempts === 1 ? '' : 's'}</span>}
              </p>
              {c.status === 'Pending' && c.nextAttemptAt && <p className="text-xs text-zinc-500">Reintenta {formatWhen(c.nextAttemptAt)}</p>}
              {c.lastResult && c.status !== 'Completed' && <p className="text-xs text-zinc-500">{c.lastResult}</p>}
            </div>
            <div className="min-w-0 text-sm">
              {c.outcome && <span className="inline-block bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">{c.outcome}</span>}
              {c.notes && <p className="mt-1 text-zinc-600 dark:text-zinc-300">{c.notes}</p>}
            </div>
            {canEdit && c.status !== 'Calling' ? (
              <div className="flex gap-1 sm:justify-end">
                <button
                  type="button"
                  onClick={() => onRetry(c)}
                  title="Volver a llamar"
                  aria-label={`Volver a llamar a ${c.name ?? c.phoneNumber}`}
                  className="flex size-9 items-center justify-center text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <RetryIcon className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(c)}
                  aria-label={`Quitar a ${c.name ?? c.phoneNumber}`}
                  className="min-h-9 px-2 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  Quitar
                </button>
              </div>
            ) : (
              <span />
            )}
          </li>
        )
      })}
    </ul>
  )
}
