/** Marca de Mapache: onda de voz en un cuadrado y el nombre en serif, como la marca de Savegre. */
export function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-lg bg-brand-600 text-white dark:bg-brand-600 dark:text-white">
        <svg viewBox="0 0 24 24" className="size-4.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
          <path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2" />
        </svg>
      </span>
      <span className="font-display text-2xl leading-none">
        Mapache<span className="text-brand-500">.</span>
      </span>
    </span>
  )
}
