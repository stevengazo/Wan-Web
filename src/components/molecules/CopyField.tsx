import { useState } from 'react'
import { CopyIcon } from '@/components/atoms/icons'

interface CopyFieldProps {
  label: string
  value: string
  /** Texto largo (comandos, JSON): se muestra en varias líneas. */
  multiline?: boolean
}

/** Valor de solo lectura con botón para copiarlo al portapapeles. */
export function CopyField({ label, value, multiline = false }: CopyFieldProps) {
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
      <div className="mt-1.5 flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 py-1 pl-3 pr-1 dark:border-white/10 dark:bg-white/5">
        <pre className={`min-w-0 flex-1 py-1.5 font-mono text-xs ${multiline ? 'whitespace-pre-wrap break-all' : 'truncate'}`}>{value}</pre>
        <button
          type="button"
          onClick={copy}
          aria-label={`Copiar ${label}`}
          className="flex min-h-9 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium hover:bg-slate-200/60 dark:hover:bg-white/10"
        >
          <CopyIcon />
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  )
}
