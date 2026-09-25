import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState, type DragEvent, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useParams } from 'react-router'
import { ApiError } from '@/services/api/client'
import {
  useDeleteDocument,
  useDeleteKnowledgeBase,
  useKnowledgeBase,
  useKnowledgeDocuments,
  useSaveKnowledgeBase,
  useUploadDocuments,
} from '@/services/api/queries'
import type { KnowledgeBase } from '@/services/api/types'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/atoms/Button'
import { ConfirmSheet } from '@/components/molecules/ConfirmSheet'
import { TextField } from '@/components/molecules/Field'
import { formatBytes, formatWhen } from '@/lib/format'
import { EmptyState, PageHeader } from '@/components/organisms/PageHeader'
import { Switch } from '@/components/atoms/Switch'
import { KnowledgeSearchBox } from '@/components/organisms/knowledge/KnowledgeSearchBox'

const accept = '.pdf,.docx,.txt,.md,.csv,.html,.htm'

export function KnowledgeBasePage() {
  const { id = '' } = useParams()
  const { isAdmin } = useAuth()
  const { data: base, error } = useKnowledgeBase(id)
  const [editing, setEditing] = useState(false)

  return (
    <div>
      <PageHeader
        title={base?.name ?? 'Base de conocimiento'}
        subtitle={base?.description}
        back={{ to: '/conocimiento', label: 'Volver a conocimiento' }}
        action={
          isAdmin &&
          base &&
          !editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 text-sm font-medium hover:border-slate-400 dark:border-white/15 dark:hover:border-white/30"
            >
              Editar
            </button>
          )
        }
      />
      {error && <p className="mt-6 text-red-600 dark:text-red-400">{error.message}</p>}
      {base && editing && <EditBase base={base} onDone={() => setEditing(false)} />}
      {base && !base.enabled && !editing && (
        <p className="mt-6 border-l-2 border-amber-500 py-1 pl-3 text-sm text-amber-700 dark:text-amber-400">
          Esta base está inactiva: el bot no la consulta.
        </p>
      )}

      {isAdmin && <UploadZone baseId={id} />}
      <Documents baseId={id} canDelete={isAdmin} />

      <section className="mt-12">
        <h2 className="font-medium">Probar búsqueda en esta base</h2>
        <div className="mt-4">
          <KnowledgeSearchBox knowledgeBaseId={id} />
        </div>
      </section>
    </div>
  )
}

function UploadZone({ baseId }: { baseId: string }) {
  const upload = useUploadDocuments(baseId)
  const input = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const send = (files: FileList | null) => {
    if (files && files.length > 0) upload.mutate([...files])
  }

  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragging(false)
    send(event.dataTransfer.files)
  }

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        disabled={upload.isPending}
        className={`flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragging
            ? 'border-slate-900 bg-slate-50 dark:border-white dark:bg-white/5'
            : 'border-slate-300 hover:border-slate-400 dark:border-white/15 dark:hover:border-white/30'
        }`}
      >
        {upload.isPending ? (
          <span className="flex items-center gap-2 font-medium">
            <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Leyendo e indexando…
          </span>
        ) : (
          <>
            <span className="font-medium">Arrastra archivos aquí o haz clic para elegir</span>
            <span className="mt-1 text-sm text-slate-500 dark:text-slate-400">PDF, Word (.docx), TXT, Markdown, CSV o HTML · hasta 20 MB cada uno</span>
          </>
        )}
      </button>
      <input ref={input} type="file" multiple accept={accept} className="hidden" onChange={(e) => send(e.target.files)} />
      {upload.error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{upload.error.message}</p>}
      {upload.data?.some((d) => d.status === 'Failed') && (
        <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">Algunos archivos no se pudieron leer; el motivo aparece en la lista.</p>
      )}
    </div>
  )
}

function Documents({ baseId, canDelete }: { baseId: string; canDelete: boolean }) {
  const { data: documents, isPending } = useKnowledgeDocuments(baseId)
  const remove = useDeleteDocument()

  return (
    <div className="mt-8">
      {isPending && <p className="text-slate-500">Cargando…</p>}
      {documents?.length === 0 && <EmptyState title="Sin documentos">Sube archivos para que el bot pueda consultarlos.</EmptyState>}
      <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 empty:hidden dark:divide-white/10 dark:border-white/10">
        <AnimatePresence initial={false}>
          {documents?.map((document) => (
            <motion.li
              key={document.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-4 px-4 py-3"
            >
              <span className={`size-2 shrink-0 rounded-full ${document.status === 'Ready' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{document.fileName}</span>
                <span className={`block text-sm ${document.status === 'Ready' ? 'text-slate-500 dark:text-slate-400' : 'text-red-600 dark:text-red-400'}`}>
                  {document.status === 'Ready'
                    ? `${document.chunkCount} ${document.chunkCount === 1 ? 'fragmento' : 'fragmentos'} · ${formatBytes(document.sizeBytes)} · ${formatWhen(document.createdAt)}`
                    : document.error}
                </span>
              </span>
              {canDelete && (
                <button
                  type="button"
                  onClick={() => remove.mutate(document.id)}
                  disabled={remove.isPending}
                  className="min-h-10 shrink-0 rounded-lg px-3 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  Eliminar
                </button>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}

function EditBase({ base, onDone }: { base: KnowledgeBase; onDone: () => void }) {
  const navigate = useNavigate()
  const save = useSaveKnowledgeBase(base.id)
  const remove = useDeleteKnowledgeBase()
  const [name, setName] = useState(base.name)
  const [description, setDescription] = useState(base.description ?? '')
  const [enabled, setEnabled] = useState(base.enabled)
  const [confirming, setConfirming] = useState(false)
  const fieldErrors = save.error instanceof ApiError ? save.error.fieldErrors : {}

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    save.mutate({ name, description: description.trim() || null, enabled }, { onSuccess: onDone })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4 rounded-xl border border-slate-300 p-5 dark:border-white/20">
      <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
        <TextField label="Nombre" value={name} onChange={(e) => setName(e.target.value)} error={fieldErrors.name?.[0]} />
        <TextField label="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} error={fieldErrors.description?.[0]} />
      </div>
      <Switch label="Activa" description="Solo las bases activas se consultan en las llamadas." checked={enabled} onChange={setEnabled} />
      <div className="flex flex-wrap justify-between gap-2">
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="min-h-10 rounded-lg px-3 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          Eliminar base
        </button>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onDone}>
            Cancelar
          </Button>
          <Button type="submit" loading={save.isPending}>
            Guardar
          </Button>
        </div>
      </div>

      {createPortal(
        <AnimatePresence>
          {confirming && (
            <ConfirmSheet
              title={`¿Eliminar "${base.name}"?`}
              description={`Se borran sus ${base.documentCount} documentos. Esta acción no se puede deshacer.`}
              error={remove.error?.message}
              loading={remove.isPending}
              onConfirm={() => remove.mutate(base.id, { onSuccess: () => navigate('/conocimiento') })}
              onCancel={() => {
                remove.reset()
                setConfirming(false)
              }}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </form>
  )
}
