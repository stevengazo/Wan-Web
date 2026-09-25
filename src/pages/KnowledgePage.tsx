import { motion } from 'motion/react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { ApiError } from '@/services/api/client'
import { useKnowledgeBases, useSaveKnowledgeBase } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/atoms/Button'
import { TextField } from '@/components/molecules/Field'
import { ChevronRightIcon, PlusIcon } from '@/components/atoms/icons'
import { EmptyState, PageHeader } from '@/components/organisms/PageHeader'
import { KnowledgeSearchBox } from '@/components/organisms/knowledge/KnowledgeSearchBox'

export function KnowledgePage() {
  const { isAdmin } = useAuth()
  const { data: bases, isPending, error } = useKnowledgeBases()
  const [creating, setCreating] = useState(false)

  return (
    <div>
      <PageHeader
        title="Conocimiento"
        subtitle="Documentos que el bot consulta para responder. En cada turno busca lo relevante a lo que pregunta quien llama."
        action={
          isAdmin &&
          !creating && (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              <PlusIcon />
              <span className="hidden sm:inline">Nueva base</span>
            </button>
          )
        }
      />

      <div className="mt-10 space-y-3">
        {creating && <CreateBase onCancel={() => setCreating(false)} />}
        {isPending && <p className="text-slate-500">Cargando…</p>}
        {error && <p className="text-red-600 dark:text-red-400">{error.message}</p>}
        {bases?.length === 0 && !creating && (
          <EmptyState title="Todavía no hay bases de conocimiento">
            {isAdmin ? 'Crea una y sube PDF, Word, texto o HTML con la información de tu empresa.' : 'Un administrador debe crearlas.'}
          </EmptyState>
        )}

        <ul className="grid gap-3 sm:grid-cols-2">
          {bases?.map((base, index) => (
            <motion.li key={base.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index, 10) * 0.03 }}>
              <Link
                to={`/conocimiento/${base.id}`}
                className={`flex h-full flex-col rounded-xl border border-slate-200 p-5 transition-colors hover:border-slate-400 dark:border-white/10 dark:hover:border-white/30 ${
                  base.enabled ? '' : 'opacity-60'
                }`}
              >
                <span className="font-medium">{base.name}</span>
                {base.description && <span className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{base.description}</span>}
                <span className="mt-auto flex items-center justify-between pt-4 text-sm text-slate-500 dark:text-slate-400">
                  <span>
                    {base.documentCount} {base.documentCount === 1 ? 'documento' : 'documentos'} · {base.chunkCount} fragmentos
                    {!base.enabled && ' · Inactiva'}
                  </span>
                  <ChevronRightIcon />
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>

      {bases && bases.length > 0 && (
        <section className="mt-12">
          <h2 className="font-medium">Probar búsqueda</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Escribe como hablaría quien llama. Busca en todas las bases activas.</p>
          <div className="mt-4">
            <KnowledgeSearchBox />
          </div>
        </section>
      )}
    </div>
  )
}

function CreateBase({ onCancel }: { onCancel: () => void }) {
  const navigate = useNavigate()
  const save = useSaveKnowledgeBase(undefined)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const fieldErrors = save.error instanceof ApiError ? save.error.fieldErrors : {}

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    save.mutate(
      { name, description: description.trim() || null, enabled: true },
      { onSuccess: (base) => navigate(`/conocimiento/${base.id}`) },
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 rounded-xl border border-slate-300 p-5 dark:border-white/20">
      <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
        <TextField label="Nombre" placeholder="Políticas y precios" value={name} onChange={(e) => setName(e.target.value)} error={fieldErrors.name?.[0]} autoFocus />
        <TextField
          label="Descripción"
          placeholder="Qué contiene, para reconocerla"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={fieldErrors.description?.[0]}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={save.isPending}>
          Crear y subir archivos
        </Button>
      </div>
    </form>
  )
}
