import { useState } from 'react'
import { providerLogos } from '@/components/atoms/providerLogos'
import { useExternalProviders, type ExternalProvider } from '@/services/api'

interface Props {
  onSelect: (provider: ExternalProvider) => Promise<void>
  onError: (message: string) => void
}

/** Solo muestra los proveedores habilitados en Configuración; sin ninguno no ocupa lugar. */
export function ExternalLoginButtons({ onSelect, onError }: Props) {
  const { data: providers = [] } = useExternalProviders()
  const [pending, setPending] = useState<ExternalProvider | null>(null)

  if (providers.length === 0) return null

  const select = async (provider: ExternalProvider) => {
    setPending(provider)
    try {
      await onSelect(provider)
    } catch (e) {
      onError(e instanceof Error ? e.message : 'No se pudo iniciar sesión')
      setPending(null)
    }
  }

  return (
    <div className="space-y-3">
      {providers.map(({ provider, displayName }) => {
        const Logo = providerLogos[provider]
        return (
          <button
            key={provider}
            type="button"
            disabled={pending !== null}
            onClick={() => void select(provider)}
            className="flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-900 transition-colors hover:border-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-wait disabled:opacity-70 dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-white/40"
          >
            {pending === provider ? (
              <span className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
            ) : (
              <Logo className="size-5" />
            )}
            Continuar con {displayName}
          </button>
        )
      })}
      <div className="flex items-center gap-3 pt-2 text-xs uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
        <span className="h-px flex-1 bg-zinc-200 dark:bg-white/10" />o con tu correo<span className="h-px flex-1 bg-zinc-200 dark:bg-white/10" />
      </div>
    </div>
  )
}
