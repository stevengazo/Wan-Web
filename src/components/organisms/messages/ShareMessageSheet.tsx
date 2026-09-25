import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/atoms/Button'
import { CopyField } from '@/components/molecules/CopyField'
import { formatDateTime } from '@/lib/format'
import type { CallMessage, MessageShare } from '@/services/api'

const durations = [
  { hours: 1, label: '1 hora' },
  { hours: 24, label: '24 horas' },
  { hours: 24 * 7, label: '7 días' },
  { hours: 24 * 30, label: '30 días' },
]

interface ShareMessageSheetProps {
  message: CallMessage
  /** URL pública del panel, base del enlace. */
  baseUrl: string
  share: MessageShare | undefined
  generating: boolean
  onGenerate: (expiresInHours: number) => void
  onClose: () => void
}

/** Enlace público con vencimiento para mandar el recado por WhatsApp (o cualquier canal). */
export function ShareMessageSheet({ message, baseUrl, share, generating, onGenerate, onClose }: ShareMessageSheetProps) {
  const [hours, setHours] = useState(24)
  const url = share ? `${baseUrl}/r/${share.token}` : null
  const text = url
    ? `Recado para ${message.directoryEntryName ?? message.recipient}${message.urgent ? ' (urgente)' : ''}: ${url}`
    : ''

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-end justify-center bg-zinc-950/60 sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        className="w-full space-y-5 border border-zinc-200 bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:max-w-md dark:border-white/10 dark:bg-zinc-950"
      >
        <div>
          <p className="eyebrow flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
            <span className="h-px w-5 bg-brand-500" />
            Compartir recado
          </p>
          <h2 id="share-title" className="mt-3 font-display text-3xl">
            Para {message.directoryEntryName ?? message.recipient}
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Cualquiera con el enlace puede leerlo y escuchar la llamada, sin iniciar sesión, hasta que venza.
          </p>
        </div>

        {!url ? (
          <>
            <fieldset>
              <legend className="text-sm font-medium">Vence en</legend>
              <div role="radiogroup" className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {durations.map((d) => (
                  <button
                    key={d.hours}
                    type="button"
                    role="radio"
                    aria-checked={hours === d.hours}
                    onClick={() => setHours(d.hours)}
                    className="min-h-11 border border-zinc-300 text-sm transition-colors aria-checked:border-brand-600 aria-checked:bg-brand-600 aria-checked:text-white dark:border-white/15"
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={() => onGenerate(hours)} loading={generating}>
                Crear enlace
              </Button>
            </div>
          </>
        ) : (
          <>
            <CopyField label="Enlace" value={url} />
            <p className="-mt-3 text-xs text-zinc-500 dark:text-zinc-400">Vence el {formatDateTime(share!.expiresAt)}.</p>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="secondary" onClick={onClose}>
                Listo
              </Button>
              {'share' in navigator && (
                <Button variant="secondary" onClick={() => void navigator.share({ title: 'Recado', text, url }).catch(() => {})}>
                  Compartir…
                </Button>
              )}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(text)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center bg-[#25D366] px-5 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90"
              >
                Enviar por WhatsApp
              </a>
            </div>
          </>
        )}
      </motion.section>
    </motion.div>
  )
}
