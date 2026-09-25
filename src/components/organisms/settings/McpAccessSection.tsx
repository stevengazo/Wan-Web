import { useState, type FormEvent } from 'react'
import { Button } from '@/components/atoms/Button'
import { CopyField } from '@/components/molecules/CopyField'
import { TextField } from '@/components/molecules/Field'
import { FormSection, FormSections } from '@/components/organisms/FormSection'
import {
  useCreateMcpToken,
  useMcpServerTools,
  useMcpTokens,
  useRevokeMcpToken,
  usePublicUrl,
  useUpdateMcpToken,
  type McpTokenPermissions,
} from '@/services/api'
import { McpPermissionsPicker } from './McpPermissionsPicker'
import { McpSetupGuide } from './McpSetupGuide'
import { McpTokenList } from './McpTokenList'

/** Servidor MCP de Mapache: cómo conectarlo, tokens y qué puede hacer cada uno. */
export function McpAccessSection() {
  const { data: tokens } = useMcpTokens()
  const { data: tools = [] } = useMcpServerTools()
  const create = useCreateMcpToken()
  const update = useUpdateMcpToken()
  const revoke = useRevokeMcpToken()
  const [name, setName] = useState('')
  const [permissions, setPermissions] = useState<McpTokenPermissions>({ allowAll: true, allowedTools: [] })
  const url = `${usePublicUrl()}/api/mcp`

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (name.trim()) create.mutate({ name: name.trim(), ...permissions }, { onSuccess: () => setName('') })
  }

  return (
    <FormSections>
      <FormSection
        title="Servidor MCP de Mapache"
        description="Para que Claude, Cursor u otro agente consulten y operen Mapache: recados, formularios, directorio y conocimiento."
      >
        <CopyField label="URL" value={url} />
        <McpSetupGuide url={url} token={create.data?.value} />
      </FormSection>

      <FormSection title="Nuevo token" description="Cada cliente con su token: se puede revocar por separado y limitar a lo que necesita.">
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField label="Nombre" placeholder="Claude Desktop de Ana" value={name} onChange={(e) => setName(e.target.value)} />
          <McpPermissionsPicker tools={tools} value={permissions} onChange={setPermissions} />
          <Button type="submit" loading={create.isPending} disabled={!name.trim() || (!permissions.allowAll && permissions.allowedTools.length === 0)}>
            Crear token
          </Button>
        </form>

        {create.data && (
          <div className="space-y-3 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Copia el token ahora: no se vuelve a mostrar. Los comandos de arriba ya lo incluyen.
            </p>
            <CopyField label="Token" value={create.data.value} />
          </div>
        )}
      </FormSection>

      {tokens && tokens.length > 0 && (
        <FormSection title="Tokens" description="Revoca los que ya no se usen.">
          <McpTokenList
            tokens={tokens}
            tools={tools}
            saving={update.isPending}
            onSavePermissions={(id, value) => update.mutate({ id, ...value })}
            onRevoke={(id) => revoke.mutate(id)}
          />
        </FormSection>
      )}
    </FormSections>
  )
}
