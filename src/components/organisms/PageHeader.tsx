import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router'
import { ChevronLeftIcon, PlusIcon } from '@/components/atoms/icons'

/** Título de página en serif con subtítulo, enlace para volver y acción principal opcionales. */
export function PageHeader(props: { title: ReactNode; subtitle?: ReactNode; back?: { to: string; label: string }; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {props.back && (
            <Link
              to={props.back.to}
              aria-label={props.back.label}
              className="-ml-3 flex size-11 shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/10"
            >
              <ChevronLeftIcon />
            </Link>
          )}
          <h1 className="truncate font-display text-4xl md:text-5xl">{props.title}</h1>
        </div>
        {props.subtitle && <p className="mt-2 max-w-xl text-zinc-500 dark:text-zinc-400">{props.subtitle}</p>}
      </div>
      {props.action && <div className="shrink-0">{props.action}</div>}
    </div>
  )
}

/**
 * Botón "nuevo": en el encabezado desde md: y flotante sobre la barra inferior en móvil. El flotante va en
 * un portal porque la animación de página aplica transform y rompería el position: fixed.
 */
export function CreateButton({ to, label }: { to: string; label: string }) {
  return (
    <>
      <Link
        to={to}
        className="hidden min-h-11 items-center gap-2 rounded-lg bg-brand-600 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-brand-500 md:inline-flex dark:bg-brand-600 dark:text-white dark:hover:bg-brand-500"
      >
        <PlusIcon />
        {label}
      </Link>
      {createPortal(
        <Link
          to={to}
          aria-label={label}
          className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-20 flex size-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30 md:hidden dark:bg-brand-600 dark:text-white"
        >
          <PlusIcon />
        </Link>,
        document.body,
      )}
    </>
  )
}

/** Estado vacío de una lista. */
export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-white/15">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{children}</p>
    </div>
  )
}
