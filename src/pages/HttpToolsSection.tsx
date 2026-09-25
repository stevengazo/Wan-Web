import { useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import { useDeleteHttpTool, useHttpTools, useSaveHttpTool, useTestHttpTool } from '../api/queries'
import type { HttpTool, HttpToolParameter, HttpToolParameterType } from '../api/types'
import { Button } from '../ui/Button'
import { SelectField, TextAreaField, TextField } from '../ui/Field'
import { HeadersEditor } from '../ui/HeadersEditor'
import { PlusIcon } from '../ui/icons'
import { Switch } from '../ui/Switch'

const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

/** Peticiones a sistemas externos que el bot puede hacer durante la llamada. */
export function HttpToolsSection() {
  const { data: tools, isPending, error } = useHttpTools()
  const [editing, setEditing] = useState<string | 'new' | null>(null)

  return (
    <div className="space-y-3">
      {isPending && <p className="text-slate-500">Cargando…</p>}
      {error && <p className="text-red-600 dark:text-red-400">{error.message}</p>}
      {tools?.map((tool) =>
        editing === tool.id ? (
          <HttpToolEditor key={tool.id} tool={tool} onDone={() => setEditing(null)} />
        ) : (
          <HttpToolRow key={tool.id} tool={tool} onEdit={() => setEditing(tool.id)} />
        ),
      )}
      {editing === 'new' ? (
        <HttpToolEditor onDone={() => setEditing(null)} />
      ) : (
        <AddButton onClick={() => setEditing('new')}>Agregar petición</AddButton>
      )}
    </div>
  )
}

function HttpToolRow({ tool, onEdit }: { tool: HttpTool; onEdit: () => void }) {
  const [testing, setTesting] = useState(false)
  return (
    <div className={`rounded-xl border border-slate-200 p-4 dark:border-white/10 ${tool.enabled ? '' : 'opacity-60'}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2">
            <code className="font-medium">{tool.name}</code>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-white/10">{tool.method}</span>
            {!tool.enabled && <span className="text-xs text-slate-500">Inactiva</span>}
          </p>
          <p className="mt-0.5 truncate font-mono text-xs text-slate-500 dark:text-slate-400">{tool.urlTemplate}</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{tool.description}</p>
        </div>
        <div className="flex gap-1">
          <SmallButton onClick={() => setTesting(!testing)}>{testing ? 'Cerrar prueba' : 'Probar'}</SmallButton>
          <SmallButton onClick={onEdit}>Editar</SmallButton>
        </div>
      </div>
      {testing && <HttpToolTester tool={tool} />}
    </div>
  )
}

function HttpToolTester({ tool }: { tool: HttpTool }) {
  const test = useTestHttpTool()
  const [values, setValues] = useState<Record<string, string>>({})

  const run = (event: FormEvent) => {
    event.preventDefault()
    const args = Object.fromEntries(
      tool.parameters.map((p) => {
        const raw = values[p.name] ?? ''
        return [p.name, p.type === 'Number' ? Number(raw) : p.type === 'Boolean' ? raw === 'true' : raw]
      }),
    )
    test.mutate({ id: tool.id, args })
  }

  return (
    <form onSubmit={run} className="mt-4 space-y-3 border-t border-slate-100 pt-4 dark:border-white/5">
      <div className="grid gap-3 sm:grid-cols-2">
        {tool.parameters.map((p) => (
          <TextField key={p.name} label={p.name} placeholder={p.description ?? ''} value={values[p.name] ?? ''} onChange={(e) => setValues({ ...values, [p.name]: e.target.value })} />
        ))}
      </div>
      <Button type="submit" loading={test.isPending}>
        Ejecutar
      </Button>
      {test.data && (
        <div className="space-y-1 text-sm">
          <p className="break-all font-mono text-xs text-slate-500 dark:text-slate-400">{test.data.url}</p>
          <pre className="max-h-60 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-slate-50 p-3 font-mono text-xs dark:bg-white/5">{test.data.result}</pre>
        </div>
      )}
      {test.error && <p className="text-sm text-red-600 dark:text-red-400">{test.error.message}</p>}
    </form>
  )
}

function HttpToolEditor({ tool, onDone }: { tool?: HttpTool; onDone: () => void }) {
  const save = useSaveHttpTool(tool?.id)
  const remove = useDeleteHttpTool()
  const [name, setName] = useState(tool?.name ?? '')
  const [description, setDescription] = useState(tool?.description ?? '')
  const [method, setMethod] = useState(tool?.method ?? 'GET')
  const [urlTemplate, setUrlTemplate] = useState(tool?.urlTemplate ?? '')
  const [bodyTemplate, setBodyTemplate] = useState(tool?.bodyTemplate ?? '')
  const [headers, setHeaders] = useState<Record<string, string> | null>(null)
  const [parameters, setParameters] = useState<HttpToolParameter[]>(tool?.parameters ?? [])
  const [timeoutSeconds, setTimeoutSeconds] = useState(tool?.timeoutSeconds ?? 10)
  const [enabled, setEnabled] = useState(tool?.enabled ?? true)
  const fieldErrors = save.error instanceof ApiError ? save.error.fieldErrors : {}

  const updateParameter = (index: number, patch: Partial<HttpToolParameter>) =>
    setParameters(parameters.map((p, i) => (i === index ? { ...p, ...patch } : p)))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    save.mutate(
      {
        name, description, method, urlTemplate,
        bodyTemplate: method === 'GET' || method === 'DELETE' ? null : bodyTemplate.trim() || null,
        headers, parameters, timeoutSeconds, enabled,
      },
      { onSuccess: onDone },
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-xl border border-slate-300 p-4 dark:border-white/20">
      <div className="grid gap-4 md:grid-cols-[1fr_120px]">
        <TextField label="Nombre para el bot" placeholder="consultar_pedido" className="font-mono" autoCapitalize="off" spellCheck={false} value={name} onChange={(e) => setName(e.target.value)} error={fieldErrors.name?.[0]} hint="snake_case: así la ve el modelo." />
        <SelectField label="Método" value={method} onChange={(e) => setMethod(e.target.value)} error={fieldErrors.method?.[0]}>
          {methods.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </SelectField>
      </div>
      <TextAreaField
        label="Qué hace y cuándo usarla"
        rows={2}
        placeholder="Consulta el estado y la fecha de entrega de un pedido a partir de su número."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={fieldErrors.description?.[0]}
      />
      <TextField
        label="URL"
        placeholder="https://erp.empresa.com/api/pedidos/{{numero}}"
        className="font-mono"
        autoCapitalize="off"
        spellCheck={false}
        value={urlTemplate}
        onChange={(e) => setUrlTemplate(e.target.value)}
        hint="Usa {{parametro}} donde va un dato; se codifica para URL."
        error={fieldErrors.urlTemplate?.[0]}
      />
      {method !== 'GET' && method !== 'DELETE' && (
        <TextAreaField
          label="Cuerpo JSON"
          rows={4}
          className="font-mono"
          placeholder={'{"numero": {{numero}}, "motivo": {{motivo}}}'}
          value={bodyTemplate}
          onChange={(e) => setBodyTemplate(e.target.value)}
          hint="Los {{marcadores}} van sin comillas: se reemplazan por el valor en JSON."
          error={fieldErrors.bodyTemplate?.[0]}
        />
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Parámetros que completa el bot</p>
        {parameters.map((p, index) => (
          <div key={index} className="grid gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-[1fr_120px_2fr_auto_auto] sm:items-center dark:border-white/10">
            <input aria-label="Nombre" placeholder="numero" value={p.name} onChange={(e) => updateParameter(index, { name: e.target.value })} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 font-mono text-sm dark:border-slate-700 dark:bg-slate-900" />
            <select aria-label="Tipo" value={p.type} onChange={(e) => updateParameter(index, { type: e.target.value as HttpToolParameterType })} className="min-h-11 rounded-lg border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900">
              <option value="String">Texto</option>
              <option value="Number">Número</option>
              <option value="Boolean">Sí/No</option>
            </select>
            <input aria-label="Descripción" placeholder="Número de pedido que da quien llama" value={p.description ?? ''} onChange={(e) => updateParameter(index, { description: e.target.value })} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input type="checkbox" checked={p.required} onChange={(e) => updateParameter(index, { required: e.target.checked })} className="size-4 accent-slate-900 dark:accent-white" />
              Obligatorio
            </label>
            <button type="button" aria-label="Quitar parámetro" onClick={() => setParameters(parameters.filter((_, i) => i !== index))} className="min-h-11 rounded-lg px-3 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">
              ✕
            </button>
          </div>
        ))}
        <button type="button" onClick={() => setParameters([...parameters, { name: '', type: 'String', description: null, required: true }])} className="text-sm underline underline-offset-4">
          Agregar parámetro
        </button>
      </div>

      <HeadersEditor savedNames={tool?.headerNames ?? []} onChange={setHeaders} />

      <div className="grid gap-4 sm:grid-cols-[140px_1fr] sm:items-end">
        <TextField label="Espera máx. (s)" type="number" min={1} max={30} value={timeoutSeconds} onChange={(e) => setTimeoutSeconds(e.target.valueAsNumber || 10)} error={fieldErrors.timeoutSeconds?.[0]} />
        <Switch label="Activa" description="El bot solo ve las activas." checked={enabled} onChange={setEnabled} />
      </div>

      {save.error && Object.keys(fieldErrors).length === 0 && <p className="text-sm text-red-600 dark:text-red-400">{save.error.message}</p>}
      <EditorActions onCancel={onDone} saving={save.isPending} onDelete={tool ? () => remove.mutate(tool.id, { onSuccess: onDone }) : undefined} />
    </form>
  )
}

export function EditorActions({ onCancel, onDelete, saving }: { onCancel: () => void; onDelete?: () => void; saving: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      {onDelete ? (
        <button type="button" onClick={onDelete} className="min-h-10 rounded-lg px-3 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">
          Eliminar
        </button>
      ) : (
        <span />
      )}
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={saving}>
          Guardar
        </Button>
      </div>
    </div>
  )
}

export function SmallButton({ onClick, children, disabled }: { onClick: () => void; children: string; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="min-h-10 rounded-lg px-3 text-sm font-medium hover:bg-slate-100 disabled:opacity-60 dark:hover:bg-white/10">
      {children}
    </button>
  )
}

export function AddButton({ onClick, children }: { onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 text-sm font-medium text-slate-600 hover:border-slate-400 hover:text-slate-900 dark:border-white/15 dark:text-slate-300 dark:hover:border-white/30 dark:hover:text-white"
    >
      <PlusIcon />
      {children}
    </button>
  )
}
