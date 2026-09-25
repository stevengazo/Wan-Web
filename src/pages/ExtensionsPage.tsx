import { motion } from 'motion/react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router'
import { useExtensions } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { ChevronRightIcon, PlusIcon } from '@/components/atoms/icons'

export function ExtensionsPage() {
  const { isAdmin } = useAuth()
  const { data: extensions, isPending, error, refetch } = useExtensions()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-4xl md:text-5xl">Extensiones</h1>
        {isAdmin && (
          <Link
            to="/extensiones/nueva"
            className="hidden min-h-11 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-700 md:inline-flex dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <PlusIcon />
            Nueva extensión
          </Link>
        )}
      </div>

      {isPending && <ListSkeleton />}

      {error && (
        <div className="rounded-2xl border border-red-200 p-4 text-sm dark:border-red-500/30">
          <p className="text-red-700 dark:text-red-300">{error.message}</p>
          <button type="button" onClick={() => refetch()} className="mt-2 min-h-11 font-medium underline underline-offset-4">
            Reintentar
          </button>
        </div>
      )}

      {extensions?.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
          <p className="font-medium">Todavía no hay extensiones</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isAdmin ? 'Agrega la primera para que el bot pueda atender llamadas.' : 'Un administrador debe crearlas.'}
          </p>
        </div>
      )}

      {extensions && extensions.length > 0 && (
        <ul className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
          {extensions.map((extension, index) => {
            const content = (
              <>
                <span
                  className={`size-2.5 shrink-0 rounded-full ${extension.enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                  aria-label={extension.enabled ? 'Habilitada' : 'Deshabilitada'}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{extension.name}</span>
                  <span className="block truncate text-sm text-slate-500 dark:text-slate-400">
                    {extension.sipUsername}@{extension.sipDomain ?? extension.sipServer}
                  </span>
                </span>
                <span className="hidden text-sm text-slate-500 sm:block dark:text-slate-400">
                  {extension.enabled ? 'Habilitada' : 'Deshabilitada'}
                </span>
                {isAdmin && <ChevronRightIcon />}
              </>
            )
            return (
              <motion.li
                key={extension.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index, 10) * 0.03 }}
              >
                {isAdmin ? (
                  <Link
                    to={`/extensiones/${extension.id}`}
                    className="flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="flex min-h-16 items-center gap-3 px-4 py-3">{content}</div>
                )}
              </motion.li>
            )
          })}
        </ul>
      )}

      {/* Botón flotante en móvil, sobre la barra inferior. Va en un portal: un ancestro con transform
          (la animación de página) rompería el position: fixed. */}
      {isAdmin &&
        createPortal(
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-20 md:hidden"
        >
          <Link
            to="/extensiones/nueva"
            aria-label="Nueva extensión"
            className="flex size-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/30 dark:bg-white dark:text-slate-900"
          >
            <PlusIcon />
          </Link>
        </motion.div>,
          document.body,
        )}
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-px overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800" aria-label="Cargando">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex min-h-16 items-center gap-3 px-4">
          <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  )
}
