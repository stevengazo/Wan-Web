import type { ReactNode } from 'react'

/** Bloque de formulario: título y descripción a la izquierda desde md:, campos a la derecha. */
export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 py-8 md:grid-cols-[220px_1fr] md:gap-10">
      <div>
        <h2 className="font-medium">{title}</h2>
        {description && <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>}
      </div>
      <div className="max-w-md space-y-5">{children}</div>
    </section>
  )
}

/** Contenedor de secciones separadas por una línea. */
export function FormSections({ children }: { children: ReactNode }) {
  return (
    <div className="divide-y divide-zinc-200 border-t border-zinc-200 dark:divide-white/10 dark:border-white/10">{children}</div>
  )
}
