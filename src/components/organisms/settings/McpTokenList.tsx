import { useState } from 'react'
import { Button } from '@/components/atoms/Button'
import { formatWhen } from '@/lib/format'
import type { McpAccessToken, McpServerToolInfo, McpTokenPermissions } from '@/services/api'
import { McpPermissionsPicker } from './McpPermissionsPicker'

interface McpTokenListProps {
  tokens: McpAccessToken[]
  tools: McpServerToolInfo[]
  saving: boolean
  onSavePermissions: (id: string, permissions: McpTokenPermissions) => void
  onRevoke: (id: string) => void
}

export function McpTokenList({ tokens, tools, saving, onSavePermissions, onRevoke }: McpTokenListProps) {
  if (tokens.length === 0) return null
  return (
    <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 dark:divide-white/10 dark:border-white/10">
      {tokens.map((token) => (
        <McpTokenRow key={token.id} token={token} tools={tools} saving={saving} onSave={onSavePermissions} onRevoke={onRevoke} />
      ))}
    </ul>
  )
}

function McpTokenRow({
  token,
  tools,
  saving,
  onSave,
  onRevoke,
}: {
  token: McpAccessToken
  tools: McpServerToolInfo[]
  saving: boolean
  onSave: (id: string, permissions: McpTokenPermissions) => void
  onRevoke: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [permissions, setPermissions] = useState<McpTokenPermissions>({ allowAll: token.allowAll, allowedTools: token.allowedTools })
  const summary = token.allowAll ? 'Acceso total' : `${token.allowedTools.length} de ${tools.length} herramientas`

  return (
    <li className="px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{token.name}</p>
          <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
            {token.prefix}… · {summary} · {token.lastUsedAt ? `usado ${formatWhen(token.lastUsedAt)}` : 'sin usar'}
          </p>
        </div>
        <button type="button" onClick={() => setEditing(!editing)} className="min-h-10 rounded-lg px-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/10">
          {editing ? 'Cerrar' : 'Permisos'}
        </button>
        <button type="button" onClick={() => onRevoke(token.id)} className="min-h-10 rounded-lg px-3 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">
          Revocar
        </button>
      </div>
      {editing && (
        <div className="mt-3 space-y-3">
          <McpPermissionsPicker tools={tools} value={permissions} onChange={setPermissions} />
          <div className="flex justify-end">
            <Button loading={saving} onClick={() => onSave(token.id, permissions)}>
              Guardar permisos
            </Button>
          </div>
        </div>
      )}
    </li>
  )
}
