import { useState, type FormEvent } from 'react'
import { useSearchKnowledge } from '@/services/api/queries'
import { Button } from '@/components/atoms/Button'
import { SearchIcon } from '@/components/atoms/icons'

/** Muestra lo mismo que recibiría el bot para una pregunta. */
export function KnowledgeSearchBox({ knowledgeBaseId }: { knowledgeBaseId?: string }) {
  const search = useSearchKnowledge()
  const [query, setQuery] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (query.trim()) search.mutate({ query, knowledgeBaseId })
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            <SearchIcon />
          </span>
          <input
            type="search"
            aria-label="Pregunta de prueba"
            placeholder="¿Cuánto cuesta el plan Pro?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block min-h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-base placeholder:text-slate-400 focus:border-indigo-500 focus:outline-2 focus:outline-indigo-500/30 dark:border-slate-700 dark:bg-slate-900 dark:placeholder:text-slate-500"
          />
        </div>
        <Button type="submit" loading={search.isPending} disabled={!query.trim()}>
          Buscar
        </Button>
      </form>

      {search.error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{search.error.message}</p>}
      {search.data?.length === 0 && <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No se encontró nada relacionado.</p>}
      {search.data && search.data.length > 0 && (
        <ol className="mt-4 space-y-3">
          {search.data.map((hit, index) => (
            <li key={index} className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {hit.baseName} · {hit.documentName}
              </p>
              <p className="mt-1 line-clamp-5 whitespace-pre-line text-sm">{hit.text}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
