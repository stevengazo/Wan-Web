import { useState } from 'react'
import { CopyField } from '@/components/molecules/CopyField'

type Client = 'claude-code' | 'cursor' | 'claude-desktop'

const clients: { id: Client; label: string }[] = [
  { id: 'claude-code', label: 'Claude Code' },
  { id: 'cursor', label: 'Cursor y otros' },
  { id: 'claude-desktop', label: 'Claude Desktop' },
]

/**
 * Cómo conectar un cliente MCP al servidor de Mapache. Con un token recién creado los comandos ya lo
 * incluyen; si no, muestran dónde va.
 */
export function McpSetupGuide({ url, token }: { url: string; token?: string }) {
  const [client, setClient] = useState<Client>('claude-code')
  const value = token ?? '<tu-token>'

  const snippets: Record<Client, { steps: string[]; label: string; code: string }> = {
    'claude-code': {
      steps: ['Crea un token abajo.', 'Ejecuta el comando en la terminal del proyecto donde lo quieras usar.', 'Abre Claude Code: las herramientas aparecen como mcp__mapache__…'],
      label: 'Comando',
      code: `claude mcp add --transport http mapache ${url} --header "Authorization: Bearer ${value}"`,
    },
    cursor: {
      steps: ['Crea un token abajo.', 'Agrega esto al archivo de servidores MCP del cliente (en Cursor, .cursor/mcp.json).', 'Recarga el cliente.'],
      label: 'Configuración JSON',
      code: JSON.stringify({ mcpServers: { mapache: { url, headers: { Authorization: `Bearer ${value}` } } } }, null, 2),
    },
    'claude-desktop': {
      steps: [
        'Crea un token abajo.',
        'En Claude Desktop: Configuración → Desarrollador → Editar configuración, y agrega este servidor.',
        'Usa el puente mcp-remote (necesita Node.js) porque la configuración local no acepta headers. Reinicia Claude Desktop.',
      ],
      label: 'claude_desktop_config.json',
      code: JSON.stringify(
        { mcpServers: { mapache: { command: 'npx', args: ['-y', 'mcp-remote', url, '--header', `Authorization: Bearer ${value}`] } } },
        null,
        2,
      ),
    },
  }
  const current = snippets[client]

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Cliente MCP" className="flex flex-wrap gap-1">
        {clients.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={client === c.id}
            onClick={() => setClient(c.id)}
            className="min-h-10 rounded-lg px-3 text-sm font-medium text-zinc-500 aria-selected:bg-zinc-100 aria-selected:text-zinc-900 dark:text-zinc-400 dark:aria-selected:bg-white/10 dark:aria-selected:text-white"
          >
            {c.label}
          </button>
        ))}
      </div>
      <ol className="list-decimal space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300">
        {current.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <CopyField label={current.label} value={current.code} multiline />
    </div>
  )
}
