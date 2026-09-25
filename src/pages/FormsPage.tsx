import { motion } from 'motion/react'
import { Link } from 'react-router'
import { useForms } from '@/services/api/queries'
import { useAuth } from '@/hooks/useAuth'
import { ChevronRightIcon, SparklesIcon } from '@/components/atoms/icons'
import { CreateButton, EmptyState, PageHeader } from '@/components/organisms/PageHeader'

export function FormsPage() {
  const { isAdmin } = useAuth()
  const { data: forms, isPending, error } = useForms()

  return (
    <div>
      <PageHeader
        title="Formularios"
        subtitle="Datos que el bot pide y guarda durante la llamada. Las respuestas aparecen aquí al instante."
        action={
          isAdmin && (
            <div className="flex items-center gap-2">
              <Link
                to="/formularios/nuevo?ia=1"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-medium hover:border-slate-400 dark:border-white/15 dark:hover:border-white/30"
              >
                <SparklesIcon />
                <span className="hidden sm:inline">Crear con IA</span>
                <span className="sm:hidden">IA</span>
              </Link>
              <CreateButton to="/formularios/nuevo" label="Nuevo formulario" />
            </div>
          )
        }
      />

      <div className="mt-10">
        {isPending && <p className="text-slate-500">Cargando…</p>}
        {error && <p className="text-red-600 dark:text-red-400">{error.message}</p>}
        {forms?.length === 0 && (
          <EmptyState title="Todavía no hay formularios">
            {isAdmin ? 'Crea uno, por ejemplo una solicitud de cotización o de soporte.' : 'Un administrador debe crearlos.'}
          </EmptyState>
        )}

        <ul className="grid gap-3 sm:grid-cols-2">
          {forms?.map((form, index) => (
            <motion.li
              key={form.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index, 10) * 0.03 }}
            >
              <Link
                to={`/formularios/${form.id}`}
                className={`flex h-full flex-col rounded-xl border border-slate-200 p-5 transition-colors hover:border-slate-400 dark:border-white/10 dark:hover:border-white/30 ${
                  form.enabled ? '' : 'opacity-60'
                }`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="font-medium">{form.name}</span>
                  {form.newSubmissionCount > 0 && (
                    <span className="shrink-0 rounded-full bg-slate-900 px-2 py-0.5 text-xs font-medium text-white dark:bg-white dark:text-slate-900">
                      {form.newSubmissionCount} {form.newSubmissionCount === 1 ? 'nueva' : 'nuevas'}
                    </span>
                  )}
                </span>
                {form.description && (
                  <span className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{form.description}</span>
                )}
                <span className="mt-auto flex items-center justify-between pt-4 text-sm text-slate-500 dark:text-slate-400">
                  <span>
                    {form.fields.length} {form.fields.length === 1 ? 'campo' : 'campos'} · {form.submissionCount}{' '}
                    {form.submissionCount === 1 ? 'respuesta' : 'respuestas'}
                    {!form.enabled && ' · Inactivo'}
                  </span>
                  <ChevronRightIcon />
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  )
}
