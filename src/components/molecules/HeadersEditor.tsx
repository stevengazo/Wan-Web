import { useState } from 'react'

/**
 * Headers con credenciales: los guardados no se muestran (solo sus nombres) y se reemplazan en bloque.
 * Devuelve nulo mientras no se decida reemplazarlos.
 */
export function HeadersEditor({ savedNames, onChange }: { savedNames: string[]; onChange: (headers: Record<string, string> | null) => void }) {
  const [replacing, setReplacing] = useState(savedNames.length === 0)
  const [rows, setRows] = useState<{ key: string; value: string }[]>([])

  const emit = (next: { key: string; value: string }[]) => {
    setRows(next)
    onChange(Object.fromEntries(next.filter((r) => r.key.trim()).map((r) => [r.key.trim(), r.value])))
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Headers</p>
      {!replacing ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-slate-500 dark:text-slate-400">Guardados (cifrados):</span>
          {savedNames.map((name) => (
            <code key={name} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-white/10">
              {name}
            </code>
          ))}
          <button
            type="button"
            onClick={() => {
              setReplacing(true)
              emit([{ key: '', value: '' }])
            }}
            className="underline underline-offset-4"
          >
            Reemplazar
          </button>
        </div>
      ) : (
        <>
          {rows.map((row, index) => (
            <div key={index} className="flex gap-2">
              <input
                aria-label="Nombre del header"
                placeholder="Authorization"
                value={row.key}
                onChange={(e) => emit(rows.map((r, i) => (i === index ? { ...r, key: e.target.value } : r)))}
                className="min-h-11 w-2/5 rounded-lg border border-slate-300 bg-white px-3 font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
              />
              <input
                aria-label="Valor del header"
                placeholder="Bearer …"
                type="password"
                autoComplete="off"
                value={row.value}
                onChange={(e) => emit(rows.map((r, i) => (i === index ? { ...r, value: e.target.value } : r)))}
                className="min-h-11 flex-1 rounded-lg border border-slate-300 bg-white px-3 font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
              />
              <button
                type="button"
                aria-label="Quitar header"
                onClick={() => emit(rows.filter((_, i) => i !== index))}
                className="min-h-11 rounded-lg px-3 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                ✕
              </button>
            </div>
          ))}
          <button type="button" onClick={() => emit([...rows, { key: '', value: '' }])} className="text-sm underline underline-offset-4">
            Agregar header
          </button>
          <p className="text-xs text-slate-500 dark:text-slate-400">Se guardan cifrados y no se vuelven a mostrar.</p>
        </>
      )}
    </div>
  )
}
