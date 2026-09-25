import { useState, type FormEvent } from 'react'
import { ApiError } from '@/services/api/client'
import { useDeleteMcpServer, useMcpServers, useSaveMcpServer, useSyncMcpServer, useTestMcpTool } from '@/services/api'
import type { McpServer } from '@/services/api'
import { Button } from '@/components/atoms/Button'
import { TextAreaField, TextField } from '@/components/molecules/Field'
import { formatWhen } from '@/lib/format'
import { HeadersEditor } from '@/components/molecules/HeadersEditor'
import { Switch } from '@/components/atoms/Switch'
import { AddButton, EditorActions, SmallButton } from '@/components/organisms/tools/HttpToolsSection'

/** Servidores MCP externos cuyas herramientas usa el bot. */
export function McpServersSection() {
  const { data: servers, isPending, error } = useMcpServers()
  const [editing, setEditing] = useState<string | 'new' | null>(null)

  return (
    <div className="space-y-3">
      {isPending && <p className="text-zinc-500">Cargando…</p>}
      {error && <p className="text-red-600 dark:text-red-400">{error.message}</p>}
      {servers?.map((server) =>
        editing === server.id ? (
          <McpServerEditor key={server.id} server={server} onDone={() => setEditing(null)} />
        ) : (
          <McpServerCard key={server.id} server={server} onEdit={() => setEditing(server.id)} />
        ),
      )}
      {editing === 'new' ? <McpServerEditor onDone={() => setEditing(null)} /> : <AddButton onClick={() => setEditing('new')}>Conectar servidor MCP</AddButton>}
    </div>
  )
}

function McpServerCard({ server, onEdit }: { server: McpServer; onEdit: () => void }) {
  const sync = useSyncMcpServer()
  const save = useSaveMcpServer(server.id)
  const [testing, setTesting] = useState<string | null>(null)
  const enabledTools = server.tools.filter((t) => t.enabled).length

  const toggleTool = (name: string) => {
    const disabled = server.tools.filter((t) => (t.name === name ? t.enabled : !t.enabled)).map((t) => t.name)
    save.mutate({ name: server.name, url: server.url, headers: null, disabledTools: disabled, enabled: server.enabled })
  }

  return (
    <div className={`rounded-xl border border-zinc-200 p-4 dark:border-white/10 ${server.enabled ? '' : 'opacity-60'}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-medium">
            <span className={`size-2 rounded-full ${server.lastError ? 'bg-red-500' : 'bg-emerald-500'}`} />
            {server.name}
            {!server.enabled && <span className="text-xs font-normal text-zinc-500">Inactivo</span>}
          </p>
          <p className="mt-0.5 truncate font-mono text-xs text-zinc-500 dark:text-zinc-400">{server.url}</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {server.lastError ?? `${enabledTools} de ${server.tools.length} herramientas habilitadas`}
            {server.lastSyncedAt && ` · leído ${formatWhen(server.lastSyncedAt)}`}
          </p>
        </div>
        <div className="flex gap-1">
          <SmallButton onClick={() => sync.mutate(server.id)} disabled={sync.isPending}>
            {sync.isPending ? 'Leyendo…' : 'Volver a leer'}
          </SmallButton>
          <SmallButton onClick={onEdit}>Editar</SmallButton>
        </div>
      </div>

      {server.tools.length > 0 && (
        <ul className="mt-4 divide-y divide-zinc-100 border-t border-zinc-100 dark:divide-white/5 dark:border-white/5">
          {server.tools.map((tool) => (
            <li key={tool.name} className="py-2">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  aria-label={`Permitir ${tool.name}`}
                  checked={tool.enabled}
                  disabled={save.isPending}
                  onChange={() => toggleTool(tool.name)}
                  className="mt-1 size-4 accent-zinc-900 dark:accent-white"
                />
                <div className="min-w-0 flex-1">
                  <code className="text-sm font-medium">{tool.name}</code>
                  {tool.description && <p className="line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">{tool.description}</p>}
                </div>
                <button type="button" onClick={() => setTesting(testing === tool.name ? null : tool.name)} className="shrink-0 text-xs underline underline-offset-4">
                  {testing === tool.name ? 'Cerrar' : 'Probar'}
                </button>
              </div>
              {testing === tool.name && <McpToolTester serverId={server.id} tool={tool.name} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function McpToolTester({ serverId, tool }: { serverId: string; tool: string }) {
  const test = useTestMcpTool()
  const [args, setArgs] = useState('{}')
  const [parseError, setParseError] = useState<string | null>(null)

  const run = (event: FormEvent) => {
    event.preventDefault()
    try {
      const parsed = JSON.parse(args) as Record<string, unknown>
      setParseError(null)
      test.mutate({ id: serverId, tool, args: parsed })
    } catch {
      setParseError('Los argumentos deben ser JSON válido')
    }
  }

  return (
    <form onSubmit={run} className="mt-3 space-y-2 pl-7">
      <TextAreaField label="Argumentos (JSON)" rows={3} className="font-mono" value={args} onChange={(e) => setArgs(e.target.value)} error={parseError ?? undefined} />
      <Button type="submit" loading={test.isPending}>
        Ejecutar
      </Button>
      {test.data && <pre className="max-h-60 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-zinc-50 p-3 font-mono text-xs dark:bg-white/5">{test.data.result}</pre>}
      {test.error && <p className="text-sm text-red-600 dark:text-red-400">{test.error.message}</p>}
    </form>
  )
}

function McpServerEditor({ server, onDone }: { server?: McpServer; onDone: () => void }) {
  const save = useSaveMcpServer(server?.id)
  const remove = useDeleteMcpServer()
  const [name, setName] = useState(server?.name ?? '')
  const [url, setUrl] = useState(server?.url ?? '')
  const [headers, setHeaders] = useState<Record<string, string> | null>(null)
  const [enabled, setEnabled] = useState(server?.enabled ?? true)
  const fieldErrors = save.error instanceof ApiError ? save.error.fieldErrors : {}

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const disabledTools = server?.tools.filter((t) => !t.enabled).map((t) => t.name) ?? null
    save.mutate({ name, url, headers, disabledTools, enabled }, { onSuccess: onDone })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-xl border border-zinc-300 p-4 dark:border-white/20">
      <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
        <TextField label="Nombre" placeholder="GitHub" value={name} onChange={(e) => setName(e.target.value)} error={fieldErrors.name?.[0]} hint="Prefijo de sus herramientas para el bot." />
        <TextField label="URL del servidor" placeholder="https://mcp.empresa.com/mcp" className="font-mono" autoCapitalize="off" spellCheck={false} value={url} onChange={(e) => setUrl(e.target.value)} error={fieldErrors.url?.[0]} hint="Streamable HTTP o SSE." />
      </div>
      <HeadersEditor savedNames={server?.headerNames ?? []} onChange={setHeaders} />
      <Switch label="Activo" description="Al guardar se conecta y lee sus herramientas." checked={enabled} onChange={setEnabled} />
      {save.error && Object.keys(fieldErrors).length === 0 && <p className="text-sm text-red-600 dark:text-red-400">{save.error.message}</p>}
      <EditorActions onCancel={onDone} saving={save.isPending} onDelete={server ? () => remove.mutate(server.id, { onSuccess: onDone }) : undefined} />
    </form>
  )
}
