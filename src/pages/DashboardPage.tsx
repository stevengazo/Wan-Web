import { Link } from 'react-router'
import { useExtensions } from '../api/queries'
import { useAuth } from '../auth/useAuth'

export function DashboardPage() {
  const { user } = useAuth()
  const { data: extensions } = useExtensions()
  const enabled = extensions?.filter((e) => e.enabled).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Hola, {user?.displayName}</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Las llamadas en vivo aparecerán aquí cuando el motor SIP esté conectado.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Link
          to="/extensiones"
          className="rounded-2xl border border-slate-200 p-4 transition-colors hover:border-indigo-300 dark:border-slate-800 dark:hover:border-indigo-500/50"
        >
          <p className="text-sm text-slate-500 dark:text-slate-400">Extensiones activas</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">
            {enabled ?? '–'}
            <span className="text-base font-normal text-slate-400"> / {extensions?.length ?? '–'}</span>
          </p>
        </Link>
      </div>
    </div>
  )
}
