import { useState } from 'react'
import { providerLogos } from '@/components/atoms/providerLogos'
import { formatDateTime } from '@/lib/format'
import { useExternalProviders, useLinkedAccounts, useUnlinkAccount, type ExternalProvider } from '@/services/api'

/** Cuentas de Google o Microsoft con las que se puede entrar, además (o en lugar) de la contraseña. */
export function LinkedAccountsSection({ onLink }: { onLink: (provider: ExternalProvider) => Promise<void> }) {
  const { data: providers = [] } = useExternalProviders()
  const { data: linked = [] } = useLinkedAccounts()
  const unlink = useUnlinkAccount()
  const [linking, setLinking] = useState<ExternalProvider | null>(null)
  const [error, setError] = useState<string | null>(null)

  const available = new Set([...providers.map((p) => p.provider), ...linked.map((l) => l.provider)])
  if (available.size === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Un administrador puede habilitar Google o Microsoft en Configuración → Inicio de sesión.</p>
  }

  const link = async (provider: ExternalProvider) => {
    setError(null)
    setLinking(provider)
    try {
      await onLink(provider)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo vincular')
      setLinking(null)
    }
  }

  return (
    <div className="space-y-3">
      <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-white/10 dark:border-white/10">
        {(['Google', 'Microsoft'] as const)
          .filter((provider) => available.has(provider))
          .map((provider) => {
            const Logo = providerLogos[provider]
            const account = linked.find((l) => l.provider === provider)
            return (
              <li key={provider} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <Logo className="size-5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{provider}</p>
                  <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
                    {account ? `${account.email ?? 'Vinculada'} · desde ${formatDateTime(account.createdAt)}` : 'Sin vincular'}
                  </p>
                </div>
                {account ? (
                  <button
                    type="button"
                    disabled={unlink.isPending}
                    onClick={() => unlink.mutate(provider)}
                    className="min-h-10 rounded-lg px-3 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    Desvincular
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={linking !== null}
                    onClick={() => void link(provider)}
                    className="min-h-10 rounded-lg px-3 text-sm font-medium hover:bg-zinc-100 disabled:cursor-wait disabled:opacity-60 dark:hover:bg-white/10"
                  >
                    {linking === provider ? 'Abriendo…' : 'Vincular'}
                  </button>
                )}
              </li>
            )
          })}
      </ul>
      {(error ?? unlink.error?.message) && <p className="text-sm text-red-600 dark:text-red-400">{error ?? unlink.error?.message}</p>}
    </div>
  )
}
