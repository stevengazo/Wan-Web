import { useParams } from 'react-router'
import { Logo } from '@/components/atoms/Logo'
import { formatDateTime } from '@/lib/format'
import { usePublicMessage } from '@/services/api'

/** Recado abierto desde un enlace público (WhatsApp): sin sesión y solo lectura. */
export function PublicMessagePage() {
  const { token = '' } = useParams()
  const { data: message, isPending, error } = usePublicMessage(token)

  return (
    <div className="flex min-h-dvh flex-col bg-white dark:bg-zinc-950">
      <header className="border-b border-zinc-200 px-5 py-4 dark:border-white/10">
        <Logo />
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-5 py-10">
        {isPending && <p className="text-zinc-500">Cargando…</p>}

        {error && (
          <div className="py-10">
            <p className="eyebrow text-zinc-500">Enlace no disponible</p>
            <h1 className="mt-3 font-display text-4xl">Este enlace venció o no es válido</h1>
            <p className="mt-3 text-zinc-500 dark:text-zinc-400">Pide a quien te lo mandó que genere uno nuevo.</p>
          </div>
        )}

        {message && (
          <article>
            <p className="eyebrow flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
              <span className="h-px w-6 bg-brand-500" />
              Recado
              {message.urgent && <span className="bg-red-600 px-2 py-0.5 text-white">Urgente</span>}
            </p>
            <h1 className="mt-4 font-display text-5xl leading-tight">Para {message.recipient}</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{formatDateTime(message.createdAt)}</p>

            <p className="mt-8 whitespace-pre-line border-l-2 border-brand-500 pl-5 text-lg leading-relaxed">{message.body}</p>

            <dl className="mt-8 grid gap-4 border-y border-zinc-200 py-6 sm:grid-cols-2 dark:border-white/10">
              <div>
                <dt className="eyebrow text-zinc-500 dark:text-zinc-400">De</dt>
                <dd className="mt-1">{message.callerName ?? 'No dio su nombre'}</dd>
              </div>
              <div>
                <dt className="eyebrow text-zinc-500 dark:text-zinc-400">Devolver la llamada</dt>
                <dd className="mt-1">
                  {message.callbackNumber ? (
                    <a href={`tel:${message.callbackNumber}`} className="font-mono text-brand-600 underline underline-offset-4 dark:text-brand-400">
                      {message.callbackNumber}
                    </a>
                  ) : (
                    'Sin número'
                  )}
                </dd>
              </div>
            </dl>

            {message.hasAudio && (
              <section className="mt-8">
                <h2 className="eyebrow text-zinc-500 dark:text-zinc-400">Escuchar la llamada</h2>
                <audio controls preload="none" src={`/api/public/messages/${encodeURIComponent(token)}/audio`} className="mt-3 w-full" />
              </section>
            )}

            <p className="mt-10 text-xs text-zinc-400">Enlace válido hasta el {formatDateTime(message.expiresAt)}.</p>
          </article>
        )}
      </main>
    </div>
  )
}
