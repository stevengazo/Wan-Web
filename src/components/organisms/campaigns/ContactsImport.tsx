import { useState } from 'react'
import { UploadIcon } from '@/components/atoms/icons'
import { Button } from '@/components/atoms/Button'
import { TextAreaField } from '@/components/molecules/Field'
import type { ImportContactsResult } from '@/services/api'

interface ContactsImportProps {
  importing: boolean
  result: ImportContactsResult | undefined
  onImport: (csv: string) => void
}

/** Carga de contactos desde un CSV (archivo o texto pegado de Excel / Google Sheets). */
export function ContactsImport({ importing, result, onImport }: ContactsImportProps) {
  const [csv, setCsv] = useState('')

  const readFile = async (file: File | undefined) => {
    if (file) setCsv(await file.text())
  }

  return (
    <div className="space-y-3 border border-zinc-200 p-5 dark:border-white/10">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Primera fila con los nombres de columna. Obligatoria una de teléfono (<code>telefono</code>, <code>phone</code>, <code>numero</code>); opcional <code>nombre</code>. El resto de
        las columnas quedan como variables del guion. Los números repetidos se saltean.
      </p>
      <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 border border-zinc-300 px-4 text-xs font-semibold uppercase tracking-[0.2em] hover:border-zinc-900 dark:border-white/15 dark:hover:border-white/40">
        <UploadIcon className="size-4" />
        Elegir archivo CSV
        <input type="file" accept=".csv,text/csv,text/plain" className="sr-only" onChange={(e) => void readFile(e.target.files?.[0])} />
      </label>
      <TextAreaField
        label="O pega los datos"
        rows={5}
        spellCheck={false}
        placeholder={'nombre;telefono;fecha\nAna Mora;88881234;15 de octubre'}
        value={csv}
        onChange={(e) => setCsv(e.target.value)}
      />
      <div className="flex flex-wrap items-center justify-end gap-3">
        {result && (
          <p className="mr-auto text-sm">
            <span className="text-emerald-600 dark:text-emerald-400">{result.imported} importados</span>
            {result.skipped > 0 && <span className="text-zinc-500"> · {result.skipped} ya estaban</span>}
            {result.problems.length > 0 && <span className="text-amber-600 dark:text-amber-400"> · {result.problems.length} con problemas</span>}
          </p>
        )}
        <Button onClick={() => onImport(csv)} disabled={!csv.trim()} loading={importing}>
          Importar
        </Button>
      </div>
      {result && result.problems.length > 0 && (
        <ul className="max-h-32 overflow-y-auto text-xs text-amber-700 dark:text-amber-400">
          {result.problems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
