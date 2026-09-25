import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useDeleteSubmission, useForm, useSubmissions, useUpdateSubmission } from '../api/queries'
import type { FormSubmission, FormTemplate } from '../api/types'
import { useAuth } from '../auth/useAuth'
import { formatDateTime, formatWhen } from '../ui/format'
import { EmptyState, PageHeader } from '../ui/PageHeader'

type Filter = 'New' | 'All'

export function FormDetailPage() {
  const { id = '' } = useParams()
  const { isAdmin } = useAuth()
  const { data: form, error } = useForm(id)
  const { data: submissions, isPending } = useSubmissions(id)
  const [filter, setFilter] = useState<Filter>('New')

  const visible = submissions?.filter((s) => filter === 'All' || s.status === 'New') ?? []
  const pending = submissions?.filter((s) => s.status === 'New').length ?? 0

  return (
    <div>
      <PageHeader
        title={form?.name ?? 'Formulario'}
        subtitle={form?.description}
        back={{ to: '/formularios', label: 'Volver a formularios' }}
        action={
          isAdmin && (
            <Link
              to={`/formularios/${id}/editar`}
              className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 text-sm font-medium hover:border-slate-400 dark:border-white/15 dark:hover:border-white/30"
            >
              Editar
            </Link>
          )
        }
      />
      {error && <p className="mt-6 text-red-600 dark:text-red-400">{error.message}</p>}

      <div className="mt-8 flex items-center gap-1" role="tablist" aria-label="Filtrar respuestas">
        {(['New', 'All'] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={filter === value}
            onClick={() => setFilter(value)}
            className="min-h-10 rounded-lg px-3 text-sm font-medium text-slate-500 aria-selected:bg-slate-100 aria-selected:text-slate-900 dark:text-slate-400 dark:aria-selected:bg-white/10 dark:aria-selected:text-white"
          >
            {value === 'New' ? `Nuevas (${pending})` : `Todas (${submissions?.length ?? 0})`}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {isPending && <p className="text-slate-500">Cargando…</p>}
        {submissions && visible.length === 0 && (
          <EmptyState title={filter === 'New' ? 'No hay respuestas nuevas' : 'Todavía no hay respuestas'}>
            Cuando el bot complete este formulario en una llamada, la respuesta aparece aquí.
          </EmptyState>
        )}
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {form &&
              visible.map((submission) => (
                <motion.li
                  key={submission.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <SubmissionCard form={form} submission={submission} canDelete={isAdmin} />
                </motion.li>
              ))}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  )
}

function SubmissionCard({ form, submission, canDelete }: { form: FormTemplate; submission: FormSubmission; canDelete: boolean }) {
  const update = useUpdateSubmission()
  const remove = useDeleteSubmission()
  const isNew = submission.status === 'New'

  // Campos del formulario en su orden; los que ya no existen en la plantilla se muestran al final con su clave.
  const known = form.fields.filter((f) => submission.values[f.key] !== undefined).map((f) => [f.label, submission.values[f.key]] as const)
  const extra = Object.entries(submission.values).filter(([key]) => !form.fields.some((f) => f.key === key))

  return (
    <article className={`rounded-xl border p-5 ${isNew ? 'border-slate-300 dark:border-white/20' : 'border-slate-200 dark:border-white/10'}`}>
      <header className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-2">
          {isNew && <span className="size-2 rounded-full bg-slate-900 dark:bg-white" aria-label="Nueva" />}
          <time dateTime={submission.createdAt} title={formatDateTime(submission.createdAt)}>
            {formatWhen(submission.createdAt)}
          </time>
          {submission.callerNumber && (
            <>
              · <a href={`tel:${submission.callerNumber}`} className="underline underline-offset-4">{submission.callerNumber}</a>
            </>
          )}
        </span>
      </header>

      <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {[...known, ...extra].map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
            <dd className="mt-0.5 break-words">{value}</dd>
          </div>
        ))}
      </dl>

      <footer className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-white/5">
        <button
          type="button"
          disabled={update.isPending}
          onClick={() => update.mutate({ id: submission.id, status: isNew ? 'Reviewed' : 'New' })}
          className="min-h-10 rounded-lg px-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/10"
        >
          {isNew ? 'Marcar como revisada' : 'Marcar como nueva'}
        </button>
        {canDelete && (
          <button
            type="button"
            disabled={remove.isPending}
            onClick={() => remove.mutate(submission.id)}
            className="min-h-10 rounded-lg px-3 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            Eliminar
          </button>
        )}
      </footer>
    </article>
  )
}
