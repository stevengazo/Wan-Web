import { useState, type FormEvent } from 'react'
import { useCreateMcpToken, useMcpTokens, useRevokeMcpToken } from '@/services/api/queries'
import { Button } from '@/components/atoms/Button'
import { TextField } from '@/components/molecules/Field'
import { FormSection, FormSections } from '@/components/organisms/FormSection'
import { formatWhen } from '@/lib/format'
import { CopyIcon } from '@/components/atoms/icons'

/** Servidor MCP de Mapache: URL, tokens y cómo configurarlo en un cliente. */
export function McpAccessSection() {
  const { data: tokens } = useMcpTokens()
  const create = useCreateMcpToken()
  const revoke = useRevokeMcpToken()
  const [name, setName] = useState('')
  const url = `${window.location.origin}/api/mcp`

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (name.trim()) create.mutate(name.trim(), { onSuccess: () => setName('') })
  }

  return (
    <FormSections>
      <FormSection
        title="Servidor MCP de Mapache"
        description="Para que Claude, Cursor u otro agente consulten recados, formularios, directorio y conocimiento."
      >
        <Copyable label="URL" value={url} />

        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex-1">
            <TextField label="Nuevo token" placeholder="Claude Desktop de Ana" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <Button type="submit" loading={create.isPending} disabled={!name.trim()}>
            Crear
          </Button>
        </form>

        {create.data && (
          <div className="space-y-3 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Copia el token ahora: no se vuelve a mostrar.</p>
            <Copyable label="Token" value={create.data.value} />
            <Copyable label="Claude Code" value={`claude mcp add --transport http mapache ${url} --header "Authorization: Bearer ${create.data.value}"`} />
            <Copyable
              label="Configuración JSON (Cursor y otros)"
              value={JSON.stringify({ mcpServers: { mapache: { url, headers: { Authorization: `Bearer ${create.data.value}` } } } }, null, 2)}
            />
          </div>
        )}

        {tokens && tokens.length > 0 && (
          <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 dark:divide-white/10 dark:border-white/10">
            {tokens.map((token) => (
              <li key={token.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{token.name}</p>
                  <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    {token.prefix}… · {token.lastUsedAt ? `usado ${formatWhen(token.lastUsedAt)}` : 'sin usar'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => revoke.mutate(token.id)}
                  disabled={revoke.isPending}
                  className="min-h-10 rounded-lg px-3 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  Revocar
                </button>
              </li>
            ))}
          </ul>
        )}
      </FormSection>
    </FormSections>
  )
}

function Copyable({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Sin permiso de portapapeles: el valor sigue visible para copiarlo a mano.
    }
  }

  return (
    <div>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
      <div className="mt-1.5 flex items-start gap-2 rounded-lg border border-slate-200 bg-white py-1 pl-3 pr-1 dark:border-white/10 dark:bg-white/5">
        <pre className="min-w-0 flex-1 overflow-x-auto whitespace-pre-wrap break-all py-1.5 font-mono text-xs">{value}</pre>
        <button type="button" onClick={copy} aria-label={`Copiar ${label}`} className="flex min-h-9 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium hover:bg-slate-200/60 dark:hover:bg-white/10">
          <CopyIcon />
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  )
}
