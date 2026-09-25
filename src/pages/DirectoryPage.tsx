import { motion } from 'motion/react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router'
import { useDirectory } from '@/services/api'
import type { DirectoryEntry } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { ChevronRightIcon, PlusIcon, SearchIcon } from '@/components/atoms/icons'

export function DirectoryPage() {
  const { isAdmin } = useAuth()
  const { data: entries, isPending, error, refetch } = useDirectory()
  const [query, setQuery] = useState('')

  const filtered = entries?.filter((entry) => matches(entry, query)) ?? []
  const groups = groupByDepartment(filtered)

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl">Directorio</h1>
          <p className="mt-2 max-w-xl text-zinc-500 dark:text-zinc-400">
            A dónde puede transferir el bot. Las entradas activas se le pasan en cada llamada.
          </p>
        </div>
        {isAdmin && (
          <Link
            to="/directorio/nueva"
            className="hidden min-h-11 shrink-0 items-center gap-2 rounded-lg bg-brand-600 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-brand-500 md:inline-flex dark:bg-brand-600 dark:text-white dark:hover:bg-brand-500"
          >
            <PlusIcon />
            Nueva entrada
          </Link>
        )}
      </div>

      {entries && entries.length > 0 && (
        <div className="relative mt-8 max-w-sm">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
            <SearchIcon />
          </span>
          <input
            type="search"
            placeholder="Buscar por nombre, área o tema"
            aria-label="Buscar en el directorio"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block min-h-11 w-full rounded-lg border border-zinc-300 bg-white pl-10 pr-3 text-base placeholder:text-zinc-400 focus:border-brand-500 focus:outline-2 focus:outline-brand-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-500"
          />
        </div>
      )}

      <div className="mt-8">
        {isPending && <p className="text-zinc-500">Cargando…</p>}

        {error && (
          <div className="border-l-2 border-red-500 py-1 pl-3 text-sm">
            <p className="text-red-600 dark:text-red-400">{error.message}</p>
            <button type="button" onClick={() => refetch()} className="mt-1 min-h-11 font-medium underline underline-offset-4">
              Reintentar
            </button>
          </div>
        )}

        {entries?.length === 0 && (
          <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-white/15">
            <p className="font-medium">El directorio está vacío</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {isAdmin
                ? 'Agrega áreas o personas para que el bot sepa a dónde transferir.'
                : 'Un administrador debe agregar las entradas.'}
            </p>
          </div>
        )}

        {entries && entries.length > 0 && filtered.length === 0 && (
          <p className="text-zinc-500 dark:text-zinc-400">Nada coincide con “{query}”.</p>
        )}

        <div className="space-y-8">
          {groups.map(([department, items]) => (
            <section key={department}>
              <h2 className="mb-2 eyebrow text-zinc-500 dark:text-zinc-400">{department}</h2>
              <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 dark:divide-white/10 dark:border-white/10">
                {items.map((entry, index) => (
                  <motion.li
                    key={entry.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index, 10) * 0.03 }}
                  >
                    {isAdmin ? (
                      <Link
                        to={`/directorio/${entry.id}`}
                        className="flex min-h-16 items-center gap-4 px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-white/5"
                      >
                        <EntryRow entry={entry} />
                        <ChevronRightIcon />
                      </Link>
                    ) : (
                      <div className="flex min-h-16 items-center gap-4 px-4 py-3">
                        <EntryRow entry={entry} />
                      </div>
                    )}
                  </motion.li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>

      {/* Botón flotante en móvil, sobre la barra inferior. En un portal: la animación de página aplica transform
          y rompería el position: fixed. */}
      {isAdmin &&
        createPortal(
          <Link
            to="/directorio/nueva"
            aria-label="Nueva entrada"
            className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-20 flex size-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30 md:hidden dark:bg-brand-600 dark:text-white"
          >
            <PlusIcon />
          </Link>,
          document.body,
        )}
    </div>
  )
}

function EntryRow({ entry }: { entry: DirectoryEntry }) {
  return (
    <span className={`min-w-0 flex-1 ${entry.enabled ? '' : 'opacity-50'}`}>
      <span className="flex items-baseline gap-3">
        <span className="truncate font-medium">{entry.name}</span>
        <span className="shrink-0 font-mono text-sm text-zinc-500 dark:text-zinc-400">{entry.target}</span>
        {!entry.enabled && <span className="shrink-0 text-xs text-zinc-500">Inactiva</span>}
      </span>
      {entry.description && <span className="mt-0.5 block truncate text-sm text-zinc-500 dark:text-zinc-400">{entry.description}</span>}
    </span>
  )
}

function normalize(text: string) {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

function matches(entry: DirectoryEntry, query: string) {
  const needle = normalize(query.trim())
  if (!needle) return true
  return normalize(`${entry.name} ${entry.department ?? ''} ${entry.target} ${entry.description ?? ''}`).includes(needle)
}

function groupByDepartment(entries: DirectoryEntry[]) {
  const groups = new Map<string, DirectoryEntry[]>()
  for (const entry of entries) {
    const key = entry.department?.trim() || 'Sin área'
    groups.set(key, [...(groups.get(key) ?? []), entry])
  }
  return [...groups.entries()].sort(([a], [b]) => (a === 'Sin área' ? 1 : b === 'Sin área' ? -1 : a.localeCompare(b)))
}
