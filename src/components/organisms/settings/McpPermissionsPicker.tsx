import { Switch } from '@/components/atoms/Switch'
import type { McpServerToolInfo, McpTokenPermissions } from '@/services/api'

interface McpPermissionsPickerProps {
  tools: McpServerToolInfo[]
  value: McpTokenPermissions
  onChange: (value: McpTokenPermissions) => void
}

/** Acceso total o herramienta por herramienta, separando las que solo consultan de las que modifican. */
export function McpPermissionsPicker({ tools, value, onChange }: McpPermissionsPickerProps) {
  const toggle = (name: string, allowed: boolean) =>
    onChange({
      allowAll: false,
      allowedTools: allowed ? [...value.allowedTools, name] : value.allowedTools.filter((t) => t !== name),
    })

  const groups = [
    { title: 'Consultar', items: tools.filter((t) => t.readOnly) },
    { title: 'Modificar datos', items: tools.filter((t) => !t.readOnly) },
  ].filter((g) => g.items.length > 0)

  return (
    <div className="space-y-3">
      <Switch
        label="Acceso total"
        description="Todas las herramientas, incluidas las que se agreguen en el futuro."
        checked={value.allowAll}
        onChange={(allowAll) => onChange({ allowAll, allowedTools: allowAll ? [] : tools.filter((t) => t.readOnly).map((t) => t.name) })}
      />
      {!value.allowAll &&
        groups.map((group) => (
          <fieldset key={group.title} className="rounded-lg border border-slate-200 px-3 pb-1 pt-2 dark:border-white/10">
            <legend className="px-1 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{group.title}</legend>
            {group.items.map((tool) => (
              <Switch
                key={tool.name}
                label={tool.name}
                description={tool.description}
                checked={value.allowedTools.includes(tool.name)}
                onChange={(allowed) => toggle(tool.name, allowed)}
              />
            ))}
          </fieldset>
        ))}
    </div>
  )
}
