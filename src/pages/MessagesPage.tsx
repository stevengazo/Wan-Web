import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { useDeleteMessage, useMessages, useUpdateMessage } from '@/services/api/queries'
import type { CallMessage, CallMessageStatus } from '@/services/api/types'
import { useAuth } from '@/hooks/useAuth'
import { formatDateTime, formatWhen } from '@/lib/format'
import { EmptyState, PageHeader } from '@/components/organisms/PageHeader'

type Filter = 'Pending' | 'Done' | 'All'

const filterLabels: Record<Filter, string> = { Pending: 'Pendientes', Done: 'Resueltos', All: 'Todos' }

export function MessagesPage() {
  const { isAdmin } = useAuth()
  const { data: messages, isPending, error } = useMessages()
  const [filter, setFilter] = useState<Filter>('Pending')

  const count = (f: Filter) => messages?.filter((m) => matches(m, f)).length ?? 0
  const visible = messages?.filter((m) => matches(m, filter)) ?? []

  return (
    <div>
      <PageHeader title="Recados" subtitle="Mensajes que el bot tomó cuando la persona buscada no pudo atender." />

      <div className="mt-8 flex items-center gap-1" role="tablist" aria-label="Filtrar recados">
        {(Object.keys(filterLabels) as Filter[]).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={filter === value}
            onClick={() => setFilter(value)}
            className="min-h-10 rounded-lg px-3 text-sm font-medium text-slate-500 aria-selected:bg-slate-100 aria-selected:text-slate-900 dark:text-slate-400 dark:aria-selected:bg-white/10 dark:aria-selected:text-white"
          >
            {filterLabels[value]} ({count(value)})
          </button>
        ))}
      </div>

      <div className="mt-6">
        {isPending && <p className="text-slate-500">Cargando…</p>}
        {error && <p className="text-red-600 dark:text-red-400">{error.message}</p>}
        {messages && visible.length === 0 && (
          <EmptyState title={filter === 'Pending' ? 'No hay recados pendientes' : 'No hay recados'}>
            Para que el bot tome recados, agrega la tool leave_message al agente de ElevenLabs.
          </EmptyState>
        )}
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {visible.map((message) => (
              <motion.li
                key={message.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <MessageCard message={message} canDelete={isAdmin} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  )
}

function matches(message: CallMessage, filter: Filter) {
  if (filter === 'Pending') return message.status !== 'Done'
  if (filter === 'Done') return message.status === 'Done'
  return true
}

function MessageCard({ message, canDelete }: { message: CallMessage; canDelete: boolean }) {
  const update = useUpdateMessage()
  const remove = useDeleteMessage()
  const setStatus = (status: CallMessageStatus) => update.mutate({ id: message.id, status })
  const unread = message.status === 'New'

  return (
    <article
      // Al abrir un recado nuevo se marca como leído.
      onClick={() => unread && setStatus('Read')}
      className={`rounded-xl border p-5 ${
        unread ? 'border-slate-300 bg-slate-50/60 dark:border-white/20 dark:bg-white/[0.03]' : 'border-slate-200 dark:border-white/10'
      } ${message.status === 'Done' ? 'opacity-60' : ''}`}
    >
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 font-medium">
            {unread && <span className="size-2 rounded-full bg-slate-900 dark:bg-white" aria-label="No leído" />}
            Para {message.directoryEntryName ?? message.recipient}
            {message.urgent && (
              <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-medium text-white dark:bg-red-500">Urgente</span>
            )}
          </p>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            De {message.callerName ?? 'alguien que no dio su nombre'}
            {message.callbackNumber && (
              <>
                {' · '}
                <a href={`tel:${message.callbackNumber}`} onClick={(e) => e.stopPropagation()} className="underline underline-offset-4">
                  {message.callbackNumber}
                </a>
              </>
            )}
          </p>
        </div>
        <time dateTime={message.createdAt} title={formatDateTime(message.createdAt)} className="shrink-0 text-sm text-slate-500 dark:text-slate-400">
          {formatWhen(message.createdAt)}
        </time>
      </header>

      <p className="mt-4 whitespace-pre-line">{message.body}</p>

      <footer className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-white/5" onClick={(e) => e.stopPropagation()}>
        {message.status === 'Done' ? (
          <ActionButton onClick={() => setStatus('Read')} disabled={update.isPending}>
            Reabrir
          </ActionButton>
        ) : (
          <ActionButton onClick={() => setStatus('Done')} disabled={update.isPending}>
            Marcar como resuelto
          </ActionButton>
        )}
        {message.status === 'Read' && (
          <ActionButton onClick={() => setStatus('New')} disabled={update.isPending}>
            Marcar como no leído
          </ActionButton>
        )}
        {canDelete && (
          <button
            type="button"
            disabled={remove.isPending}
            onClick={() => remove.mutate(message.id)}
            className="min-h-10 rounded-lg px-3 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            Eliminar
          </button>
        )}
      </footer>
    </article>
  )
}

function ActionButton(props: { onClick: () => void; disabled: boolean; children: string }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      className="min-h-10 rounded-lg px-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/10"
    >
      {props.children}
    </button>
  )
}
