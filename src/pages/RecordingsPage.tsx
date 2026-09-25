import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Link } from 'react-router'
import { api } from '@/services/api/client'
import { useCallSettings, useDeleteRecording, useRecordings } from '@/services/api'
import type { Recording } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { formatBytes, formatDateTime, formatDuration, formatWhen } from '@/lib/format'
import { EmptyState, PageHeader } from '@/components/organisms/PageHeader'

export function RecordingsPage() {
  const { isAdmin } = useAuth()
  const { data: recordings, isPending, error } = useRecordings()
  const { data: settings } = useCallSettings()

  return (
    <div>
      <PageHeader title="Grabaciones" subtitle="Audio completo de cada conversación, tal como lo envía ElevenLabs al terminar la llamada." />

      {settings && !settings.recordCalls && (
        <p className="mt-6 border-l-2 border-amber-500 py-1 pl-3 text-sm text-amber-700 dark:text-amber-400">
          La grabación está desactivada.{' '}
          {isAdmin ? (
            <Link to="/configuracion" className="underline underline-offset-4">
              Actívala en Configuración
            </Link>
          ) : (
            'Un administrador puede activarla.'
          )}
        </p>
      )}

      <div className="mt-8">
        {isPending && <p className="text-zinc-500">Cargando…</p>}
        {error && <p className="text-red-600 dark:text-red-400">{error.message}</p>}
        {recordings?.length === 0 && (
          <EmptyState title="Todavía no hay grabaciones">
            Aparecen aquí cuando termina una llamada con la grabación activada (Configuración → Llamadas).
          </EmptyState>
        )}
        <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 empty:hidden dark:divide-white/10 dark:border-white/10">
          <AnimatePresence initial={false}>
            {recordings?.map((recording) => (
              <motion.li key={recording.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <RecordingRow recording={recording} canDelete={isAdmin} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  )
}

const storageLabels: Record<Recording['storage'], string> = { Local: 'En el servidor', S3: 'S3', AzureBlob: 'Azure' }

function RecordingRow({ recording, canDelete }: { recording: Recording; canDelete: boolean }) {
  const remove = useDeleteRecording()
  const [src, setSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // En la nube sin cifrado se usa el enlace firmado; si no, la API sirve el audio (con rangos) y la cookie de
  // sesión viaja sola.
  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const { url } = await api<{ url: string | null }>(`/recordings/${recording.id}/location`)
      if (url) {
        setSrc(url)
        return
      }

      setSrc(`/api/recordings/${recording.id}/audio`)
    } catch {
      setError('No se pudo cargar el audio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium" title={formatDateTime(recording.createdAt)}>
            {formatWhen(recording.createdAt)}
          </p>
          <p className="truncate font-mono text-xs text-zinc-500 dark:text-zinc-400">
            {recording.durationSeconds != null && `${formatDuration(recording.durationSeconds)} · `}
            {formatBytes(recording.sizeBytes)} · {storageLabels[recording.storage]}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {!src && (
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="min-h-10 rounded-lg bg-brand-600 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-brand-500 disabled:opacity-60 dark:bg-brand-600 dark:text-white dark:hover:bg-brand-500"
            >
              {loading ? 'Cargando…' : 'Escuchar'}
            </button>
          )}
          {src && (
            <a
              href={src}
              download={`grabacion-${recording.createdAt.slice(0, 16).replace(/[:T]/g, '-')}.${recording.contentType === 'audio/wav' ? 'wav' : 'mp3'}`}
              className="min-h-10 content-center rounded-lg px-3 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-white/10"
            >
              Descargar
            </a>
          )}
          {canDelete && (
            <button
              type="button"
              disabled={remove.isPending}
              onClick={() => remove.mutate(recording.id)}
              className="min-h-10 rounded-lg px-3 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {src && <audio controls autoPlay src={src} onError={() => setError('No se pudo cargar el audio')} className="mt-3 w-full" />}
    </div>
  )
}
